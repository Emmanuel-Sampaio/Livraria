const db = require('./database');

function initDatabase() {
  try {
    console.log('Iniciando criação do banco de dados SQLite...');

    // Criar tabelas
    db.exec(`
      CREATE TABLE IF NOT EXISTS LIVRO (
        id_livro INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        editora TEXT,
        edicao TEXT,
        ano_publicacao INTEGER,
        genero TEXT,
        isbn TEXT UNIQUE,
        tipo_livro TEXT CHECK (tipo_livro IN ('Fisico', 'Digital')),
        quantidade_estoque INTEGER DEFAULT 0,
        preco REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS CLIENTE (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_compras INTEGER DEFAULT 0,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        endereco TEXT,
        telefone TEXT,
        tipo_cliente TEXT CHECK (tipo_cliente IN ('Fisica', 'Juridica')),
        data_cadastro TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS FORNECEDOR (
        id_fornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_empresa TEXT NOT NULL,
        email TEXT,
        cnpj TEXT UNIQUE NOT NULL,
        telefone TEXT,
        endereco TEXT,
        nome_responsavel TEXT,
        data_cadastro TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS FUNCIONARIO (
        id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        cargo TEXT NOT NULL,
        email TEXT UNIQUE,
        telefone TEXT,
        salario REAL,
        nivel_acesso TEXT,
        data_admissao TEXT NOT NULL,
        comissao_percentual REAL DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS PEDIDO (
        id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        id_cliente INTEGER NOT NULL,
        id_funcionario INTEGER,
        data_pedido TEXT NOT NULL,
        valor_total REAL NOT NULL,
        status_pedido TEXT CHECK (status_pedido IN ('Em aberto', 'Pago', 'Entregue', 'Cancelado')),
        tipo_venda TEXT CHECK (tipo_venda IN ('Presencial', 'Online')),
        forma_pagamento TEXT,
        cupom_desconto REAL DEFAULT 0.00,
        nota_fiscal TEXT,
        FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
        FOREIGN KEY (id_funcionario) REFERENCES FUNCIONARIO(id_funcionario)
      );

      CREATE TABLE IF NOT EXISTS PEDIDO_LIVRO (
        id_pedido INTEGER,
        id_livro INTEGER,
        quantidade INTEGER DEFAULT 1,
        preco_unitario REAL,
        PRIMARY KEY (id_pedido, id_livro),
        FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE,
        FOREIGN KEY (id_livro) REFERENCES LIVRO(id_livro)
      );

      CREATE TABLE IF NOT EXISTS LIVRO_FORNECEDOR (
        id_livro INTEGER,
        id_fornecedor INTEGER,
        PRIMARY KEY (id_livro, id_fornecedor),
        FOREIGN KEY (id_livro) REFERENCES LIVRO(id_livro),
        FOREIGN KEY (id_fornecedor) REFERENCES FORNECEDOR(id_fornecedor)
      );

      CREATE TABLE IF NOT EXISTS LOG_PEDIDO (
        id_log INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pedido INTEGER,
        data_exclusao TEXT,
        valor_total REAL
      );
    `);

    // Verificar se já existem dados
    const countLivros = db.prepare('SELECT COUNT(*) as count FROM LIVRO').get();
    
    if (countLivros.count === 0) {
      console.log('Populando banco de dados...');
      
      // Inserir dados de exemplo
      const insertLivro = db.prepare(`
        INSERT INTO LIVRO (titulo, autor, editora, edicao, ano_publicacao, genero, isbn, tipo_livro, quantidade_estoque, preco) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const livros = [
        ['Dom Casmurro', 'Machado de Assis', 'Editora Globo', '3a', 1899, 'Romance', '978-8525061867', 'Fisico', 45, 35.90],
        ['O Cortico', 'Aluisio Azevedo', 'Editora Atica', '2a', 1890, 'Romance', '978-8508123456', 'Fisico', 30, 28.50],
        ['Clean Code', 'Robert C. Martin', 'Prentice Hall', '1a', 2008, 'Tecnico', '978-0132350884', 'Digital', 100, 89.90],
        ['Harry Potter e a Pedra Filosofal', 'J.K. Rowling', 'Rocco', '1a', 1997, 'Fantasia', '978-8532530787', 'Fisico', 60, 42.00],
        ['O Senhor dos Aneis', 'J.R.R. Tolkien', 'Martins Fontes', '1a', 1954, 'Fantasia', '978-8533613379', 'Fisico', 25, 95.00],
        ['Algoritmos', 'Thomas Cormen', 'Campus', '3a', 2009, 'Tecnico', '978-8535236996', 'Fisico', 20, 180.00],
        ['1984', 'George Orwell', 'Companhia das Letras', '1a', 1949, 'Ficcao', '978-8535914849', 'Digital', 150, 32.90],
        ['A Revolucao dos Bichos', 'George Orwell', 'Companhia das Letras', '1a', 1945, 'Ficcao', '978-8535909555', 'Fisico', 40, 29.90],
        ['Banco de Dados', 'Ramez Elmasri', 'Pearson', '6a', 2011, 'Tecnico', '978-8579360855', 'Fisico', 15, 165.00],
        ['O Pequeno Principe', 'Antoine de Saint-Exupery', 'Agir', '1a', 1943, 'Infantil', '978-8522008731', 'Fisico', 80, 24.90]
      ];

      const insertMany = db.transaction((items) => {
        for (const item of items) {
          insertLivro.run(item);
        }
      });
      insertMany(livros);

      // Clientes
      const insertCliente = db.prepare(`
        INSERT INTO CLIENTE (numero_compras, nome, cpf_cnpj, email, endereco, telefone, tipo_cliente, data_cadastro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const clientes = [
        [5, 'Maria Silva Santos', '123.456.789-00', 'maria.silva@email.com', 'Rua das Flores, 123, Centro', '(85) 98765-4321', 'Fisica', '2023-01-15'],
        [3, 'Joao Pedro Oliveira', '234.567.890-11', 'joao.pedro@email.com', 'Av. Beira Mar, 456, Meireles', '(85) 97654-3210', 'Fisica', '2023-03-20'],
        [8, 'Ana Carolina Costa', '345.678.901-22', 'ana.costa@email.com', 'Rua Barao de Studart, 789, Aldeota', '(85) 96543-2109', 'Fisica', '2022-11-10'],
        [2, 'Livraria Saber Ltda', '12.345.678/0001-90', 'contato@livrariasaber.com', 'Rua do Comercio, 100, Centro', '(85) 3456-7890', 'Juridica', '2023-05-05'],
        [6, 'Carlos Eduardo Mendes', '456.789.012-33', 'carlos.mendes@email.com', 'Rua Major Facundo, 234, Centro', '(85) 95432-1098', 'Fisica', '2023-02-28']
      ];

      const insertManyClientes = db.transaction((items) => {
        for (const item of items) {
          insertCliente.run(item);
        }
      });
      insertManyClientes(clientes);

      // Fornecedores
      const insertFornecedor = db.prepare(`
        INSERT INTO FORNECEDOR (nome_empresa, email, cnpj, telefone, endereco, nome_responsavel, data_cadastro) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const fornecedores = [
        ['Distribuidora Nacional de Livros', 'contato@dnlivros.com.br', '10.123.456/0001-78', '(11) 3456-7890', 'Av. Paulista, 1000, Sao Paulo - SP', 'Roberto Silva', '2020-01-10'],
        ['Editora Globo Distribuidora', 'vendas@edglobo.com.br', '20.234.567/0001-89', '(21) 2345-6789', 'Rua Marques de Pombal, 25, Rio de Janeiro - RJ', 'Mariana Costa', '2019-05-15'],
        ['Pearson Education Brasil', 'atendimento@pearson.com.br', '30.345.678/0001-90', '(11) 3567-8901', 'Rua Nelson Francisco, 26, Sao Paulo - SP', 'Carlos Eduardo', '2018-03-20']
      ];

      const insertManyFornecedores = db.transaction((items) => {
        for (const item of items) {
          insertFornecedor.run(item);
        }
      });
      insertManyFornecedores(fornecedores);

      // Funcionários
      const insertFuncionario = db.prepare(`
        INSERT INTO FUNCIONARIO (nome, cpf, cargo, email, telefone, salario, nivel_acesso, data_admissao, comissao_percentual) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const funcionarios = [
        ['Jose Carlos Silva', '111.222.333-44', 'Gerente', 'jose.carlos@livraria.com', '(85) 98888-1111', 5500.00, 'Administrador', '2020-01-15', 5.00],
        ['Mariana Souza Lima', '222.333.444-55', 'Vendedor', 'mariana.souza@livraria.com', '(85) 98888-2222', 2800.00, 'Basico', '2021-03-10', 3.00],
        ['Paulo Roberto Santos', '333.444.555-66', 'Vendedor', 'paulo.roberto@livraria.com', '(85) 98888-3333', 2800.00, 'Basico', '2021-06-20', 3.00]
      ];

      const insertManyFuncionarios = db.transaction((items) => {
        for (const item of items) {
          insertFuncionario.run(item);
        }
      });
      insertManyFuncionarios(funcionarios);

      // Pedidos
      const insertPedido = db.prepare(`
        INSERT INTO PEDIDO (id_cliente, id_funcionario, data_pedido, valor_total, status_pedido, tipo_venda, forma_pagamento, cupom_desconto, nota_fiscal) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const pedidos = [
        [1, 2, '2024-01-15', 107.80, 'Entregue', 'Presencial', 'Cartao de Credito', 0.00, 'NF-2024-001'],
        [2, 3, '2024-01-18', 180.00, 'Entregue', 'Online', 'Pix', 0.00, 'NF-2024-002'],
        [3, 2, '2024-01-20', 137.00, 'Entregue', 'Presencial', 'Dinheiro', 0.00, 'NF-2024-003']
      ];

      const insertManyPedidos = db.transaction((items) => {
        for (const item of items) {
          insertPedido.run(item);
        }
      });
      insertManyPedidos(pedidos);

      // Pedido_Livro
      const insertPedidoLivro = db.prepare(`
        INSERT INTO PEDIDO_LIVRO (id_pedido, id_livro, quantidade, preco_unitario) 
        VALUES (?, ?, ?, ?)
      `);

      const pedidoLivros = [
        [1, 1, 2, 35.90],
        [1, 2, 1, 28.50],
        [1, 10, 1, 24.90],
        [2, 6, 1, 180.00],
        [3, 4, 2, 42.00],
        [3, 8, 1, 29.90],
        [3, 10, 1, 24.90]
      ];

      const insertManyPedidoLivros = db.transaction((items) => {
        for (const item of items) {
          insertPedidoLivro.run(item);
        }
      });
      insertManyPedidoLivros(pedidoLivros);

      // Livro_Fornecedor
      const insertLivroFornecedor = db.prepare(`
        INSERT INTO LIVRO_FORNECEDOR (id_livro, id_fornecedor) 
        VALUES (?, ?)
      `);

      const livroFornecedores = [
        [1, 2], [2, 2], [3, 3], [4, 1], [5, 1],
        [6, 3], [7, 1], [8, 1], [9, 3], [10, 2]
      ];

      const insertManyLivroFornecedores = db.transaction((items) => {
        for (const item of items) {
          insertLivroFornecedor.run(item);
        }
      });
      insertManyLivroFornecedores(livroFornecedores);

      console.log('Dados inseridos com sucesso!');
    }

    // Criar trigger (SQLite usa sintaxe diferente)
    db.exec(`
      DROP TRIGGER IF EXISTS trg_log_exclusao_pedido;
      
      CREATE TRIGGER trg_log_exclusao_pedido
      BEFORE DELETE ON PEDIDO
      FOR EACH ROW
      BEGIN
        INSERT INTO LOG_PEDIDO (id_pedido, data_exclusao, valor_total)
        VALUES (OLD.id_pedido, datetime('now'), OLD.valor_total);
      END;
    `);

    // Criar view
    db.exec(`
      DROP VIEW IF EXISTS VW_RELATORIO_VENDAS;
      
      CREATE VIEW VW_RELATORIO_VENDAS AS
      SELECT
        p.id_pedido,
        p.data_pedido,
        c.nome AS nome_cliente,
        f.nome AS nome_funcionario,
        COUNT(pl.id_livro) AS quantidade_livros,
        SUM(pl.preco_unitario * pl.quantidade) AS valor_livros,
        p.cupom_desconto,
        p.valor_total,
        p.status_pedido,
        p.tipo_venda
      FROM PEDIDO p
      INNER JOIN CLIENTE c ON p.id_cliente = c.id_cliente
      LEFT JOIN FUNCIONARIO f ON p.id_funcionario = f.id_funcionario
      INNER JOIN PEDIDO_LIVRO pl ON p.id_pedido = pl.id_pedido
      GROUP BY
        p.id_pedido,
        p.data_pedido,
        c.nome,
        f.nome,
        p.cupom_desconto,
        p.valor_total,
        p.status_pedido,
        p.tipo_venda;
    `);
      console.log('Criando índices...');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON PEDIDO(id_cliente);
      CREATE INDEX IF NOT EXISTS idx_pedido_funcionario ON PEDIDO(id_funcionario);
      CREATE INDEX IF NOT EXISTS idx_pedido_data ON PEDIDO(data_pedido);
      CREATE INDEX IF NOT EXISTS idx_pedido_status ON PEDIDO(status_pedido);
      CREATE INDEX IF NOT EXISTS idx_pedido_livro_pedido ON PEDIDO_LIVRO(id_pedido);
      CREATE INDEX IF NOT EXISTS idx_pedido_livro_livro ON PEDIDO_LIVRO(id_livro);
      CREATE INDEX IF NOT EXISTS idx_livro_fornecedor_livro ON LIVRO_FORNECEDOR(id_livro);
      CREATE INDEX IF NOT EXISTS idx_livro_fornecedor_fornecedor ON LIVRO_FORNECEDOR(id_fornecedor);
      CREATE INDEX IF NOT EXISTS idx_livro_genero ON LIVRO(genero);
      CREATE INDEX IF NOT EXISTS idx_cliente_tipo ON CLIENTE(tipo_cliente);
    `);
    console.log('Índices criados com sucesso!');

    console.log('Banco de dados SQLite inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = initDatabase;
