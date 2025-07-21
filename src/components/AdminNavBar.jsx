
import { useState } from 'react';
import './AdminNavbar.css';

function AdminNavBar({ currentView, onViewChange, user, onLogout }) {
  const menuItems = [
    { key: 'inicio', label: 'Inicio', icon: '🏠' },
    { key: 'usuarios', label: 'Usuarios', icon: '👥' },
    { key: 'eventos', label: 'Eventos', icon: '📅' },
    { key: 'formularios', label: 'Formularios', icon: '📝' },
    { key: 'personalizacion', label: 'Personalizar', icon: '🎨' },
    { key: 'tablerocontrol', label: 'Tablero de Control', icon: '📊' },
    { key: 'newsletter', label: 'Newsletter', icon: '�' }
  ];

  return (
    <nav className="admin-navbar">
      <div className="navbar-brand">
        <h2>RedAcero Admin</h2>
      </div>
      
      <div className="navbar-menu">
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            className={`menu-item ${currentView === item.key ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-user">
        <span className="user-info">
          👤 {user?.email || 'Usuario'}
        </span>
        <button onClick={onLogout} className="logout-btn">
          🚪 Salir
        </button>
      </div>
    </nav>
  );
}

export default AdminNavBar;