import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { clientesAPI } from '../services/api';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    email: '',
    endereco: '',
    telefone: '',
    tipo_cliente: 'Fisica'
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async (termo = '') => {
    try {
      setLoading(true);
      const response = await clientesAPI.getAll(termo);
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadClientes(searchTerm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await clientesAPI.update(editingCliente.id_cliente, formData);
        alert('Cliente atualizado!');
      } else {
        await clientesAPI.create(formData);
        alert('Cliente cadastrado!');
      }
      setShowModal(false);
      resetForm();
      loadClientes(searchTerm);
    } catch (error) {
      alert('Erro ao salvar cliente');
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      cpf_cnpj: cliente.cpf_cnpj,
      email: cliente.email || '',
      endereco: cliente.endereco || '',
      telefone: cliente.telefone || '',
      tipo_cliente: cliente.tipo_cliente
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deletar este cliente?')) {
      try {
        await clientesAPI.delete(id);
        alert('Cliente deletado!');
        loadClientes(searchTerm);
      } catch (error) {
        alert('Erro ao deletar cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf_cnpj: '',
      email: '',
      endereco: '',
      telefone: '',
      tipo_cliente: 'Fisica'
    });
    setEditingCliente(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Gerenciamento de Clientes</h2>
        <p>Administre os clientes da livraria</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
            <Search 
              size={20} 
              onClick={handleSearch}
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--primary)',
                cursor: 'pointer'
              }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="Digite o nome desejado"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Tipo</th>
                  <th>Compras</th>
                  <th>Total Gasto</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td><strong>{cliente.nome}</strong></td>
                      <td>{cliente.cpf_cnpj}</td>
                      <td>{cliente.email || '-'}</td>
                      <td>{cliente.telefone || '-'}</td>
                      <td>
                        <span className={`badge ${cliente.tipo_cliente === 'Juridica' ? 'badge-secondary' : 'badge-info'}`}>
                          {cliente.tipo_cliente}
                        </span>
                      </td>
                      <td>{cliente.total_pedidos || 0}</td>
                      <td><strong>{formatCurrency(cliente.total_gasto)}</strong></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline" onClick={() => handleEdit(cliente)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cliente.id_cliente)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">CPF/CNPJ *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.cpf_cnpj}
                      onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-select"
                      value={formData.tipo_cliente}
                      onChange={(e) => setFormData({ ...formData, tipo_cliente: e.target.value })}
                      required
                    >
                      <option value="Fisica">Pessoa Física</option>
                      <option value="Juridica">Pessoa Jurídica</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Endereço</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCliente ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;