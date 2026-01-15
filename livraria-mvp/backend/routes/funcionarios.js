const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os funcionários
router.get('/', (req, res) => {
  try {
    const funcionarios = db.prepare(`
      SELECT f.*,
             COUNT(p.id_pedido) as total_atendimentos,
             COALESCE(SUM(p.valor_total), 0) as total_vendas
      FROM FUNCIONARIO f
      LEFT JOIN PEDIDO p ON f.id_funcionario = p.id_funcionario
      GROUP BY f.id_funcionario
      ORDER BY f.nome
    `).all();
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar funcionário por ID
router.get('/:id', (req, res) => {
  try {
    const funcionario = db.prepare('SELECT * FROM FUNCIONARIO WHERE id_funcionario = ?').get(req.params.id);
    
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }
    
    const vendas = db.prepare(`
      SELECT p.*, c.nome as nome_cliente
      FROM PEDIDO p
      INNER JOIN CLIENTE c ON p.id_cliente = c.id_cliente
      WHERE p.id_funcionario = ?
      ORDER BY p.data_pedido DESC
    `).all(req.params.id);
    
    res.json({ ...funcionario, vendas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo funcionário
router.post('/', (req, res) => {
  try {
    const result = db.prepare(`
      INSERT INTO FUNCIONARIO (nome, cpf, cargo, email, telefone, salario, nivel_acesso, data_admissao, comissao_percentual) 
       VALUES (?, ?, ?, ?, ?, ?, ?, date('now'), ?)
    `).run(
      req.body.nome,
      req.body.cpf,
      req.body.cargo,
      req.body.email,
      req.body.telefone,
      req.body.salario,
      req.body.nivel_acesso,
      req.body.comissao_percentual || 0
    );
    res.status(201).json({ id_funcionario: result.lastInsertRowid, message: 'Funcionário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar funcionário
router.put('/:id', (req, res) => {
  try {
    db.prepare(`
      UPDATE FUNCIONARIO SET 
       nome = ?, cpf = ?, cargo = ?, email = ?, telefone = ?, 
       salario = ?, nivel_acesso = ?, comissao_percentual = ?
       WHERE id_funcionario = ?
    `).run(
      req.body.nome,
      req.body.cpf,
      req.body.cargo,
      req.body.email,
      req.body.telefone,
      req.body.salario,
      req.body.nivel_acesso,
      req.body.comissao_percentual,
      req.params.id
    );
    res.json({ message: 'Funcionário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar funcionário
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM FUNCIONARIO WHERE id_funcionario = ?').run(req.params.id);
    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
