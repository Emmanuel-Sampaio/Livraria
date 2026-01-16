const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os pedidos
router.get('/', (req, res) => {
  try {
    const pedidos = db.prepare(`
      SELECT 
        p.id_pedido,
        p.data_pedido,
        p.valor_total,
        p.status_pedido,
        p.tipo_venda,
        p.forma_pagamento,
        p.cupom_desconto,
        p.nota_fiscal,
        c.nome as nome_cliente,
        c.cpf_cnpj,
        COALESCE(f.nome, '') as nome_funcionario,
        COALESCE(f.cargo, '') as cargo
      FROM PEDIDO p
      INNER JOIN CLIENTE c ON p.id_cliente = c.id_cliente
      LEFT JOIN FUNCIONARIO f ON p.id_funcionario = f.id_funcionario
      ORDER BY p.id_pedido DESC
    `).all();
    
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar pedido por ID
router.get('/:id', (req, res) => {
  try {
    const pedido = db.prepare(`
      SELECT 
        p.*,
        c.nome as nome_cliente,
        COALESCE(f.nome, '') as nome_funcionario
      FROM PEDIDO p
      INNER JOIN CLIENTE c ON p.id_cliente = c.id_cliente
      LEFT JOIN FUNCIONARIO f ON p.id_funcionario = f.id_funcionario
      WHERE p.id_pedido = ?
    `).get(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    const itens = db.prepare(`
      SELECT 
        pl.id_livro,
        pl.quantidade,
        pl.preco_unitario,
        l.titulo,
        l.autor,
        l.isbn,
        l.preco as preco_atual
      FROM PEDIDO_LIVRO pl
      INNER JOIN LIVRO l ON pl.id_livro = l.id_livro
      WHERE pl.id_pedido = ?
    `).all(req.params.id);
    
    res.json({ ...pedido, itens: itens || [] });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar novo pedido
router.post('/', (req, res) => {
  try {
    const { id_cliente, id_funcionario, tipo_venda, forma_pagamento, livros, cupom_desconto } = req.body;
    
    // Validações
    if (!id_cliente) {
      return res.status(400).json({ error: 'Cliente é obrigatório' });
    }
    if (!tipo_venda) {
      return res.status(400).json({ error: 'Tipo de venda é obrigatório' });
    }
    if (!forma_pagamento) {
      return res.status(400).json({ error: 'Forma de pagamento é obrigatória' });
    }
    if (!livros || !Array.isArray(livros) || livros.length === 0) {
      return res.status(400).json({ error: 'Adicione pelo menos um livro ao pedido' });
    }

    const createPedido = db.transaction(() => {
      // Criar pedido
      const resultPedido = db.prepare(`
        INSERT INTO PEDIDO (
          id_cliente,
          id_funcionario,
          data_pedido,
          tipo_venda,
          status_pedido,
          forma_pagamento,
          valor_total,
          cupom_desconto,
          nota_fiscal
        ) VALUES (?, ?, date('now'), ?, 'Em aberto', ?, 0, ?, '')
      `).run(
        id_cliente, 
        id_funcionario || null, 
        tipo_venda, 
        forma_pagamento, 
        cupom_desconto || 0
      );
      
      const pedidoId = resultPedido.lastInsertRowid;
      let valorTotal = 0;
      
      // Preparar statements
      const insertPedidoLivro = db.prepare(
        'INSERT INTO PEDIDO_LIVRO (id_pedido, id_livro, quantidade, preco_unitario) VALUES (?, ?, ?, ?)'
      );
      
      const getLivro = db.prepare('SELECT preco, quantidade_estoque FROM LIVRO WHERE id_livro = ?');
      const updateEstoque = db.prepare('UPDATE LIVRO SET quantidade_estoque = quantidade_estoque - ? WHERE id_livro = ?');
      
      // Adicionar livros ao pedido
      for (const item of livros) {
        const livro = getLivro.get(item.id_livro);
        
        if (!livro) {
          throw new Error(`Livro ID ${item.id_livro} não encontrado`);
        }
        
        if (livro.quantidade_estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o livro ID ${item.id_livro}. Disponível: ${livro.quantidade_estoque}`);
        }
        
        const precoUnitario = parseFloat(item.preco_unitario) || parseFloat(livro.preco);
        const quantidade = parseInt(item.quantidade);
        const subtotal = precoUnitario * quantidade;
        valorTotal += subtotal;
        
        insertPedidoLivro.run(pedidoId, item.id_livro, quantidade, precoUnitario);
        updateEstoque.run(quantidade, item.id_livro);
      }
      
      // Aplicar desconto
      const descontoAplicado = parseFloat(cupom_desconto) || 0;
      valorTotal = Math.max(0, valorTotal - descontoAplicado);
      
      // Atualizar valor total e nota fiscal
      const notaFiscal = `NF-${new Date().getFullYear()}-${String(pedidoId).padStart(4, '0')}`;
      db.prepare('UPDATE PEDIDO SET valor_total = ?, nota_fiscal = ? WHERE id_pedido = ?')
        .run(valorTotal, notaFiscal, pedidoId);
      
      // Incrementar número de compras do cliente
      db.prepare('UPDATE CLIENTE SET numero_compras = numero_compras + 1 WHERE id_cliente = ?')
        .run(id_cliente);
      
      return { pedidoId, valorTotal, notaFiscal };
    });

    const result = createPedido();
    res.status(201).json({ 
      id_pedido: result.pedidoId, 
      valor_total: result.valorTotal,
      nota_fiscal: result.notaFiscal,
      message: 'Pedido criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar status do pedido
router.patch('/:id/status', (req, res) => {
  try {
    db.prepare('UPDATE PEDIDO SET status_pedido = ? WHERE id_pedido = ?')
      .run(req.body.status_pedido, req.params.id);
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar pedido
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM PEDIDO WHERE id_pedido = ?').run(req.params.id);
    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;