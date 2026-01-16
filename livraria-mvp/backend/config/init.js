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
      console.log('Populando banco de dados com dados do PDF...');
      
      // 1. Inserir LIVROS
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
        for (const item of items) insertLivro.run(item);
      });
      insertMany(livros);

      // 2. Inserir CLIENTES
      const insertCliente = db.prepare(`
        INSERT INTO CLIENTE (numero_compras, nome, cpf_cnpj, email, endereco, telefone, tipo_cliente, data_cadastro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const clientes = [
        [5, 'Maria Silva Santos', '123.456.789-00', 'maria.silva@email.com', 'Rua das Flores, 123, Centro', '(85) 98765-4321', 'Fisica', '2023-01-15'],
        [3, 'Joao Pedro Oliveira', '234.567.890-11', 'joao.pedro@email.com', 'Av. Beira Mar, 456, Meireles', '(85) 97654-3210', 'Fisica', '2023-03-20'],
        [8, 'Ana Carolina Costa', '345.678.901-22', 'ana.costa@email.com', 'Rua Barao de Studart, 789, Aldeota', '(85) 96543-2109', 'Fisica', '2022-11-10'],
        [2, 'Livraria Saber Ltda', '12.345.678/0001-90', 'contato@livrariasaber.com', 'Rua do Comercio, 100, Centro', '(85) 3456-7890', 'Juridica', '2023-05-05'],
        [6, 'Carlos Eduardo Mendes', '456.789.012-33', 'carlos.mendes@email.com', 'Rua Major Facundo, 234, Centro', '(85) 95432-1098', 'Fisica', '2023-02-28'],
        [4, 'Fernanda Lima Rocha', '567.890.123-44', 'fernanda.lima@email.com', 'Av. Santos Dumont, 567, Aldeota', '(85) 94321-0987', 'Fisica', '2023-04-12'],
        [1, 'Instituto Educacional ABC', '23.456.789/0001-01', 'compras@institutoabc.edu.br', 'Av. da Universidade, 1000, Benfica', '(85) 3567-8901', 'Juridica', '2023-06-18'],
        [7, 'Ricardo Alves Pereira', '678.901.234-55', 'ricardo.alves@email.com', 'Rua Nogueira Accioly, 890, Aldeota', '(85) 93210-9876', 'Fisica', '2022-12-05'],
        [9, 'Patricia Gomes Ferreira', '789.012.345-66', 'patricia.gomes@email.com', 'Rua Barbosa de Freitas, 345, Aldeota', '(85) 92109-8765', 'Fisica', '2023-01-30'],
        [5, 'Editora Conhecimento S.A.', '34.567.890/0001-12', 'vendas@editoraconhecimento.com.br', 'Rua dos Editores, 500, Centro', '(85) 3678-9012', 'Juridica', '2023-07-22']
      ];

      const insertManyClientes = db.transaction((items) => {
        for (const item of items) insertCliente.run(item);
      });
      insertManyClientes(clientes);

      // 3. Inserir FORNECEDORES
      const insertFornecedor = db.prepare(`
        INSERT INTO FORNECEDOR (nome_empresa, email, cnpj, telefone, endereco, nome_responsavel, data_cadastro) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const fornecedores = [
        ['Distribuidora Nacional de Livros', 'contato@dnlivros.com.br', '10.123.456/0001-78', '(11) 3456-7890', 'Av. Paulista, 1000, Sao Paulo - SP', 'Roberto Silva', '2020-01-10'],
        ['Editora Globo Distribuidora', 'vendas@edglobo.com.br', '20.234.567/0001-89', '(21) 2345-6789', 'Rua Marques de Pombal, 25, Rio de Janeiro - RJ', 'Mariana Costa', '2019-05-15'],
        ['Pearson Education Brasil', 'atendimento@pearson.com.br', '30.345.678/0001-90', '(11) 3567-8901', 'Rua Nelson Francisco, 26, Sao Paulo - SP', 'Carlos Eduardo', '2018-03-20'],
        ['Companhia das Letras Distribuicao', 'comercial@cialetras.com.br', '40.456.789/0001-01', '(11) 3678-9012', 'Rua Bandeira Paulista, 702, Sao Paulo - SP', 'Julia Santos', '2019-08-12'],
        ['Grupo Editorial Record', 'pedidos@record.com.br', '50.567.890/0001-12', '(21) 2789-0123', 'Rua Argentina, 171, Rio de Janeiro - RJ', 'Fernando Alves', '2020-02-28'],
        ['Saraiva Educacao', 'vendas@saraivaeducacao.com.br', '60.678.901/0001-23', '(11) 3890-1234', 'Av. Marques de Sao Vicente, 1697, Sao Paulo - SP', 'Patricia Lima', '2018-11-05'],
        ['Editora Rocco Ltda', 'comercial@rocco.com.br', '70.789.012/0001-34', '(21) 2901-2345', 'Av. Presidente Wilson, 231, Rio de Janeiro - RJ', 'Rodrigo Mendes', '2019-06-18'],
        ['Martins Fontes Distribuidora', 'atendimento@martinsfontesdist.com.br', '80.890.123/0001-45', '(11) 3012-3456', 'Rua Conselheiro Ramalho, 330, Sao Paulo - SP', 'Beatriz Rocha', '2020-04-22'],
        ['Editora Atica S.A.', 'vendas@atica.com.br', '90.901.234/0001-56', '(11) 3123-4567', 'Rua Padre Garcia Velho, 73, Sao Paulo - SP', 'Lucas Ferreira', '2019-09-30'],
        ['Campus Elsevier Distribuidora', 'pedidos@campus.com.br', '11.012.345/0001-67', '(21) 3234-5678', 'Rua Sete de Setembro, 111, Rio de Janeiro - RJ', 'Amanda Oliveira', '2020-07-14']
      ];

      const insertManyFornecedores = db.transaction((items) => {
        for (const item of items) insertFornecedor.run(item);
      });
      insertManyFornecedores(fornecedores);

      // 4. Inserir FUNCIONARIOS
      const insertFuncionario = db.prepare(`
        INSERT INTO FUNCIONARIO (nome, cpf, cargo, email, telefone, salario, nivel_acesso, data_admissao, comissao_percentual) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const funcionarios = [
        ['Jose Carlos Silva', '111.222.333-44', 'Gerente', 'jose.carlos@livraria.com', '(85) 98888-1111', 5500.00, 'Administrador', '2020-01-15', 5.00],
        ['Mariana Souza Lima', '222.333.444-55', 'Vendedor', 'mariana.souza@livraria.com', '(85) 98888-2222', 2800.00, 'Basico', '2021-03-10', 3.00],
        ['Paulo Roberto Santos', '333.444.555-66', 'Vendedor', 'paulo.roberto@livraria.com', '(85) 98888-3333', 2800.00, 'Basico', '2021-06-20', 3.00],
        ['Juliana Costa Oliveira', '444.555.666-77', 'Caixa', 'juliana.costa@livraria.com', '(85) 98888-4444', 2500.00, 'Basico', '2021-08-05', 2.00],
        ['Rafael Mendes Alves', '555.666.777-88', 'Vendedor', 'rafael.mendes@livraria.com', '(85) 98888-5555', 2800.00, 'Basico', '2022-01-12', 3.00],
        ['Camila Ferreira Rocha', '666.777.888-99', 'Supervisor', 'camila.ferreira@livraria.com', '(85) 98888-6666', 4200.00, 'Intermediario', '2020-05-18', 4.00],
        ['Bruno Henrique Lima', '777.888.999-00', 'Vendedor', 'bruno.henrique@livraria.com', '(85) 98888-7777', 2800.00, 'Basico', '2022-04-22', 3.00],
        ['Larissa Gomes Pereira', '888.999.000-11', 'Caixa', 'larissa.gomes@livraria.com', '(85) 98888-8888', 2500.00, 'Basico', '2022-07-30', 2.00],
        ['Thiago Alves Costa', '999.000.111-22', 'Estoquista', 'thiago.alves@livraria.com', '(85) 98888-9999', 2300.00, 'Basico', '2021-11-15', 0.00],
        ['Beatriz Santos Oliveira', '000.111.222-33', 'Vendedor', 'beatriz.santos@livraria.com', '(85) 98888-0000', 2800.00, 'Basico', '2023-02-08', 3.00]
      ];

      const insertManyFuncionarios = db.transaction((items) => {
        for (const item of items) insertFuncionario.run(item);
      });
      insertManyFuncionarios(funcionarios);

      // 5. Inserir PEDIDOS
      const insertPedido = db.prepare(`
        INSERT INTO PEDIDO (id_cliente, id_funcionario, data_pedido, valor_total, status_pedido, tipo_venda, forma_pagamento, cupom_desconto, nota_fiscal) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const pedidos = [
        [1, 2, '2024-01-15', 107.80, 'Entregue', 'Presencial', 'Cartao de Credito', 0.00, 'NF-2024-001'],
        [2, 3, '2024-01-18', 180.00, 'Entregue', 'Online', 'Pix', 0.00, 'NF-2024-002'],
        [3, 2, '2024-01-20', 137.00, 'Entregue', 'Presencial', 'Dinheiro', 0.00, 'NF-2024-003'],
        [4, 5, '2024-01-22', 540.00, 'Pago', 'Online', 'Boleto', 30.00, 'NF-2024-004'],
        [5, 7, '2024-01-25', 89.90, 'Entregue', 'Presencial', 'Cartao de Debito', 0.00, 'NF-2024-005'],
        [6, 3, '2024-01-28', 165.00, 'Entregue', 'Online', 'Pix', 0.00, 'NF-2024-006'],
        [7, 2, '2024-02-01', 495.00, 'Entregue', 'Presencial', 'Cartao de Credito', 50.00, 'NF-2024-007'],
        [8, 5, '2024-02-05', 62.80, 'Entregue', 'Online', 'Pix', 0.00, 'NF-2024-008'],
        [9, 7, '2024-02-10', 285.00, 'Pago', 'Presencial', 'Cartao de Credito', 0.00, 'NF-2024-009'],
        [10, 10, '2024-02-15', 224.70, 'Em aberto', 'Online', 'Boleto', 0.00, 'NF-2024-010']
      ];

      const insertManyPedidos = db.transaction((items) => {
        for (const item of items) insertPedido.run(item);
      });
      insertManyPedidos(pedidos);

      // 6. Inserir PEDIDO_LIVRO
      const insertPedidoLivro = db.prepare(`
        INSERT INTO PEDIDO_LIVRO (id_pedido, id_livro, quantidade, preco_unitario) 
        VALUES (?, ?, ?, ?)
      `);

      // Mapeamento extraído do PDF (id_pedido, id_livro) + valores inferidos da tabela LIVRO
      const pedidoLivros = [
        [1, 1, 2, 35.90],
        [1, 2, 1, 28.50],
        [1, 10, 1, 24.90],
        [2, 6, 1, 180.00],
        [3, 4, 1, 42.00],
        [3, 8, 1, 29.90],
        [3, 10, 1, 24.90],
        [4, 5, 1, 95.00],
        [4, 6, 1, 180.00],
        [5, 3, 1, 89.90],
        [6, 9, 1, 165.00],
        [7, 5, 1, 95.00],
        [7, 6, 1, 180.00],
        [8, 7, 1, 32.90],
        [8, 8, 1, 29.90],
        [9, 5, 1, 95.00],
        [10, 1, 1, 35.90],
        [10, 4, 1, 42.00],
        [10, 10, 1, 24.90]
      ];

      const insertManyPedidoLivros = db.transaction((items) => {
        for (const item of items) insertPedidoLivro.run(item);
      });
      insertManyPedidoLivros(pedidoLivros);

      // 7. Inserir LIVRO_FORNECEDOR
      const insertLivroFornecedor = db.prepare(`
        INSERT INTO LIVRO_FORNECEDOR (id_livro, id_fornecedor) 
        VALUES (?, ?)
      `);

      const livroFornecedores = [
        [1, 2], [1, 5],
        [2, 9],
        [3, 3], [3, 6],
        [4, 7], [4, 5],
        [5, 8], [5, 5],
        [6, 3], [6, 10],
        [7, 4], [7, 5],
        [8, 4], [8, 5],
        [9, 3], [9, 6],
        [10, 2], [10, 5], [10, 8]
      ];

      const insertManyLivroFornecedores = db.transaction((items) => {
        for (const item of items) insertLivroFornecedor.run(item);
      });
      insertManyLivroFornecedores(livroFornecedores);

      console.log('Dados inseridos com sucesso!');
    }

    // Criar trigger (SQLite usa sintaxe diferente do MySQL)
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