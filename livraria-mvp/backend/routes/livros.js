const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os livros
router.get('/', (req, res) => {
  try {
    const livros = db.prepare(`
      SELECT l.*, 
             GROUP_CONCAT(f.nome_empresa, ', ') as fornecedores
      FROM LIVRO l
      LEFT JOIN LIVRO_FORNECEDOR lf ON l.id_livro = lf.id_livro
      LEFT JOIN FORNECEDOR f ON lf.id_fornecedor = f.id_fornecedor
      GROUP BY l.id_livro
      ORDER BY l.titulo
    `).all();
    res.json(livros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar livro por ID
router.get('/:id', (req, res) => {
  try {
    const livro = db.prepare('SELECT * FROM LIVRO WHERE id_livro = ?').get(req.params.id);
    
    if (!livro) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    
    const fornecedores = db.prepare(`
      SELECT f.* FROM FORNECEDOR f
      INNER JOIN LIVRO_FORNECEDOR lf ON f.id_fornecedor = lf.id_fornecedor
      WHERE lf.id_livro = ?
    `).all(req.params.id);
    
    res.json({ ...livro, fornecedores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo livro
router.post('/', (req, res) => {
  const transaction = db.transaction((data) => {
    const { fornecedores, ...livroData } = data;
    
    const result = db.prepare(`
      INSERT INTO LIVRO (titulo, autor, editora, edicao, ano_publicacao, genero, 
       isbn, tipo_livro, quantidade_estoque, preco) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      livroData.titulo,
      livroData.autor,
      livroData.editora,
      livroData.edicao,
      livroData.ano_publicacao,
      livroData.genero,
      livroData.isbn,
      livroData.tipo_livro,
      livroData.quantidade_estoque,
      livroData.preco
    );
    
    const livroId = result.lastInsertRowid;
    
    if (fornecedores && fornecedores.length > 0) {
      const insertFornecedor = db.prepare(
        'INSERT INTO LIVRO_FORNECEDOR (id_livro, id_fornecedor) VALUES (?, ?)'
      );
      
      for (const fornecedorId of fornecedores) {
        insertFornecedor.run(livroId, fornecedorId);
      }
    }
    
    return livroId;
  });
  
  try {
    const livroId = transaction(req.body);
    res.status(201).json({ id_livro: livroId, message: 'Livro criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar livro
router.put('/:id', (req, res) => {
  const transaction = db.transaction((id, data) => {
    const { fornecedores, ...livroData } = data;
    
    db.prepare(`
      UPDATE LIVRO SET 
       titulo = ?, autor = ?, editora = ?, edicao = ?, ano_publicacao = ?,
       genero = ?, isbn = ?, tipo_livro = ?, quantidade_estoque = ?, preco = ?
       WHERE id_livro = ?
    `).run(
      livroData.titulo,
      livroData.autor,
      livroData.editora,
      livroData.edicao,
      livroData.ano_publicacao,
      livroData.genero,
      livroData.isbn,
      livroData.tipo_livro,
      livroData.quantidade_estoque,
      livroData.preco,
      id
    );
    
    if (fornecedores) {
      db.prepare('DELETE FROM LIVRO_FORNECEDOR WHERE id_livro = ?').run(id);
      
      const insertFornecedor = db.prepare(
        'INSERT INTO LIVRO_FORNECEDOR (id_livro, id_fornecedor) VALUES (?, ?)'
      );
      
      for (const fornecedorId of fornecedores) {
        insertFornecedor.run(id, fornecedorId);
      }
    }
  });
  
  try {
    transaction(req.params.id, req.body);
    res.json({ message: 'Livro atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar livro
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM LIVRO WHERE id_livro = ?').run(req.params.id);
    res.json({ message: 'Livro deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
