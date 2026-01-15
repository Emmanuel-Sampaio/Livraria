import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Eye } from 'lucide-react';
import { pedidosAPI, clientesAPI, livrosAPI, funcionariosAPI } from '../services/api';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [livros, setLivros] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  
  
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [buscaCliente, setBuscaCliente] = useState('');
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_funcionario: '',
    tipo_venda: 'Presencial',
    forma_pagamento: 'Dinheiro',
    cupom_desconto: 0,
    livros: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pedidosRes, clientesRes, livrosRes, funcRes] = await Promise.all([
        pedidosAPI.getAll(),
        clientesAPI.getAll(),
        livrosAPI.getAll(),
        funcionariosAPI.getAll()
      ]);
      setPedidos(pedidosRes.data);
      setClientes(clientesRes.data);
      setLivros(livrosRes.data);
      setFuncionarios(funcRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = async (pedido) => {
    try {
      const response = await pedidosAPI.getById(pedido.id_pedido);
      setPedidoSelecionado(response.data);
      setShowDetalhes(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      alert('Erro ao carregar detalhes do pedido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.livros.length === 0) {
      alert('Adicione pelo menos um livro ao pedido');
      return;
    }

    if (!formData.id_cliente) {
      alert('Selecione um cliente');
      return;
    }

    try {
      await pedidosAPI.create(formData);
      alert('Pedido criado com sucesso!');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido: ' + (error.response?.data?.error || error.message));
    }
  };

  const adicionarLivro = (livroId) => {
    if (!livroId) return;
    
    const livro = livros.find(l => l.id_livro === parseInt(livroId));
    if (!livro) return;
    
    const jaExiste = formData.livros.find(l => l.id_livro === parseInt(livroId));
    if (jaExiste) {
      alert('Livro já adicionado ao pedido');
      return;
    }

    setFormData({
      ...formData,
      livros: [...formData.livros, {
        id_livro: livro.id_livro,
        quantidade: 1,
        preco_unitario: livro.preco
      }]
    });
  };

  const removerLivro = (livroId) => {
    setFormData({
      ...formData,
      livros: formData.livros.filter(l => l.id_livro !== livroId)
    });
  };

  const atualizarQuantidade = (livroId, quantidade) => {
    const qtd = parseInt(quantidade);
    if (qtd < 1) return;
    
    setFormData({
      ...formData,
      livros: formData.livros.map(l => 
        l.id_livro === livroId ? { ...l, quantidade: qtd } : l
      )
    });
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      id_funcionario: '',
      tipo_venda: 'Presencial',
      forma_pagamento: 'Dinheiro',
      cupom_desconto: 0,
      livros: []
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const calcularTotal = () => {
    const subtotal = formData.livros.reduce((acc, livro) => {
      return acc + (livro.preco_unitario * livro.quantidade);
    }, 0);
    return Math.max(0, subtotal - (formData.cupom_desconto || 0));
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchStatus = !filtroStatus || pedido.status_pedido === filtroStatus;
    const matchTipo = !filtroTipo || pedido.tipo_venda === filtroTipo;
    const matchCliente = !buscaCliente || 
      pedido.nome_cliente.toLowerCase().includes(buscaCliente.toLowerCase());
    return matchStatus && matchTipo && matchCliente;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Gerenciamento de Pedidos</h2>
        <p>Controle as vendas e pedidos da livraria</p>
      </div>

      <div className="card">
        <div className="card-header">
          {/* Adicione APÓS a div card-header e ANTES da verificação de loading */}

        {/* Filtros */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div className="grid grid-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filtrar por Status</label>
              <select
                className="form-select"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Em aberto">Em aberto</option>
                <option value="Pago">Pago</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filtrar por Tipo</label>
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Buscar Cliente</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nome do cliente..."
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
              />
            </div>
          </div>
        </div>
          <h3 className="card-title">
            <ShoppingCart size={20} />
            Pedidos
          </h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Novo Pedido
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Funcionário</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Valor Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  ) : (
                  pedidos.map((pedido) => (
                    <tr key={pedido.id_pedido}>
                      <td>
                        <strong>#{pedido.id_pedido}</strong>
                        <br />
                        <small style={{ color: 'var(--gray)' }}>{pedido.nota_fiscal}</small>
                      </td>
                      <td>{formatDate(pedido.data_pedido)}</td>
                      <td>{pedido.nome_cliente}</td>
                      <td>{pedido.nome_funcionario || '-'}</td>
                      <td>
                        <span className={`badge ${pedido.tipo_venda === 'Online' ? 'badge-secondary' : 'badge-info'}`}>
                          {pedido.tipo_venda}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          pedido.status_pedido === 'Entregue' ? 'badge-success' :
                          pedido.status_pedido === 'Cancelado' ? 'badge-danger' :
                          pedido.status_pedido === 'Pago' ? 'badge-info' : 'badge-warning'
                        }`}>
                          {pedido.status_pedido}
                        </span>
                      </td>
                      <td><strong>{formatCurrency(pedido.valor_total)}</strong></td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => handleVerDetalhes(pedido)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Pedido */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Pedido</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Cliente *</label>
                    <select
                      className="form-select"
                      value={formData.id_cliente}
                      onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {clientes.map(c => (
                        <option key={c.id_cliente} value={c.id_cliente}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Funcionário</label>
                    <select
                      className="form-select"
                      value={formData.id_funcionario}
                      onChange={(e) => setFormData({ ...formData, id_funcionario: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {funcionarios.map(f => (
                        <option key={f.id_funcionario} value={f.id_funcionario}>{f.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipo de Venda *</label>
                    <select
                      className="form-select"
                      value={formData.tipo_venda}
                      onChange={(e) => setFormData({ ...formData, tipo_venda: e.target.value })}
                      required
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Forma de Pagamento *</label>
                    <select
                      className="form-select"
                      value={formData.forma_pagamento}
                      onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                      required
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartao de Credito">Cartão de Crédito</option>
                      <option value="Cartao de Debito">Cartão de Débito</option>
                      <option value="Pix">Pix</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cupom de Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.cupom_desconto}
                    onChange={(e) => setFormData({ ...formData, cupom_desconto: parseFloat(e.target.value) || 0 })}
                    min="0"
                  />
                </div>

                <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '2px solid var(--light-gray)' }} />

                <div className="form-group">
                  <label className="form-label">Adicionar Livros *</label>
                  <select
                    className="form-select"
                    onChange={(e) => { adicionarLivro(e.target.value); e.target.value = ''; }}
                  >
                    <option value="">Selecione um livro...</option>
                    {livros.filter(l => l.quantidade_estoque > 0).map(l => (
                      <option key={l.id_livro} value={l.id_livro}>
                        {l.titulo} - {formatCurrency(l.preco)} (Est: {l.quantidade_estoque})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.livros.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <table style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Livro</th>
                          <th>Preço</th>
                          <th>Qtd</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.livros.map(item => {
                          const livro = livros.find(l => l.id_livro === item.id_livro);
                          return (
                            <tr key={item.id_livro}>
                              <td>{livro?.titulo}</td>
                              <td>{formatCurrency(item.preco_unitario)}</td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  max={livro?.quantidade_estoque}
                                  value={item.quantidade}
                                  onChange={(e) => atualizarQuantidade(item.id_livro, e.target.value)}
                                  style={{ width: '60px', padding: '0.25rem' }}
                                />
                              </td>
                              <td><strong>{formatCurrency(item.preco_unitario * item.quantidade)}</strong></td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removerLivro(item.id_livro)}
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.25rem' }}>
                      <strong>Total: {formatCurrency(calcularTotal())}</strong>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetalhes && pedidoSelecionado && (
        <div className="modal-overlay" onClick={() => setShowDetalhes(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Detalhes do Pedido #{pedidoSelecionado.id_pedido}</h3>
              <button className="modal-close" onClick={() => setShowDetalhes(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-2">
                <div>
                  <p><strong>Cliente:</strong> {pedidoSelecionado.nome_cliente}</p>
                  <p><strong>Data:</strong> {formatDate(pedidoSelecionado.data_pedido)}</p>
                  <p><strong>Status:</strong> {pedidoSelecionado.status_pedido}</p>
                </div>
                <div>
                  <p><strong>Funcionário:</strong> {pedidoSelecionado.nome_funcionario || '-'}</p>
                  <p><strong>Tipo:</strong> {pedidoSelecionado.tipo_venda}</p>
                  <p><strong>Pagamento:</strong> {pedidoSelecionado.forma_pagamento}</p>
                </div>
              </div>
              
              <hr style={{ margin: '1.5rem 0' }} />
              
              <h4>Itens do Pedido</h4>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Livro</th>
                    <th>Quantidade</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoSelecionado.itens && pedidoSelecionado.itens.map(item => (
                    <tr key={item.id_livro}>
                      <td>{item.titulo}</td>
                      <td>{item.quantidade}</td>
                      <td>{formatCurrency(item.preco_unitario)}</td>
                      <td><strong>{formatCurrency(item.preco_unitario * item.quantidade)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.25rem' }}>
                <strong>Total: {formatCurrency(pedidoSelecionado.valor_total)}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDetalhes(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pedidos;