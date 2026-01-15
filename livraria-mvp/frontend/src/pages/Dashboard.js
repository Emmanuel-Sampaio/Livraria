import React, { useState, useEffect } from 'react';
import { DollarSign, Users, BookOpen, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { relatoriosAPI, pedidosAPI } from '../services/api';


function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pedidos, setPedidos] = useState([]); 
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, pedidosRes] = await Promise.all([ 
        relatoriosAPI.getDashboard(),
        pedidosAPI.getAll() 
      ]);
      setDashboard(dashboardRes.data);
      setPedidos(pedidosRes.data); 
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>Erro ao carregar dados</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Visão geral do sistema de gerenciamento da livraria</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-header">
            <div>
              <div className="stat-title">Total de Vendas</div>
              <div className="stat-value">{formatCurrency(dashboard.vendas.valor_total)}</div>
              <div className="stat-description">
                {dashboard.vendas.total_pedidos} pedidos realizados
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Ticket Médio</div>
              <div className="stat-value">{formatCurrency(dashboard.vendas.ticket_medio)}</div>
              <div className="stat-description">Por pedido</div>
            </div>
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div>
              <div className="stat-title">Clientes Cadastrados</div>
              <div className="stat-value">{dashboard.clientes.total}</div>
              <div className="stat-description">Clientes ativos</div>
            </div>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-header">
            <div>
              <div className="stat-title">Livros em Estoque</div>
              <div className="stat-value">{dashboard.estoque.total_unidades}</div>
              <div className="stat-description">
                {dashboard.estoque.total_titulos} títulos diferentes
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#9f1239' }}>
              <BookOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Livros Mais Vendidos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={20} />
            Top 5 Livros Mais Vendidos
          </h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Gênero</th>
                <th>Unidades Vendidas</th>
                <th>Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.maisVendidos.map((livro) => (
                <tr key={livro.id_livro}>
                  <td><strong>{livro.titulo}</strong></td>
                  <td>{livro.autor}</td>
                  <td>
                    <span className="badge badge-info">{livro.genero}</span>
                  </td>
                  <td>{livro.total_vendido}</td>
                  <td><strong>{formatCurrency(livro.receita_total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid com 2 colunas */}
      <div className="grid grid-2">
        {/* Top Funcionários */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={20} />
              Top Funcionários
            </h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Vendas</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topFuncionarios.map((func) => (
                  <tr key={func.id_funcionario}>
                    <td>
                      <strong>{func.nome}</strong>
                      <br />
                      <small style={{ color: 'var(--gray)' }}>{func.cargo}</small>
                    </td>
                    <td>{func.total_vendas}</td>
                    <td><strong>{formatCurrency(func.valor_total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendas por Mês */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 size={20} />
              Vendas Recentes
            </h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.vendasPorMes.slice(0, 6).map((venda) => (
                  <tr key={venda.mes}>
                    <td>{venda.mes}</td>
                    <td>{venda.total_pedidos}</td>
                    <td><strong>{formatCurrency(venda.valor_total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
                
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <BarChart3 size={20} />
            Distribuição de Vendas
          </h3>
        </div>
        <div className="grid grid-2" style={{ padding: '2rem' }}>
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Por Tipo de Venda</h4>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              {[
                { tipo: 'Presencial', cor: 'var(--primary)' },
                { tipo: 'Online', cor: 'var(--secondary)' }
              ].map(item => {
                const total = pedidos.filter(p => p.tipo_venda === item.tipo).length;
                const percentual = pedidos.length > 0 ? (total / pedidos.length * 100).toFixed(1) : 0;
                return (
                  <div key={item.tipo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500' }}>{item.tipo}</span>
                      <span style={{ fontWeight: '600' }}>{total} ({percentual}%)</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: 'var(--light-gray)', 
                      borderRadius: '5px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${percentual}%`, 
                        height: '100%', 
                        backgroundColor: item.cor,
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Por Status</h4>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              {[
                { status: 'Entregue', cor: 'var(--success)' },
                { status: 'Pago', cor: 'var(--primary)' },
                { status: 'Em aberto', cor: 'var(--warning)' },
                { status: 'Cancelado', cor: 'var(--danger)' }
              ].map(item => {
                const total = pedidos.filter(p => p.status_pedido === item.status).length;
                const percentual = pedidos.length > 0 ? (total / pedidos.length * 100).toFixed(1) : 0;
                return (
                  <div key={item.status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500' }}>{item.status}</span>
                      <span style={{ fontWeight: '600' }}>{total} ({percentual}%)</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: 'var(--light-gray)', 
                      borderRadius: '5px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${percentual}%`, 
                        height: '100%', 
                        backgroundColor: item.cor,
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  );
}

export default Dashboard;
