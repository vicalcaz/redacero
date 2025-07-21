import { useState, useEffect } from 'react';
import AdminNavBar from './AdminNavBar.css';
import UserManagement from './UserManagement';
import EventManagement from './EventManagement';
import FormularioManagement from './FormularioManagement';
import PersonalizacionFormularios from './PersonalizacionFormularios';
import EventosDestacados from './EventosDestacados';
import { FirebaseService } from '../services/FirebaseService';
import './Dashboard.css';

function Dashboard({ usuario, onLogout, onNavigateToEventos }) {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalEventos: 0,
    totalFormularios: 0,
    eventosDestacados: 0
  });
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [formularios, setFormularios] = useState([]);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      const [usuariosData, eventos, formulariosData] = await Promise.all([
        FirebaseService.obtenerUsuarios(),
        FirebaseService.obtenerEventos(),
        FirebaseService.obtenerFormularios()
      ]);

      setUsuarios(usuariosData);
      setFormularios(formulariosData);

      setEstadisticas({
        totalUsuarios: usuariosData.length,
        totalEventos: eventos.length,
        totalFormularios: formulariosData.length,
        eventosDestacados: eventos.filter(e => e.destacado).length
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (vista) => {
    setVistaActual(vista);
  };

  const renderVistaActual = () => {
    switch (vistaActual) {
      case 'usuarios':
        return <UserManagement />;
      case 'eventos':
        return <EventManagement />;
      case 'formularios':
        return <FormularioManagement user={usuario} />;
      case 'personalizacion':
        return <PersonalizacionFormularios user={usuario} />;
      case 'inicio':
      default:
        return (
          <div className="dashboard-inicio">
            <div className="welcome-section">
              <div className="welcome-header">
                <h1>¡Bienvenido al Panel de Administración!</h1>
                <p>Gestiona eventos, usuarios y formularios de Red Acero</p>
              </div>
              
              <div className="user-info-card">
                <div className="user-avatar">👤</div>
                <div className="user-details">
                  <h3>{usuario.email}</h3>
                  <span className="user-role">{usuario.perfil}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="stats-loading">
                <div className="loading-spinner"></div>
                <p>Cargando estadísticas...</p>
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card usuarios">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Usuarios</h3>
                    <span className="stat-number">{estadisticas.totalUsuarios}</span>
                    <p>Usuarios registrados</p>
                  </div>
                  <button 
                    onClick={() => handleViewChange('usuarios')}
                    className="stat-action"
                  >
                    Gestionar →
                  </button>
                </div>

                <div className="stat-card eventos">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>Eventos</h3>
                    <span className="stat-number">{estadisticas.totalEventos}</span>
                    <p>Eventos creados</p>
                  </div>
                  <button 
                    onClick={() => handleViewChange('eventos')}
                    className="stat-action"
                  >
                    Gestionar →
                  </button>
                </div>

                <div className="stat-card formularios">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <h3>Formularios</h3>
                    <span className="stat-number">{estadisticas.totalFormularios}</span>
                    <p>Formularios enviados</p>
                  </div>
                  <button 
                    onClick={() => handleViewChange('formularios')}
                    className="stat-action"
                  >
                    Ver →
                  </button>
                </div>

                <div className="stat-card destacados">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <h3>Destacados</h3>
                    <span className="stat-number">{estadisticas.eventosDestacados}</span>
                    <p>Eventos destacados</p>
                  </div>
                  <button 
                    onClick={onNavigateToEventos}
                    className="stat-action"
                  >
                    Ver sitio →
                  </button>
                </div>
              </div>
            )}

            <div className="quick-actions">
              <h2>Acciones Rápidas</h2>
              <div className="actions-grid">
                <button 
                  onClick={() => handleViewChange('eventos')}
                  className="quick-action-btn primary"
                >
                  <span className="action-icon">➕</span>
                  <span>Crear Evento</span>
                </button>
                
                <button 
                  onClick={() => handleViewChange('usuarios')}
                  className="quick-action-btn secondary"
                >
                  <span className="action-icon">👤</span>
                  <span>Nuevo Usuario</span>
                </button>
                
                <button 
                  onClick={() => handleViewChange('formularios')}
                  className="quick-action-btn tertiary"
                >
                  <span className="action-icon">📊</span>
                  <span>Ver Formularios</span>
                </button>
                
                <button 
                  onClick={() => handleViewChange('personalizacion')}
                  className="quick-action-btn quaternary"
                >
                  <span className="action-icon">🎨</span>
                  <span>Personalizar</span>
                </button>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Actividad Reciente</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">📅</div>
                  <div className="activity-content">
                    <p><strong>Sistema iniciado</strong></p>
                    <small>Panel de administración cargado exitosamente</small>
                  </div>
                  <div className="activity-time">Ahora</div>
                </div>
              </div>
            </div>

            {!loading && (
              <div className="usuarios-sin-formulario" style={{margin: '2rem 0', padding: '1rem', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8}}>
                <h4>Usuarios que no completaron el formulario</h4>
                {usuariosSinFormulario.length === 0 ? (
                  <p>Todos los usuarios han completado el formulario.</p>
                ) : (
                  <ul>
                    {usuariosSinFormulario.map(u => (
                      <li key={u.id || u.email}>{u.email}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  // Calcula los usuarios que no completaron el formulario (no admin)
  const usuariosSinFormulario = usuarios.filter(u =>
    u.perfil !== 'admin' &&
    !formularios.some(f => f.usuarioCreador === u.email)
  );

  return (
    <div className="dashboard">
      <AdminNavBar 
        currentView={vistaActual}
        onViewChange={handleViewChange}
        user={usuario}
        onLogout={onLogout}
      />
      
      <main className="dashboard-content">
        {renderVistaActual()}
      </main>
    </div>
  );
}

export default Dashboard;