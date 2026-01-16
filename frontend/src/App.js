import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { BookOpen, Users, Package, UserCircle, ShoppingCart, BarChart3 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Livros from './pages/Livros';
import Clientes from './pages/Clientes';
import Fornecedores from './pages/Fornecedores';
import Funcionarios from './pages/Funcionarios';
import Pedidos from './pages/Pedidos';
import Relatorios from './pages/Relatorios';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>
              <BookOpen size={32} />
              LivrariaDB
            </h1>
            <p>Sistema de Gerenciamento</p>
          </div>
          <nav>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <BarChart3 size={20} />
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/livros" className="nav-link">
                  <BookOpen size={20} />
                  Livros
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/clientes" className="nav-link">
                  <Users size={20} />
                  Clientes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/fornecedores" className="nav-link">
                  <Package size={20} />
                  Fornecedores
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/funcionarios" className="nav-link">
                  <UserCircle size={20} />
                  Funcionários
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/pedidos" className="nav-link">
                  <ShoppingCart size={20} />
                  Pedidos
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/relatorios" className="nav-link">
                  <BarChart3 size={20} />
                  Relatórios
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/livros" element={<Livros />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
