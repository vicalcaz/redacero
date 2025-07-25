import { useState, useEffect } from 'react';

// ...existing code...
import AdminNavBar from './AdminNavBar';
import UserManagement from './UserManagement';
import EventManagement from './EventManagement';
import FormularioManagement from './FormularioManagement';
import FormulariosGuardados from './FormulariosGuardados';
import PersonalizacionFormularios from './PersonalizacionFormularios';
import EventosDestacados from './EventosDestacados';
import { FirebaseService } from '../services/FirebaseService';
import Newsletter from './Newsletter';
import './Dashboard.css';

// Utilidad para obtener rango de fechas entre dos strings YYYY-MM-DD (inclusive)
function getRangoFechas(desde, hasta) {
  const fechas = [];
  let d = new Date(desde + 'T00:00:00Z');
  const h = new Date(hasta + 'T00:00:00Z');
  while (d <= h) {
    fechas.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return fechas;
}

function ResumenHabitaciones({ formularios }) {
  // Map: { fecha: { dobles: Set de pares únicos, matrimoniales: count } }
  const ocupacion = {};
  formularios.forEach(f => {
    if (!f.personas || !Array.isArray(f.personas)) return;
    f.personas.forEach(p => {
      if (!p.fechaLlegada || !p.fechaSalida) return;
      // Rango de fechas ocupadas por esta persona
      const fechas = getRangoFechas(p.fechaLlegada, p.fechaSalida);
      fechas.forEach(fecha => {
        if (!ocupacion[fecha]) ocupacion[fecha] = { dobles: new Set(), matrimoniales: 0 };
        if (p.tipoHabitacion === 'matrimonial') {
          ocupacion[fecha].matrimoniales += 1;
        } else if (p.tipoHabitacion === 'doble' && p.comparteCon) {
          // Para evitar duplicados, crear un id de pareja ordenado
          const pareja = [String(p.id), String(p.comparteCon)].sort().join('-');
          ocupacion[fecha].dobles.add(pareja);
        }
      });
    });
  });
  // Mostrar tabla por día
  const fechas = Object.keys(ocupacion).sort();
  if (fechas.length === 0) return <p>No hay habitaciones ocupadas registradas.</p>;
  return (
    <table className="tabla-habitaciones" style={{width: '100%', borderCollapse: 'collapse', marginTop: 12}}>
      <thead>
        <tr>
          <th style={{borderBottom: '1px solid #90caf9'}}>Fecha</th>
          <th style={{borderBottom: '1px solid #90caf9'}}>Dobles</th>
          <th style={{borderBottom: '1px solid #90caf9'}}>Matrimoniales</th>
        </tr>
      </thead>
      <tbody>
        {fechas.map(fecha => (
          <tr key={fecha}>
            <td style={{padding: 4}}>{fecha.split('-').reverse().join('/')}</td>
            <td style={{padding: 4, textAlign: 'center'}}>{ocupacion[fecha].dobles.size}</td>
            <td style={{padding: 4, textAlign: 'center'}}>{ocupacion[fecha].matrimoniales}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DashboardInicio({ usuario, loading, estadisticas, handleViewChange, onNavigateToEventos, usuariosSinFormulario, formularios }) {

  const [showHabitacionesDetalle, setShowHabitacionesDetalle] = useState(false);
  const [showUsuariosSinFormDetalle, setShowUsuariosSinFormDetalle] = useState(false);

  // Calcular habitaciones tomadas (suma de dobles y matrimoniales por día)
  let totalHabitaciones = 0;
  const ocupacion = {};
  formularios.forEach(f => {
    if (!f.personas || !Array.isArray(f.personas)) return;
    f.personas.forEach(p => {
      if (!p.fechaLlegada || !p.fechaSalida) return;
      const fechas = getRangoFechas(p.fechaLlegada, p.fechaSalida);
      fechas.forEach(fecha => {
        if (!ocupacion[fecha]) ocupacion[fecha] = { dobles: new Set(), matrimoniales: 0 };
        if (p.tipoHabitacion === 'matrimonial') {
          ocupacion[fecha].matrimoniales += 1;
        } else if (p.tipoHabitacion === 'doble' && p.comparteCon) {
          const pareja = [String(p.id), String(p.comparteCon)].sort().join('-');
          ocupacion[fecha].dobles.add(pareja);
        }
      });
    });
  });
  totalHabitaciones = Object.values(ocupacion).reduce((acc, o) => acc + o.dobles.size + o.matrimoniales, 0);

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
          {/* Usuarios */}
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

          {/* Eventos */}
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

          {/* Formularios cargados */}
          <div className="stat-card formularios">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Formularios cargados</h3>
              <span className="stat-number">{estadisticas.totalFormularios}</span>
              <p>Formularios cargados</p>
            </div>
            <button 
              onClick={() => handleViewChange('formulariosGuardados')}
              className="stat-action"
            >
              Ver →
            </button>
          </div>

          {/* Destacados */}
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

          {/* Habitaciones tomadas */}
          <div className="stat-card habitaciones" style={{background:'#e3f2fd', border:'1px solid #90caf9'}}>
            <div className="stat-icon">🏨</div>
            <div className="stat-content">
              <h3>Habitaciones tomadas</h3>
              <span className="stat-number">{totalHabitaciones}</span>
              <p>Sumatoria de dobles y matrimoniales</p>
            </div>
            <button 
              onClick={() => setShowHabitacionesDetalle(v => !v)}
              className="stat-action"
            >
              {showHabitacionesDetalle ? 'Ocultar detalle' : 'Ver →'}
            </button>
          </div>

          {/* Usuarios sin formulario */}
          <div className="stat-card sin-formulario" style={{background:'#fff3cd', border:'1px solid #ffeeba'}}>
            <div className="stat-icon">❗</div>
            <div className="stat-content">
              <h3>Usuarios sin formulario</h3>
              <span className="stat-number">{usuariosSinFormulario.length}</span>
              <p>No han completado el formulario</p>
            </div>
            <button 
              onClick={() => setShowUsuariosSinFormDetalle(v => !v)}
              className="stat-action"
            >
              {showUsuariosSinFormDetalle ? 'Ocultar detalle' : 'Ver detalle'}
            </button>
          </div>
        </div>
      )}

      {/* Detalle habitaciones tomadas solo al hacer click en la card */}
      {showHabitacionesDetalle && (
        <div className="habitaciones-resumen" style={{margin: '2rem 0', padding: '1rem', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 8}}>
          <h4>Habitaciones ocupadas por día</h4>
          <ResumenHabitaciones formularios={formularios} />
        </div>
      )}

      {/* Detalle usuarios sin formulario solo al hacer click en la card */}
      {showUsuariosSinFormDetalle && (
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

function Dashboard({ usuario, onLogout, onNavigateToEventos, onNavigateToDashboard, onNavigateToInicio }) {
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
  const [usuariosSinFormulario, setUsuariosSinFormulario] = useState([]);


  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      // Cargar datos reales desde FirebaseService
      const [usuariosData, eventosData, formulariosData] = await Promise.all([
        FirebaseService.obtenerUsuarios ? FirebaseService.obtenerUsuarios() : [],
        FirebaseService.obtenerEventos ? FirebaseService.obtenerEventos() : [],
        FirebaseService.obtenerFormularios ? FirebaseService.obtenerFormularios() : []
      ]);
      setUsuarios(usuariosData);
      setFormularios(formulariosData);
      setEstadisticas({
        totalUsuarios: usuariosData.length,
        totalEventos: eventosData.length,
        totalFormularios: formulariosData.length,
        eventosDestacados: eventosData.filter(e => e.destacado).length
      });
      // Usuarios sin formulario (no admin)
      const sinFormulario = usuariosData.filter(u =>
        u.perfil !== 'admin' &&
        !formulariosData.some(f => f.usuarioCreador === u.email)
      );
      setUsuariosSinFormulario(sinFormulario);
      setLoading(false);
    } catch (error) {
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
      case 'formulariosGuardados':
        return <FormulariosGuardados userPerfil={usuario?.perfil} userEmail={usuario?.email} />;
      case 'personalizacion':
        return <PersonalizacionFormularios user={usuario} />;
      case 'newsletter':
        return <Newsletter />;
      case 'inicio':
      default:
        return (
          <DashboardInicio
            usuario={usuario}
            loading={loading}
            estadisticas={estadisticas}
            handleViewChange={handleViewChange}
            onNavigateToEventos={onNavigateToEventos}
            usuariosSinFormulario={usuariosSinFormulario}
            formularios={formularios}
          />
        );
    }
  };

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

