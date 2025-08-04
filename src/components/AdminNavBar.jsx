import { useState } from 'react';
import './AdminNavbar.css';

function AdminNavBar({ currentView, onViewChange, user, onLogout, usuarios }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReferentes, setShowReferentes] = useState(false);

  const menuItems = [
    { key: 'inicio', label: 'Inicio', icon: '🏠' },
    { key: 'usuarios', label: 'Usuarios', icon: '👥' },
    { key: 'eventos', label: 'Eventos', icon: '📅' },
    { key: 'formularios', label: 'Formularios', icon: '📝' },
    { key: 'personalizacion', label: 'Personalizar', icon: '🎨' },
    { key: 'tablerocontrol', label: 'Tablero de Control', icon: '📊' },
    { key: 'newsletter', label: 'Newsletter', icon: '📧' },
    { key: 'listados', label: 'Listados', icon: '📋' },
  ];

  return (
    <nav className="admin-navbar">
      <div className="navbar-brand">
        <h2>RedAcero Admin</h2>
      </div>
      
      <div className="navbar-menu">
        {menuItems.map(item =>
          item.key === 'listados' ? (
            <div
              key={item.key}
              className="dropdown"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <button
                className={`menu-item ${currentView === item.key ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label} ▼</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#5754a4',
                  border: '0px solid #ccc',
                  borderRadius: 12,
                  minWidth: 300,
                  zIndex: 100
                }}>
                  <button className="dropdown-item" onClick={() => onViewChange('agenda')}>
                    Listado de personas para Agenda
                  </button>
                <button className="dropdown-item" onClick={() => onViewChange('roomingList')}>
                    Rooming List
                </button>
                  <button className="dropdown-item" onClick={() => onViewChange('referentes')}>
                    Listado de control de usuarios referentes (sin Login/Formulario)
                  </button>
                  <button className="dropdown-item" onClick={() => onViewChange('detallado')}>
                    Listado detallado de personas para acreditación
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={`menu-item ${currentView === item.key ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          )
        )}
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