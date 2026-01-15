# LivrariaDB - Sistema de Gerenciamento de Livraria

MVP completo de um sistema de gerenciamento de livraria desenvolvido para a disciplina de Banco de Dados I da UFC.

## 📚 Sobre o Projeto

Sistema completo que implementa todas as funcionalidades descritas no trabalho acadêmico, com foco especial na **modelagem do banco de dados** e nas **relações entre tabelas**.

### ✨ Versão SQLite - Sem Complicações!

Esta versão usa **SQLite** ao invés de MySQL, o que significa:
- ✅ **Nenhuma instalação** de banco de dados necessária
- ✅ **Funciona imediatamente** - basta rodar `npm install` e `npm start`
- ✅ O banco é criado automaticamente no arquivo `backend/livraria.db`
- ✅ Dados de exemplo já vêm populados

### Destaques Técnicos

- **Relacionamentos N:N** implementados através de tabelas associativas (`PEDIDO_LIVRO`, `LIVRO_FORNECEDOR`)
- **Triggers** para auditoria de exclusões
- **Views** para relatórios complexos
- **Transações** para garantir integridade dos dados
- **Consultas SQL avançadas** com JOINs, subconsultas, GROUP BY, HAVING, etc.

## 🏗️ Arquitetura

```
livraria-mvp/
├── backend/          # API Node.js + Express + SQLite
│   ├── config/       # Configuração do banco de dados
│   ├── routes/       # Rotas da API (CRUD completo)
│   ├── server.js     # Servidor principal
│   └── livraria.db   # Banco SQLite (criado automaticamente)
│
└── frontend/         # Interface React
    ├── src/
    │   ├── pages/    # Páginas do sistema
    │   ├── services/ # Chamadas à API
    │   └── App.js    # Aplicação principal
    └── public/
```

## 🗄️ Modelagem do Banco de Dados

### Tabelas Principais

1. **LIVRO** - Catálogo de livros
2. **CLIENTE** - Cadastro de clientes (PF e PJ)
3. **FORNECEDOR** - Fornecedores de livros
4. **FUNCIONARIO** - Funcionários da livraria
5. **PEDIDO** - Pedidos/vendas realizados

### Tabelas Associativas (N:N)

- **PEDIDO_LIVRO**: Relaciona pedidos com múltiplos livros
- **LIVRO_FORNECEDOR**: Relaciona livros com múltiplos fornecedores

### Recursos Avançados

- **Trigger**: `trg_log_exclusao_pedido` - Audita exclusões de pedidos
- **View**: `VW_RELATORIO_VENDAS` - Relatório consolidado de vendas
- **Transações**: Garantem integridade ao criar pedidos

## 🚀 Como Executar

### Pré-requisitos

- Node.js 16+ (apenas isso!)
- npm ou yarn

### Instalação e Execução

#### Backend

```bash
cd backend
npm install
npm start
```

O backend rodará em `http://localhost:3001` e criará automaticamente o banco `livraria.db`

#### Frontend

```bash
cd frontend
npm install
npm start
```

O frontend rodará em `http://localhost:3000`

**Pronto! Só isso! 🎉**

## 📊 Funcionalidades

### Dashboard
- 📈 Estatísticas gerais de vendas
- 📚 Livros mais vendidos
- 👥 Top funcionários
- 📦 Informações de estoque em tempo real

### Gerenciamento
- ✅ **Livros**: CRUD completo, controle de estoque, associação com fornecedores
- ✅ **Clientes**: Cadastro PF/PJ, histórico de compras
- ✅ **Fornecedores**: Gerenciamento de fornecedores e livros associados
- ✅ **Funcionários**: Controle de vendedores e comissões
- ✅ **Pedidos**: Criação de pedidos com múltiplos livros (N:N), cálculo automático, atualização de estoque

### Relatórios (Consultas SQL Complexas)
1. **Clientes e Gastos**: Total gasto por cliente (GROUP BY + SUM)
2. **Funcionários Acima da Média**: Vendedores que vendem mais que a média (HAVING + subconsulta)
3. **Livros Não Vendidos**: Livros sem vendas (LEFT JOIN + IS NULL)
4. **Clientes com Pedidos Altos**: Clientes com valores acima de pedidos online (subconsulta)
5. **Fornecedores Ativos**: Fornecedores com livros vendidos (múltiplos JOINs)
6. **Livros Acima da Média**: Livros mais caros que média dos técnicos (subconsulta com WHERE)

## 🎨 Design

Interface moderna com:
- Design responsivo e clean
- Paleta de cores profissional (Indigo/Purple)
- Ícones Lucide React
- Feedback visual para ações
- Tabelas organizadas
- Modais para formulários
- Badges de status coloridos
- Loading states

## 🔍 Demonstração da Modelagem

### Relacionamento 1:N (Cliente ↔ Pedido)
```sql
-- Um cliente pode ter vários pedidos
SELECT c.nome, COUNT(p.id_pedido) as total_pedidos
FROM CLIENTE c
LEFT JOIN PEDIDO p ON c.id_cliente = p.id_cliente
GROUP BY c.id_cliente;
```

### Relacionamento N:N (Pedido ↔ Livro)
```sql
-- Pedidos podem ter múltiplos livros e vice-versa
-- Implementado através da tabela PEDIDO_LIVRO
INSERT INTO PEDIDO_LIVRO (id_pedido, id_livro, quantidade, preco_unitario)
VALUES (1, 5, 2, 95.00);
```

### Trigger Automático
```sql
-- Ao deletar um pedido, trigger registra no log automaticamente
DELETE FROM PEDIDO WHERE id_pedido = 10;
-- Log criado automaticamente em LOG_PEDIDO
```

### View para Relatórios
```sql
-- View consolidada de vendas
SELECT * FROM VW_RELATORIO_VENDAS;
```

## 🐛 Solução de Problemas

### Backend não inicia?
- Certifique-se de que a porta 3001 está livre
- Execute `npm install` novamente

### Frontend não conecta?
- Verifique se o backend está rodando em `localhost:3001`
- Limpe o cache do navegador

### Erro ao criar pedido?
- Verifique se há estoque suficiente dos livros
- Confira se cliente e funcionário existem

## 📝 Diferenças MySQL vs SQLite

Esta versão foi adaptada do MySQL para SQLite. Principais diferenças:

| Recurso | MySQL | SQLite |
|---------|-------|--------|
| Instalação | Requer servidor MySQL | Sem instalação |
| Stored Procedures | Suportado | Não suportado (implementado em código) |
| Tipos de dados | DECIMAL, INT, VARCHAR | REAL, INTEGER, TEXT |
| Auto increment | AUTO_INCREMENT | AUTOINCREMENT |
| Datas | NOW(), CURDATE() | datetime('now'), date('now') |
| Transações | Nativas | Nativas (better-sqlite3) |
| Triggers | Suportado | Suportado |
| Views | Suportado | Suportado |

## 📝 Créditos

**Disciplina**: Banco de Dados I  
**Professor**: Marília Soares Mendes Albuquerque  
**Equipe**: 
- Byanca Araújo Pinto (536411)
- Emmanuel Lima Silva Sampaio (539726)

**Instituição**: Universidade Federal do Ceará - Centro de Tecnologia

## 📄 Licença

Projeto acadêmico - 2025.2
