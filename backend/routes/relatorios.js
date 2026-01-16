const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Dashboard
router.get('/dashboard', (req, res) => {
  try {
    const totalVendas = db.prepare(`
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(valor_total), 0) as valor_total,
        COALESCE(AVG(valor_total), 0) as ticket_medio
      FROM PEDIDO
      WHERE status_pedido != 'Cancelado'
    `).get();
    
    const totalClientes = db.prepare('SELECT COUNT(*) as total FROM CLIENTE').get();
    
    const estoqueInfo = db.prepare(`
      SELECT 
        COUNT(*) as total_titulos,
        SUM(quantidade_estoque) as total_unidades,
        SUM(preco * quantidade_estoque) as valor_estoque
      FROM LIVRO
    `).get();
    
    const maisVendidos = db.prepare(`
      SELECT 
        l.id_livro,
        l.titulo,
        l.autor,
        l.genero,
        SUM(pl.quantidade) as total_vendido,
        SUM(pl.quantidade * pl.preco_unitario) as receita_total
      FROM LIVRO l
      INNER JOIN PEDIDO_LIVRO pl ON l.id_livro = pl.id_livro
      INNER JOIN PEDIDO p ON pl.id_pedido = p.id_pedido
      WHERE p.status_pedido != 'Cancelado'
      GROUP BY l.id_livro
      ORDER BY total_vendido DESC
      LIMIT 5
    `).all();
    
    const vendasMes = db.prepare(`
      SELECT 
        strftime('%Y-%m', data_pedido) as mes,
        COUNT(*) as total_pedidos,
        SUM(valor_total) as valor_total
      FROM PEDIDO
      WHERE status_pedido != 'Cancelado'
      GROUP BY strftime('%Y-%m', data_pedido)
      ORDER BY mes DESC
      LIMIT 12
    `).all();
    
    const topFuncionarios = db.prepare(`
      SELECT 
        f.id_funcionario,
        f.nome,
        f.cargo,
        COUNT(p.id_pedido) as total_vendas,
        SUM(p.valor_total) as valor_total,
        f.comissao_percentual,
        SUM(p.valor_total * f.comissao_percentual / 100) as comissao_total
      FROM FUNCIONARIO f
      INNER JOIN PEDIDO p ON f.id_funcionario = p.id_funcionario
      WHERE p.status_pedido != 'Cancelado'
      GROUP BY f.id_funcionario
      ORDER BY valor_total DESC
      LIMIT 5
    `).all();
    
    res.json({
      vendas: totalVendas,
      clientes: totalClientes,
      estoque: estoqueInfo,
      maisVendidos,
      vendasPorMes: vendasMes,
      topFuncionarios
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Relatório de vendas (VIEW)
router.get('/vendas', (req, res) => {
  try {
    const vendas = db.prepare('SELECT * FROM VW_RELATORIO_VENDAS ORDER BY data_pedido DESC').all();
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta 1: Clientes e gastos
router.get('/clientes-gastos', (req, res) => {
  try {
    const resultado = db.prepare(`
      SELECT
        c.id_cliente,
        c.nome,
        c.email,
        COUNT(p.id_pedido) AS total_pedidos,
        COALESCE(SUM(p.valor_total), 0) AS total_gasto
      FROM CLIENTE c
      LEFT JOIN PEDIDO p ON c.id_cliente = p.id_cliente
      GROUP BY c.id_cliente, c.nome, c.email
      ORDER BY total_gasto DESC
    `).all();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta 2: Funcionários acima da média
router.get('/funcionarios-acima-media', (req, res) => {
  try {
    const resultado = db.prepare(`
      SELECT
        f.id_funcionario,
        f.nome,
        f.cargo,
        SUM(p.valor_total) AS total_vendas,
        (SELECT AVG(valor_total) FROM PEDIDO) as media_geral
      FROM FUNCIONARIO f
      INNER JOIN PEDIDO p ON f.id_funcionario = p.id_funcionario
      GROUP BY f.id_funcionario, f.nome, f.cargo
      HAVING SUM(p.valor_total) > (SELECT AVG(valor_total) FROM PEDIDO)
      ORDER BY total_vendas DESC
    `).all();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta 3: Livros não vendidos
router.get('/livros-nao-vendidos', (req, res) => {
  try {
    const resultado = db.prepare(`
      SELECT
        l.id_livro,
        l.titulo,
        l.autor,
        l.genero,
        l.quantidade_estoque,
        l.preco
      FROM LIVRO l
      LEFT JOIN PEDIDO_LIVRO pl ON l.id_livro = pl.id_livro
      WHERE pl.id_livro IS NULL
      ORDER BY l.titulo
    `).all();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta 4: Clientes com pedidos altos
router.get('/clientes-pedidos-altos', (req, res) => {
  try {
    const resultado = db.prepare(`
      SELECT DISTINCT
        c.id_cliente,
        c.nome,
        c.email,
        MAX(p.valor_total) as maior_pedido
      FROM CLIENTE c
      INNER JOIN PEDIDO p ON c.id_cliente = p.id_cliente
      WHERE p.valor_total > (
        SELECT MIN(valor_total)
        FROM PEDIDO
        WHERE tipo_venda = 'Online'
      )
      GROUP BY c.id_cliente, c.nome, c.email
      ORDER BY maior_pedido DESC
    `).all();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta 5: Fornecedores ativos
router.get('/fornecedores-ativos', (req, res) => {
  try {
    const resultado = db.prepare(`
      SELECT DISTINCT
        f.id_fornecedor,
        f.nome_empresa,
        f.email,
        f.telefone,
        COUNT(DISTINCT lf.id_livro) as total_livros,
        COUNT(DISTINCT pl.id_pedido) as total_vendas
      FROM FORNECEDOR f
      INNER JOIN LIVRO_FORNECEDOR lf ON f.id_fornecedor = lf.id_fornecedor
      INNER JOIN PEDIDO_LIVRO pl ON lf.id_livro = pl.id_livro
      GROUP BY f.id_fornecedor, f.nome_empresa, f.email, f.telefone
      ORDER BY total_vendas DESC
    `).all();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta 6: Livros acima da média dos técnicos
router.get('/livros-acima-media-tecnicos', (req, res) => {
  try {
    const resultado = db.prepare(`
      SELECT
        id_livro,
        titulo,
        autor,
        genero,
        preco,
        (SELECT AVG(preco) FROM LIVRO WHERE genero = 'Tecnico') as media_tecnicos
      FROM LIVRO
      WHERE preco > (
        SELECT AVG(preco)
        FROM LIVRO
        WHERE genero = 'Tecnico'
      )
      ORDER BY preco DESC
    `).all();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log de exclusões
router.get('/log-exclusoes', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM LOG_PEDIDO ORDER BY data_exclusao DESC').all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
