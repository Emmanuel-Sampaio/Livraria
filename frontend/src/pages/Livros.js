import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search,AlertCircle } from 'lucide-react';
import { livrosAPI, fornecedoresAPI } from '../services/api';

function Livros() {
  const [livros, setLivros] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLivro, setEditingLivro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    editora: '',
    edicao: '',
    ano_publicacao: '',
    genero: '',
    isbn: '',
    tipo_livro: 'Fisico',
    quantidade_estoque: 0,
    preco: '',
    fornecedores: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [livrosRes, fornecedoresRes] = await Promise.all([
        livrosAPI.getAll(),
        fornecedoresAPI.getAll()
      ]);
      setLivros(livrosRes.data);
      setFornecedores(fornecedoresRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLivro) {
        await livrosAPI.update(editingLivro.id_livro, formData);
        alert('Livro atualizado com sucesso!');
      } else {
        await livrosAPI.create(formData);
        alert('Livro cadastrado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      alert('Erro ao salvar livro: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (livro) => {
    setEditingLivro(livro);
    setFormData({
      titulo: livro.titulo,
      autor: livro.autor,
      editora: livro.editora || '',
      edicao: livro.edicao || '',
      ano_publicacao: livro.ano_publicacao || '',
      genero: livro.genero || '',
      isbn: livro.isbn || '',
      tipo_livro: livro.tipo_livro,
      quantidade_estoque: livro.quantidade_estoque,
      preco: livro.preco,
      fornecedores: []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este livro?')) {
      try {
        await livrosAPI.delete(id);
        alert('Livro deletado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao deletar livro:', error);
        alert('Erro ao deletar livro');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      autor: '',
      editora: '',
      edicao: '',
      ano_publicacao: '',
      genero: '',
      isbn: '',
      tipo_livro: 'Fisico',
      quantidade_estoque: 0,
      preco: '',
      fornecedores: []
    });
    setEditingLivro(null);
  };

  const filteredLivros = livros.filter(livro =>
    livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    livro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    livro.genero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div>
      <div className="page-header">
        {/* ADICIONE ESTE CARD DE ALERTA */}
      {livros.filter(l => l.quantidade_estoque < 10 && l.quantidade_estoque > 0).length > 0 && (
        <div className="card" style={{ 
          borderLeft: '4px solid var(--warning)', 
          backgroundColor: '#fffbeb' 
        }}>
          <div style={{ padding: '1rem' }}>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              Alerta de Estoque Baixo
            </h4>
            <p style={{ color: 'var(--dark)', marginBottom: '0.5rem' }}>
              {livros.filter(l => l.quantidade_estoque < 10 && l.quantidade_estoque > 0).length} livro(s) com estoque abaixo de 10 unidades:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {livros.filter(l => l.quantidade_estoque < 10 && l.quantidade_estoque > 0).map(livro => (
                <span key={livro.id_livro} className="badge badge-warning">
                  {livro.titulo} ({livro.quantidade_estoque} un.)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
        <h2>Gerenciamento de Livros</h2>
        <p>Controle o catálogo de livros da livraria</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--gray)'
              }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por título, autor ou gênero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Novo Livro
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Gênero</th>
                  <th>Tipo</th>
                  <th>Estoque</th>
                  <th>Preço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLivros.map((livro) => (
                  <tr key={livro.id_livro}>
                    <td>
                      <strong>{livro.titulo}</strong>
                      <br />
                      <small style={{ color: 'var(--gray)' }}>
                        ISBN: {livro.isbn || 'N/A'}
                      </small>
                    </td>
                    <td>{livro.autor}</td>
                    <td>
                      <span className="badge badge-info">{livro.genero}</span>
                    </td>
                    <td>
                      <span className={`badge ${livro.tipo_livro === 'Digital' ? 'badge-secondary' : 'badge-success'}`}>
                        {livro.tipo_livro}
                      </span>
                    </td>
                    <td>
                      <span className={livro.quantidade_estoque < 10 ? 'badge badge-danger' : ''}>
                        {livro.quantidade_estoque}
                      </span>
                    </td>
                    <td><strong>{formatCurrency(livro.preco)}</strong></td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => handleEdit(livro)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(livro.id_livro)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingLivro ? 'Editar Livro' : 'Novo Livro'}
              </h3>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Título *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Autor *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.autor}
                      onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Editora</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.editora}
                      onChange={(e) => setFormData({ ...formData, editora: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ISBN</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">Edição</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.edicao}
                      onChange={(e) => setFormData({ ...formData, edicao: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ano</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.ano_publicacao}
                      onChange={(e) => setFormData({ ...formData, ano_publicacao: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gênero</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-select"
                      value={formData.tipo_livro}
                      onChange={(e) => setFormData({ ...formData, tipo_livro: e.target.value })}
                      required
                    >
                      <option value="Fisico">Físico</option>
                      <option value="Digital">Digital</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estoque *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.quantidade_estoque}
                      onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preço *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
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
                  {editingLivro ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Livros;
