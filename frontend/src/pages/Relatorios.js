import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { relatoriosAPI } from '../services/api';

function Relatorios() {
  const [activeTab, setActiveTab] = useState('clientes-gastos');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Definição das abas
  const tabs = [
    { id: 'clientes-gastos', label: 'Clientes e Gastos', api: relatoriosAPI.getClientesGastos },
    { id: 'funcionarios-media', label: 'Funcionários Acima Média', api: relatoriosAPI.getFuncionariosAcimaMedia },
    { id: 'livros-nao-vendidos', label: 'Livros Não Vendidos', api: relatoriosAPI.getLivrosNaoVendidos },
    { id: 'clientes-pedidos-altos', label: 'Clientes Pedidos Altos', api: relatoriosAPI.getClientesPedidosAltos },
    { id: 'fornecedores-ativos', label: 'Fornecedores Ativos', api: relatoriosAPI.getFornecedoresAtivos },
    { id: 'livros-media-tecnicos', label: 'Livros > Média Técnicos', api: relatoriosAPI.getLivrosAcimaMediaTecnicos },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return;

    try {
      setLoading(true);
      const response = await tab.api();
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  
  // A função exportarCSV deve estar AQUI, dentro do componente, antes do return
  const exportarCSV = () => {
    if (data.length === 0) return;
    
    const tab = tabs.find(t => t.id === activeTab);
    // Cria o cabeçalho CSV
    const headers = Object.keys(data[0]).join(',');
    // Cria as linhas do CSV
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${tab.label}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderTable = () => {
    if (loading) {
      return <div className="loading"><div className="spinner"></div></div>;
    }

    if (data.length === 0) {
      return (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-state-icon" />
          <p>Nenhum dado encontrado</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'clientes-gastos':
        return (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total Pedidos</th>
                <th>Total Gasto</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.nome}</strong></td>
                  <td>{item.email || '-'}</td>
                  <td>{item.total_pedidos}</td>
                  <td><strong>{formatCurrency(item.total_gasto)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'funcionarios-media':
        return (
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Cargo</th>
                <th>Total Vendas</th>
                <th>Média Geral</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.nome}</strong></td>
                  <td><span className="badge badge-info">{item.cargo}</span></td>
                  <td><strong>{formatCurrency(item.total_vendas)}</strong></td>
                  <td>{formatCurrency(item.media_geral)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'livros-nao-vendidos':
        return (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Gênero</th>
                <th>Estoque</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.titulo}</strong></td>
                  <td>{item.autor}</td>
                  <td><span className="badge badge-warning">{item.genero}</span></td>
                  <td>{item.quantidade_estoque}</td>
                  <td>{formatCurrency(item.preco)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'clientes-pedidos-altos':
        return (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Maior Pedido</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.nome}</strong></td>
                  <td>{item.email || '-'}</td>
                  <td><strong>{formatCurrency(item.maior_pedido)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'fornecedores-ativos':
        return (
          <table>
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Total Livros</th>
                <th>Total Vendas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.nome_empresa}</strong></td>
                  <td>{item.email || '-'}</td>
                  <td>{item.telefone || '-'}</td>
                  <td>{item.total_livros}</td>
                  <td><strong>{item.total_vendas}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'livros-media-tecnicos':
        return (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Gênero</th>
                <th>Preço</th>
                <th>Média Técnicos</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.titulo}</strong></td>
                  <td>{item.autor}</td>
                  <td><span className="badge badge-info">{item.genero}</span></td>
                  <td><strong>{formatCurrency(item.preco)}</strong></td>
                  <td>{formatCurrency(item.media_tecnicos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Relatórios e Consultas</h2>
        <p>Análises e consultas complexas do banco de dados</p>
      </div>

      <div className="card">
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          overflowX: 'auto',
          padding: '0.5rem',
          borderBottom: '2px solid var(--light-gray)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="table-container">
          {renderTable()}
        </div>
      </div>

      <div className="card">
        <div className="card-header"> 
          <h3 className="card-title">
            <BarChart3 size={20} />
            Relatórios e Consultas
          </h3>
          <button 
            className="btn btn-success"
            onClick={exportarCSV}
            disabled={data.length === 0}
          >
            <Download size={20} />
            Exportar CSV
          </button>
        </div>
        <div style={{ padding: '1rem' }}>
          <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>
            Estas consultas demonstram o uso de operadores SQL avançados como:
          </p>
          <ul style={{ color: 'var(--gray)', paddingLeft: '2rem' }}>
            <li><strong>INNER JOIN e LEFT JOIN:</strong> Para combinar dados de múltiplas tabelas relacionadas</li>
            <li><strong>GROUP BY e HAVING:</strong> Para agregações e filtragem de grupos</li>
            <li><strong>Subconsultas (ALL, ANY, EXISTS):</strong> Para comparações complexas</li>
            <li><strong>Funções agregadas (COUNT, SUM, AVG):</strong> Para cálculos estatísticos</li>
            <li><strong>VIEW:</strong> Visualizações materializadas de dados complexos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;