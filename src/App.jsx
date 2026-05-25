import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventosDestacados from './components/EventosDestacados';
import FormularioSocio from './components/formularios/FormularioSocio';
import FormularioProveedorConHotel from './components/formularios/FormularioProveedorConHotel';
import FormularioProveedorSinHotel from './components/formularios/FormularioProveedorSinHotel';
import CambiarPasswordModal from './components/CambiarPasswordModal';
import Newsletter from './components/Newsletter';
import { EventoDestacadoProvider, useEventoDestacado } from "./context/EventoDestacadoContext";
import { FirebaseService } from "./services/FirebaseService";
import './App.css';
import ListadoReferentes from './components/ListadoReferentes';
import AdminNavBar from './components/AdminNavBar';
import RoomingList from './components/RoomingList';

// Agregar esta línea para exposición global:
window.FirebaseService = FirebaseService;

function App() {
  // Estado para los formularios
  const [formularios, setFormularios] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('eventos');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [forzarCambioPassword, setForzarCambioPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { eventoId, nombre, fechaDesde, fechaHasta, rolUsuario, setEventoId, setNombre, setFechaDesde, setFechaHasta, setRolUsuario } = useEventoDestacado();
  const [vistaActiva, setVistaActiva] = useState('socio');
  
//   const handleProveedorConHotel = (evento) => {
//   setVistaActiva('proveedor-con-hotel');
//   setEventoSeleccionado(evento);
// };

  // Loguear siempre que App se renderiza
  console.log('🌐 Variables globales evento:', { eventoId, nombre, fechaDesde, fechaHasta, rolUsuario });

  useEffect(() => {
    // Verificar si hay usuario logueado al iniciar
    //const usuarioGuardado = localStorage.getItem('usuario');
    //if (usuarioGuardado) {
    //   try {
    //     const userData = JSON.parse(usuarioGuardado);
    //     setUsuario(userData);
        
    //     // Si es primer login o no ha cambiado su password, forzar cambio
    //     if (userData.esPrimerLogin || !userData.passwordCambiado) {
    //       setForzarCambioPassword(true);
    //     }
    //   } catch (error) {
    //     console.error('Error parseando usuario guardado:', error);
    //     localStorage.removeItem('usuario');
    //   }
    // }

    // Inicializar datos de Firebase
    FirebaseService.inicializarDatos().catch(error => {
      console.error('Error inicializando Firebase:', error);
    });
  }, []);

  // 1. Corregir handleLogin para ser más claro:
  const handleLogin = (usuarioData) => {
    console.log('✅ Usuario logueado:', usuarioData);
    console.log('📊 Estado passwordCambiado:', usuarioData.passwordCambiado);
    
    setUsuario(usuarioData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    setRolUsuario(usuarioData.rol); // <-- Guarda el rol globalmente
    
    // ✅ SOLO usar passwordCambiado (que SÍ existe en la tabla)
    if (usuarioData.passwordCambiado === false || usuarioData.passwordCambiado === undefined) {
      console.log('🔄 App: Password no cambiado, solicitar cambio de contraseña');
      setForzarCambioPassword(true);
      setVistaActual('cambio-password');
    } else {
      console.log('✅ App: Login exitoso, ir a eventos');
      setVistaActual('eventos');
    }

    // Cargar evento destacado después de un login exitoso
    FirebaseService.obtenerEventos().then(eventos => {
      const destacado = eventos.find(ev => ev.destacado);
      if (destacado) {
        setEventoId(destacado.id);
        setNombre(destacado.nombre);
        setFechaDesde(destacado.fechaDesde);
        setFechaHasta(destacado.fechaHasta);

        // Loguear después de setear
        console.log('✅ Evento destacado cargado:', {
          id: destacado.id,
          nombre: destacado.nombre,
          fechaDesde: destacado.fechaDesde,
          fechaHasta: destacado.fechaHasta,
          rol: usuarioData.rol
        });
      } else {
        alert("No hay evento destacado configurado.");
      }
    });
  };

  const handleLogout = () => {
    console.log('🚪 App: Cerrando sesión');
    setUsuario(null);
    setVistaActual('login'); // ✅ Volver al login al cerrar sesión
    setEventoSeleccionado(null);
    setForzarCambioPassword(false);
    setShowCambiarPassword(false);
    localStorage.removeItem('usuario');
    console.log('✅ Usuario deslogueado');
  };

  const handleCambioPasswordExitoso = () => {
    console.log('✅ App: Cambio de contraseña exitoso');
    setForzarCambioPassword(false);
    setShowCambiarPassword(false);
    
    // Actualizar datos del usuario en localStorage
    const usuarioActualizado = {
      ...usuario,
      passwordCambiado: true,
      esPrimerLogin: false
    };
    setUsuario(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
    
    console.log('✅ Usuario actualizado: passwordCambiado = true');
    
    // Ir a eventos después del cambio exitoso
    setVistaActual('eventos'); // ✅ Ir a eventos después de cambiar contraseña
  };

  const handleFormularioSubmit = async (datosFormulario) => {
    try {
      console.log('📝 Enviando formulario:', datosFormulario);
      
      await FirebaseService.enviarFormulario(datosFormulario);
      
      alert('¡Formulario enviado exitosamente!');
      setVistaActual('eventos');
      setEventoSeleccionado(null);
    } catch (error) {
      console.error('❌ Error enviando formulario:', error);
      alert(`Error al enviar el formulario: ${error.message}`);
    }
  };

  const handleFormularioCancel = () => {
    setVistaActual('eventos');
    setEventoSeleccionado(null);
  };

  // Funciones de navegación entre formularios
  const navegarAFormularioSocio = (evento) => {
    if (!evento || !evento.id) {
      console.error('❌ App.jsx - Evento inválido recibido:', evento);
      alert('Error: No se pudo cargar el evento seleccionado');
      return;
    }
    setEventoSeleccionado(evento);
    setVistaActual('formulario-socio');
  };

  const navegarAFormularioProveedorConHotel = (evento) => {
    console.log('Llamando navegarAFormularioProveedorConHotel con evento:', evento);
    if (!evento || !evento.id) {
      console.error('❌ App.jsx - Evento inválido recibido:', evento);
      alert('Error: No se pudo cargar el evento seleccionado');
      return;
    }
    setEventoSeleccionado(evento);
    setVistaActual('formulario-proveedor-con-hotel');
  };

  const navegarAFormularioProveedorSinHotel = (evento) => {
    if (!evento || !evento.id) {
      console.error('❌ App.jsx - Evento inválido recibido:', evento);
      alert('Error: No se pudo cargar el evento seleccionado');
      return;
    }
    setEventoSeleccionado(evento);
    setVistaActual('formulario-proveedor-sin-hotel');
  };

  const navegarADashboard = () => {
    setVistaActual('dashboard');
    setEventoSeleccionado(null);
  };

  const navegarAEventos = () => {
    setVistaActual('eventos');
    setEventoSeleccionado(null);
  };

  // Agregar esta función para recargar el usuario desde la base de datos:
  const recargarUsuario = async (userId) => {
    try {
      console.log('🔄 App: Recargando datos del usuario desde Firebase:', userId);
      
      const usuarioActualizado = await FirebaseService.obtenerUsuarioPorId(userId);
      
      if (usuarioActualizado) {
        console.log('✅ App: Usuario recargado:', {
          id: usuarioActualizado.id,
          email: usuarioActualizado.email,
          primerLogin: usuarioActualizado.primerLogin,
          passwordCambiado: usuarioActualizado.passwordCambiado
        });
        
        setUsuario(usuarioActualizado);
        return usuarioActualizado;
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('❌ App: Error recargando usuario:', error);
      throw error;
    }
  };

  // Versión mejorada que recarga los datos desde Firebase:
  const handleCambioPassword = async (nuevaPassword) => {
    try {
      setLoading(true);
      console.log('🔐 App: Cambiando contraseña para usuario:', usuario.id);
      
      // Cambiar la contraseña en Firebase
      await FirebaseService.cambiarPassword(usuario.id, nuevaPassword, usuario.primerLogin);
      
      // ✅ Recargar el usuario desde Firebase para tener datos actualizados
      console.log('🔄 App: Recargando datos del usuario desde Firebase...');
      const usuarioActualizado = await recargarUsuario(usuario.id);
      
      console.log('✅ App: Datos recargados, verificando estado:', {
        primerLogin: usuarioActualizado.primerLogin,
        passwordCambiado: usuarioActualizado.passwordCambiado
      });
      
      // Verificar que los campos estén correctos
      if (usuarioActualizado.primerLogin === false && usuarioActualizado.passwordCambiado === true) {
        console.log('✅ App: Estado correcto, redirigiendo al dashboard');
        setMostrarCambioPassword(false);
        setVistaActual('eventos');
        alert('✅ Contraseña cambiada exitosamente');
      } else {
        console.warn('⚠️ App: Estado inconsistente después del cambio:', usuarioActualizado);
        alert('⚠️ Contraseña cambiada pero hay inconsistencias en el estado');
      }
      
    } catch (error) {
      console.error('❌ App: Error cambiando contraseña:', error);
      alert('Error cambiando contraseña: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetalleFormulario = (evento, tipo) => {
    // lógica para mostrar el detalle del formulario
  };

  // Si no hay usuario logueado, mostrar login
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  // Control de acceso por rol: solo admin puede acceder a dashboard/newsletter
// ...eliminado control de acceso centralizado...

  // Si es primer login o debe cambiar password, mostrar modal
  if (forzarCambioPassword) {
    return (
      <div className="app">
        <CambiarPasswordModal
          usuario={usuario}
          esPrimerLogin={!usuario.passwordCambiado}
          onPasswordCambiado={handleCambioPasswordExitoso}
          onCancelar={handleLogout}
        />
      </div>
    );
  }

  // Renderizar vista según el estado actual
  const renderVistaActual = () => {
    console.log('🎭 App: renderVistaActual - Estado:', {
      vistaActual,
      usuario: usuario?.email,
      forzarCambioPassword
    });

    // Si no hay usuario, mostrar login LIMPIO
    if (!usuario) {
      return <Login onLogin={handleLogin} />; // ✅ Sin datos prellenados
    }

    // Si debe cambiar contraseña, mostrar modal
    if (forzarCambioPassword) {
      console.log('🔄 App: Mostrar cambio de contraseña');
      return (
        <div className="app">
          <CambiarPasswordModal
            usuario={usuario}
            esPrimerLogin={!usuario.passwordCambiado}
            onPasswordCambiado={handleCambioPasswordExitoso}
            onCancelar={handleLogout}
          />
        </div>
      );
    }

    // Renderizar vista según el estado actual
  
    switch (vistaActual) {
      case 'login':
        return <Login onLogin={handleLogin} />;

      case 'dashboard':
      return (
        <Dashboard 
          usuario={usuario} 
          onLogout={handleLogout} 
          onNavigateToEventos={navegarAEventos}
          onNavigateToDashboard={navegarADashboard}
          onNavigateToInicio={navegarAEventos}
          eventoId={eventoId}
        />
      );

      case 'eventos':
        return (
          <div className="app">
            {/* Header con imágenes del evento */}
            <header className="app-header">
              <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="header-imgs-responsive">
                  <div className="logo-header-separador-group">
                    <span className="header-separador">
                      <img
                        src="/rediseño/RESTYLING header/separador png@150x.png"
                        alt="Separador violeta"
                        style={{ display: 'inline-block', verticalAlign: 'middle', width: '10px', maxWidth: '10px', minHeight: '32px', maxHeight: '80px', flexShrink: 0, background: 'transparent' }}
                      />
                    </span>
                    <img
                      src="/rediseño/RESTYLING header/Logo.svg"
                      alt="Encuentro 2026"
                      className="header-logo"
                    />
                  </div>
                  <img
                    src="/rediseño/RESTYLING header/FECHA.svg"
                    alt="31 de Agosto, 1 y 2 de Septiembre"
                    className="header-fecha"
                  />
                </div>
                <div className="header-actions">
                  <div className="header-actions-user-row">
                    <span className="usuario-img-wrapper">
                      <img
                        src="/rediseño/RESTYLING header/usuario.svg"
                        alt="Usuario"
                        className="usuario-img"
                        style={{ objectFit: 'contain', verticalAlign: 'middle', marginRight: '0.5rem' }}
                      />
                    </span>
                        <span className="header-actions-user-text" style={{display: 'flex', alignItems: 'center', height: '100%'}}>
                          {usuario.nombre || usuario.email}
                        </span>
                    <span className="header-separador-wrapper">
                      <img
                        src="/rediseño/RESTYLING header/separador png@150x.png"
                        alt="Separador violeta"
                        className="header-separador-img"
                        style={{ objectFit: 'contain', background: 'transparent', marginl: '0.5rem' }}
                      />
                    </span>
                  </div>
                  {usuario.rol === 'admin' && (
                    <button 
                      onClick={navegarADashboard}
                      className="btn-admin"
                      title="Ir al panel de administración"
                    >
                      Administración
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="btn-logout"
                    title="Cerrar sesión"
                  >
                    <span className="salir-img-wrapper">
                      <img
                        src="/rediseño/RESTYLING header/salir.png"
                        alt="Salir"
                        className="salir-img"
                        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </header>
            <main className="app-main">
              <EventosDestacados
                onFormularioSocio={navegarAFormularioSocio}
                onFormularioProveedorConHotel={navegarAFormularioProveedorConHotel}
                onFormularioProveedorSinHotel={navegarAFormularioProveedorSinHotel}
                onDetalleFormulario={handleDetalleFormulario}
                rolUsuario={usuario.rol}
              />
            </main>
          </div>
        );

      case 'formulario-socio':
        return (
          <FormularioSocio
            user={usuario}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );

      case 'formulario-proveedor-con-hotel':
        return (
          <FormularioProveedorConHotel
            user={usuario}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );

      case 'formulario-proveedor-sin-hotel':
        return (
          <FormularioProveedorSinHotel
            user={usuario}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );

      case 'roomingList':
        // Si el array está vacío, cargar los formularios antes de mostrar la vista
        if (formularios.length === 0) {
          FirebaseService.obtenerFormularios().then(data => {
            setFormularios(data);
          });
          return <div style={{padding:40, textAlign:'center'}}><h2>🏨 Rooming List</h2><p>Cargando formularios...</p></div>;
        }
        return <RoomingList formularios={formularios} />;
      case 'referentes':
          return <ListadoReferentes 
          readOnly={true} 
          eventId={eventoId}/>;
      case 'listadoAcreditacion':  
        return <ListadoAcreditacion eventId={eventoId} />;

      case 'newsletter':
        return <Newsletter />;
      default:
        console.log('⚠️ App: Vista no reconocida, ir a eventos');
        return (
          <div className="app">
            <EventosDestacados
              onFormularioSocio={navegarAFormularioSocio}
              onFormularioProveedorConHotel={navegarAFormularioProveedorConHotel}
              onFormularioProveedorSinHotel={navegarAFormularioProveedorSinHotel}
            />
          </div>
        );
    }
  };

  console.log('🟢 vistaActual:', vistaActual);
  return renderVistaActual()
  /*   (
    <>
      <AdminNavBar
        currentView={vistaActual}
        onViewChange={setVistaActual}
        user={usuario}
        onLogout={handleLogout}
      />
      {renderVistaActual()}
    </>
  ); */
}

export default function WrappedApp() {
  return (
    <EventoDestacadoProvider>
      <App />
    </EventoDestacadoProvider>
  );
}
