import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { funcionariosAPI } from '../services/api';

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cargo: '',
    email: '',
    salario: '',
    comissao_percentual: ''
  });

  useEffect(() => {
    loadFuncionarios();
  }, []);

  const loadFuncionarios = async () => {
    try {
      const response = await funcionariosAPI.getAll();
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  // --------- CADASTRAR ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await funcionariosAPI.create(formData);
      alert('Funcionário cadastrado!');
      setShowModal(false);
      resetForm();
      loadFuncionarios();
    } catch (error) {
      alert('Erro ao cadastrar funcionário');
    }
  };

  // --------- EXCLUIR ----------
  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este funcionário?')) return;

    try {
      await funcionariosAPI.delete(id);
      alert('Funcionário excluído!');
      loadFuncionarios();
    } catch (error) {
      alert('Erro ao excluir funcionário');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      cargo: '',
      email: '',
      salario: '',
      comissao_percentual: ''
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);

  return (
    <div>
      <div className="page-header">
        <h2>Gerenciamento de Funcionários</h2>
        <p>Administre a equipe da livraria</p>
      </div>

      <div className="card">
        <div className="card-header">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Cadastrar Funcionário
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
                  <th>Cargo</th>
                  <th>Email</th>
                  <th>Salário</th>
                  <th>Comissão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f) => (
                  <tr key={f.id_funcionario}>
                    <td>
                      <strong>{f.nome}</strong><br />
                      <small>{f.cpf}</small>
                    </td>
                    <td>{f.cargo}</td>
                    <td>{f.email || '-'}</td>
                    <td>{formatCurrency(f.salario)}</td>
                    <td>{f.comissao_percentual}%</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(f.id_funcionario)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {funcionarios.length === 0 && (
                  <tr>
                    <td colSpan="6">Nenhum funcionário cadastrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------- MODAL -------- */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => { setShowModal(false); resetForm(); }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Funcionário</h3>
              <button
                className="modal-close"
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">CPF *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cargo *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
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
                    <label className="form-label">Salário</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.salario}
                      onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Comissão (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.comissao_percentual}
                    onChange={(e) =>
                      setFormData({ ...formData, comissao_percentual: e.target.value })
                    }
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

export default Funcionarios;
