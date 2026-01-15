import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fornecedoresAPI } from '../services/api';

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    nome_responsavel: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      const response = await fornecedoresAPI.getAll();
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fornecedoresAPI.create(formData);
      alert('Fornecedor cadastrado!');
      setShowModal(false);
      resetForm();
      loadFornecedores();
    } catch (error) {
      alert('Erro ao cadastrar fornecedor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este fornecedor?')) return;

    try {
      await fornecedoresAPI.delete(id);
      alert('Fornecedor excluído!');
      loadFornecedores();
    } catch (error) {
      alert('Erro ao excluir fornecedor');
    }
  };

  const resetForm = () => {
    setFormData({
      nome_empresa: '',
      cnpj: '',
      nome_responsavel: '',
      email: '',
      telefone: '',
      endereco: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <h2>Gerenciamento de Fornecedores</h2>
        <p>Administre os fornecedores de livros</p>
      </div>

      <div className="card">
        <div className="card-header">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Novo Fornecedor
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Responsável</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Total Livros</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((f) => (
                  <tr key={f.id_fornecedor}>
                    <td><strong>{f.nome_empresa}</strong></td>
                    <td>{f.cnpj}</td>
                    <td>{f.nome_responsavel}</td>
                    <td>{f.email || '-'}</td>
                    <td>{f.telefone || '-'}</td>
                    <td>
                      <span className="badge badge-info">
                        {f.total_livros || 0}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(f.id_fornecedor)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Fornecedor</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Empresa *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.nome_empresa}
                    onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">CNPJ *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Responsável *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.nome_responsavel}
                      onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    />
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
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fornecedores;
