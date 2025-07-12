/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\AdminNavbar.jsx */
import { useState } from 'react';
import './AdminNavbar.css';

function AdminNavbar({ onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('usuarios');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    onNavigate(tab);
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-brand">
        <h2>Eventos Red Acero - Administrador</h2>
      </div>
      <div className="navbar-tabs">
        <button
          className={activeTab === 'usuarios' ? 'active' : ''}
          onClick={() => handleTabClick('usuarios')}
        >
          Administración de Usuarios
        </button>
        <button
          className={activeTab === 'eventos' ? 'active' : ''}
          onClick={() => handleTabClick('eventos')}
        >
          Administrar Eventos
        </button>
        <button
          className={activeTab === 'formularios' ? 'active' : ''}
          onClick={() => handleTabClick('formularios')}
        >
          Formularios
        </button>
      </div>
      <button className="logout-btn" onClick={onLogout}>
        Cerrar Sesión
      </button>
    </nav>
  );
}

export default AdminNavbar;