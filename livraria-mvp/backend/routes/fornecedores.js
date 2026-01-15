const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os fornecedores
router.get('/', (req, res) => {
  try {
    const fornecedores = db.prepare(`
      SELECT f.*,
             COUNT(DISTINCT lf.id_livro) as total_livros
      FROM FORNECEDOR f
      LEFT JOIN LIVRO_FORNECEDOR lf ON f.id_fornecedor = lf.id_fornecedor
      GROUP BY f.id_fornecedor
      ORDER BY f.nome_empresa
    `).all();
    res.json(fornecedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar fornecedor por ID
router.get('/:id', (req, res) => {
  try {
    const fornecedor = db.prepare('SELECT * FROM FORNECEDOR WHERE id_fornecedor = ?').get(req.params.id);
    
    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    
    const livros = db.prepare(`
      SELECT l.* FROM LIVRO l
      INNER JOIN LIVRO_FORNECEDOR lf ON l.id_livro = lf.id_livro
      WHERE lf.id_fornecedor = ?
    `).all(req.params.id);
    
    res.json({ ...fornecedor, livros });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo fornecedor
router.post('/', (req, res) => {
  try {
    const result = db.prepare(`
      INSERT INTO FORNECEDOR (nome_empresa, email, cnpj, telefone, endereco, nome_responsavel, data_cadastro) 
       VALUES (?, ?, ?, ?, ?, ?, date('now'))
    `).run(
      req.body.nome_empresa,
      req.body.email,
      req.body.cnpj,
      req.body.telefone,
      req.body.endereco,
      req.body.nome_responsavel
    );
    res.status(201).json({ id_fornecedor: result.lastInsertRowid, message: 'Fornecedor criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar fornecedor
router.put('/:id', (req, res) => {
  try {
    db.prepare(`
      UPDATE FORNECEDOR SET 
       nome_empresa = ?, email = ?, cnpj = ?, telefone = ?, endereco = ?, nome_responsavel = ?
       WHERE id_fornecedor = ?
    `).run(
      req.body.nome_empresa,
      req.body.email,
      req.body.cnpj,
      req.body.telefone,
      req.body.endereco,
      req.body.nome_responsavel,
      req.params.id
    );
    res.json({ message: 'Fornecedor atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar fornecedor
router.delete('/:id', (req, res) => {
  try {
    // Verifica se o fornecedor está associado a algum livro
    const vinculo = db.prepare(`
      SELECT COUNT(*) AS total
      FROM LIVRO_FORNECEDOR
      WHERE id_fornecedor = ?
    `).get(req.params.id);

    if (vinculo.total > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir o fornecedor pois existem livros associados a ele.'
      });
    }

    const result = db.prepare(`
      DELETE FROM FORNECEDOR
      WHERE id_fornecedor = ?
    `).run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({ message: 'Fornecedor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
