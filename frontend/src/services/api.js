import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Livros
export const livrosAPI = {
  getAll: () => api.get('/livros'),
  getById: (id) => api.get(`/livros/${id}`),
  create: (data) => api.post('/livros', data),
  update: (id, data) => api.put(`/livros/${id}`, data),
  delete: (id) => api.delete(`/livros/${id}`),
  getByGenero: (genero) => api.get(`/livros/genero/${genero}`),
};

// Clientes
export const clientesAPI = {
  getAll: (termo = '') =>
  api.get('/clientes', {
    params: { busca: termo }
  }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// Fornecedores
export const fornecedoresAPI = {
  getAll: () => api.get('/fornecedores'),
  getById: (id) => api.get(`/fornecedores/${id}`),
  create: (data) => api.post('/fornecedores', data),
  update: (id, data) => api.put(`/fornecedores/${id}`, data),
  delete: (id) => api.delete(`/fornecedores/${id}`),
};

// Funcionários
export const funcionariosAPI = {
  getAll: () => api.get('/funcionarios'),
  getById: (id) => api.get(`/funcionarios/${id}`),
  create: (data) => api.post('/funcionarios', data),
  update: (id, data) => api.put(`/funcionarios/${id}`, data),
  delete: (id) => api.delete(`/funcionarios/${id}`),
};

// Pedidos
export const pedidosAPI = {
  getAll: () => api.get('/pedidos'),
  getById: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post('/pedidos', data),
  updateStatus: (id, status) => api.patch(`/pedidos/${id}/status`, { status_pedido: status }),
  delete: (id) => api.delete(`/pedidos/${id}`),
  getByCliente: (id) => api.get(`/pedidos/cliente/${id}`),
  getByFuncionario: (id) => api.get(`/pedidos/funcionario/${id}`),
};

// Relatórios
export const relatoriosAPI = {
  getDashboard: () => api.get('/relatorios/dashboard'),
  getVendas: () => api.get('/relatorios/vendas'),
  getClientesGastos: () => api.get('/relatorios/clientes-gastos'),
  getFuncionariosAcimaMedia: () => api.get('/relatorios/funcionarios-acima-media'),
  getLivrosNaoVendidos: () => api.get('/relatorios/livros-nao-vendidos'),
  getClientesPedidosAltos: () => api.get('/relatorios/clientes-pedidos-altos'),
  getFornecedoresAtivos: () => api.get('/relatorios/fornecedores-ativos'),
  getLivrosAcimaMediaTecnicos: () => api.get('/relatorios/livros-acima-media-tecnicos'),
  getLogExclusoes: () => api.get('/relatorios/log-exclusoes'),
  getVendasPeriodo: (dataInicio, dataFim) => 
    api.get(`/relatorios/vendas-periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`),
};

export default api;
