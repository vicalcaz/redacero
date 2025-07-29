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
// Recibe opcionalmente horaSalida. Si horaSalida <= '10:00', no incluye el día de salida.
function getRangoFechas(desde, hasta, horaSalida) {
  const fechas = [];
  let d = new Date(desde + 'T00:00:00Z');
  let h = new Date(hasta + 'T00:00:00Z');
  // Si la hora de salida es <= 10:00, no incluir el día de salida
  if (!horaSalida || horaSalida <= '10:00') {
    h.setUTCDate(h.getUTCDate() - 1);
  }
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
      // Rango de fechas ocupadas por esta persona (ajustado por hora de salida)
      const fechas = getRangoFechas(p.fechaLlegada, p.fechaSalida, p.horaSalida);
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

  // Calcular noches y habitaciones tomadas sin doble conteo, igual que en FormularioSocio.jsx
  let totalHabitaciones = 0;
  let totalNoches = 0;
  const habitaciones = new Map(); // id único -> noches
  formularios.forEach(f => {
    if (!f.personas || !Array.isArray(f.personas)) return;
    f.personas.forEach(p => {
      if (p.tipoHabitacion === 'doble' || p.tipoHabitacion === 'matrimonial') {
        if (p.comparteHabitacion && p.comparteCon) {
          // Usar un id único para la pareja (menor id primero)
          const ids = [p.id, Number(p.comparteCon)].sort((a, b) => a - b).join('-');
          // Buscar compañero
          const companero = f.personas.find(o => String(o.id) === String(p.comparteCon));
          if (companero && companero.fechaLlegada && companero.fechaSalida && p.fechaLlegada && p.fechaSalida) {
            // Calcular noches desde la mínima llegada hasta la máxima salida
            const minLlegada = Math.min(new Date(p.fechaLlegada + 'T00:00:00').getTime(), new Date(companero.fechaLlegada + 'T00:00:00').getTime());
            const maxSalida = Math.max(new Date(p.fechaSalida + 'T00:00:00').getTime(), new Date(companero.fechaSalida + 'T00:00:00').getTime());
            const noches = Math.max(1, Math.round((maxSalida - minLlegada) / (1000 * 60 * 60 * 24)));
            if (!habitaciones.has(ids) || noches > habitaciones.get(ids)) {
              habitaciones.set(ids, noches);
            }
          }
        } else if (!f.personas.some(o => o.comparteHabitacion && Number(o.comparteCon) === p.id)) {
          // Solo agregar si no es el "compañero" de otra persona (evita doble conteo)
          habitaciones.set(String(p.id), p.noches || 0);
        }
      }
    });
  });
  totalHabitaciones = habitaciones.size;
  totalNoches = 0;
  habitaciones.forEach(n => { totalNoches += n; });

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

          {/* Card de noches ocupadas */}
          <div className="stat-card noches" style={{background:'#e3f2fd', border:'1px solid #90caf9', position: 'relative', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>🌙</div>
              <div>
                <h3 style={{margin: 0}}>Noches ocupadas</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>{totalNoches}</span>
                <div style={{fontSize: '0.98em', color: '#388e3c', marginTop: 2}}>
                  <b>Nota:</b> <span style={{fontSize: '0.78em'}}>Cada noche ocupada por una habitación doble compartida o matrimonial se suma una vez.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de habitaciones tomadas */}
          <div className="stat-card habitaciones" style={{background:'#e3f2fd', border:'1px solid #90caf9', position: 'relative', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>🏨</div>
              <div>
                <h3 style={{margin: 0}}>Habitaciones tomadas</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>{totalHabitaciones}</span>
                <div style={{fontSize: '0.98em', color: '#1976d2', marginTop: 2}}>
                  <b>Nota:</b> <span style={{fontSize: '0.78em'}}>Si una habitación doble es compartida por varias noches, se cuenta solo una vez en el total.</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowHabitacionesDetalle(v => !v)}
              className="stat-action"
              style={{marginTop: 16}}
            >
              {showHabitacionesDetalle ? 'Ocultar detalle' : 'Ver detalle →'}
            </button>
          </div>

          {/* Card de personas registradas */}
          <div className="stat-card personas-registradas" style={{background:'#f8fafc', border:'1px solid #90caf9', position: 'relative', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>👥</div>
              <div>
                <h3 style={{margin: 0}}>Personas registradas</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>{(() => {
                  let total = 0;
                  formularios.forEach(f => {
                    if (Array.isArray(f.personas)) total += f.personas.length;
                  });
                  return total;
                })()}</span>
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 32, marginTop: 0, width: '100%'}}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70}}>
                <span style={{fontSize: '1.1rem'}}>🧑‍💼</span>
                <span style={{fontSize: '0.98rem', color: '#1976d2', fontWeight: 500, marginTop: 2}}>Socios</span>
                <span style={{fontSize: '1.15rem', fontWeight: 600, marginTop: 2}}>{(() => {
                  let socios = 0;
                  formularios.forEach(f => {
                    if (f.tipo === 'socio' && Array.isArray(f.personas)) socios += f.personas.length;
                  });
                  return socios;
                })()}</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70}}>
                <span style={{fontSize: '1.1rem'}}>🏨</span>
                <span style={{fontSize: '0.98rem', color: '#1976d2', fontWeight: 500, marginTop: 2}}>Prov. c/hotel</span>
                <span style={{fontSize: '1.15rem', fontWeight: 600, marginTop: 2}}>{(() => {
                  let provCon = 0;
                  formularios.forEach(f => {
                    if (f.tipo === 'proveedor-con-hotel' && Array.isArray(f.personas)) provCon += f.personas.length;
                  });
                  return provCon;
                })()}</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70}}>
                <span style={{fontSize: '1.1rem'}}>🚚</span>
                <span style={{fontSize: '0.98rem', color: '#1976d2', fontWeight: 500, marginTop: 2}}>Prov. s/hotel</span>
                <span style={{fontSize: '1.15rem', fontWeight: 600, marginTop: 2}}>{(() => {
                  let provSin = 0;
                  formularios.forEach(f => {
                    if (f.tipo === 'proveedor-sin-hotel' && Array.isArray(f.personas)) provSin += f.personas.length;
                  });
                  return provSin;
                })()}</span>
              </div>
            </div>
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
    if (vista === 'inicio') {
      cargarEstadisticas();
    }
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

