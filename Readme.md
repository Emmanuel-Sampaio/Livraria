# LivrariaDB

Sistema de gerenciamento de livraria desenvolvido como trabalho final da disciplina de Banco de Dados I.

## Informações do Projeto

**Universidade Federal do Ceará (UFC)**
**Centro de Tecnologia**
**Disciplina:** Banco de Dados I (2025.2)
**Professora:** Marilia Soares Mendes Albuquerque

### Equipe
* **Byanca Araújo Pinto** - Matrícula: 536411
* **Emmanuel Lima Silva Sampaio** - Matrícula: 539726

---

## Sobre

O **LivrariaDB** é uma aplicação para gerenciamento de livrarias físicas e digitais. O sistema visa automatizar o controle de estoque, fluxo de caixa e cadastro de entidades, substituindo processos manuais e garantindo a integridade dos dados.

## Funcionalidades

O projeto atende aos requisitos funcionais propostos no escopo da disciplina:

* **CRUD de Entidades:** Gerenciamento completo de Livros, Clientes, Fornecedores e Funcionários.
* **Controle de Estoque:** Atualização automática de quantidades após vendas e reposições.
* **Vendas:** Registro de pedidos presenciais e online, com cálculo automático de valores e baixa no estoque.
* **Histórico:** Consulta detalhada de pedidos por cliente.
* **Relatórios:** Geração de dados sobre vendas e desempenho.
* **Controle de Acesso:** Diferenciação de permissões para funcionários.

## Tecnologias

O sistema utiliza uma arquitetura cliente-servidor:

* **Backend:** Node.js, Express, SQLite (better-sqlite3)
* **Frontend:** React.js, Axios, React Router

## Instalação e Execução

Pré-requisitos: Node.js instalado.

### 1. Backend (API)

No terminal, navegue até a pasta do backend:

```bash
cd livraria-mvp/backend
npm install
npm run dev