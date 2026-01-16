const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
  try {
    const { busca } = req.query;

    let query = `
      SELECT c.*,
             COUNT(p.id_pedido) AS total_pedidos,
             COALESCE(SUM(p.valor_total), 0) AS total_gasto
      FROM CLIENTE c
      LEFT JOIN PEDIDO p ON c.id_cliente = p.id_cliente
    `;

    const params = [];

    if (busca && busca.trim() !== '') {
      query += `
        WHERE LOWER(c.nome) LIKE LOWER(?)
           OR LOWER(c.cpf_cnpj) LIKE LOWER(?)
      `;
      params.push(`%${busca}%`, `%${busca}%`);
    }

    query += ` GROUP BY c.id_cliente ORDER BY c.nome`;

    const clientes = db.prepare(query).all(...params);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', (req, res) => {
  try {
    const cliente = db.prepare('SELECT * FROM CLIENTE WHERE id_cliente = ?').get(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    const pedidos = db.prepare(`
      SELECT p.*, f.nome as nome_funcionario
      FROM PEDIDO p
      LEFT JOIN FUNCIONARIO f ON p.id_funcionario = f.id_funcionario
      WHERE p.id_cliente = ?
      ORDER BY p.data_pedido DESC
    `).all(req.params.id);
    
    res.json({ ...cliente, pedidos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const result = db.prepare(`
      INSERT INTO CLIENTE (nome, cpf_cnpj, email, endereco, telefone, tipo_cliente, data_cadastro, numero_compras) 
        VALUES (?, ?, ?, ?, ?, ?, date('now'), 0)
    `).run(
      req.body.nome,
      req.body.cpf_cnpj,
      req.body.email,
      req.body.endereco,
      req.body.telefone,
      req.body.tipo_cliente
    );
    res.status(201).json({ id_cliente: result.lastInsertRowid, message: 'Cliente criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    db.prepare(`
      UPDATE CLIENTE SET 
        nome = ?, cpf_cnpj = ?, email = ?, endereco = ?, telefone = ?, tipo_cliente = ?
        WHERE id_cliente = ?
    `).run(
      req.body.nome,
      req.body.cpf_cnpj,
      req.body.email,
      req.body.endereco,
      req.body.telefone,
      req.body.tipo_cliente,
      req.params.id
    );
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM CLIENTE WHERE id_cliente = ?').run(req.params.id);
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;