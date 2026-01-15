const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDatabase = require('./config/init');
const livrosRoutes = require('./routes/livros');
const clientesRoutes = require('./routes/clientes');
const fornecedoresRoutes = require('./routes/fornecedores');
const funcionariosRoutes = require('./routes/funcionarios');
const pedidosRoutes = require('./routes/pedidos');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/livros', livrosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'API LivrariaDB funcionando com SQLite!' });
});

// Inicializar banco e servidor
try {
  initDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 LivrariaDB API disponível em http://localhost:${PORT}/api`);
    console.log(`💾 Usando SQLite - banco criado em: backend/livraria.db\n`);
  });
} catch (error) {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
}
