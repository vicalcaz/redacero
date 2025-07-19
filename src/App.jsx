import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventosDestacados from './components/EventosDestacados';
import FormularioSocio from './components/formularios/FormularioSocio';
import FormularioProveedorConHotel from './components/formularios/FormularioProveedorConHotel';
import FormularioProveedorSinHotel from './components/formularios/FormularioProveedorSinHotel';
import CambiarPasswordModal from './components/CambiarPasswordModal';
import { FirebaseService } from './services/FirebaseService';
import './App.css';

// Agregar esta línea para exposición global:
window.FirebaseService = FirebaseService;

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('eventos');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [forzarCambioPassword, setForzarCambioPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    // ✅ SOLO usar passwordCambiado (que SÍ existe en la tabla)
    if (usuarioData.passwordCambiado === false || usuarioData.passwordCambiado === undefined) {
      console.log('🔄 App: Password no cambiado, solicitar cambio de contraseña');
      setForzarCambioPassword(true);
      setVistaActual('cambio-password');
    } else {
      console.log('✅ App: Login exitoso, ir a eventos');
      setVistaActual('eventos');
    }
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
    console.log('🎯 App.jsx - navegarAFormularioSocio ejecutado');
    console.log('📋 App.jsx - Evento recibido:', evento);
    console.log('🔍 App.jsx - Propiedades del evento:', Object.keys(evento || {}));
    
    if (!evento || !evento.id) {
      console.error('❌ App.jsx - Evento inválido:', evento);
      alert('Error: No se pudo cargar el evento seleccionado');
      return;
    }

    console.log('✅ App.jsx - Evento válido, guardando...');
    setEventoSeleccionado(evento);
    setVistaActual('formulario-socio');
    console.log('🎭 App.jsx - Vista cambiada a formulario-socio');
  };

  const navegarAFormularioProveedorConHotel = (evento) => {
    console.log('🔍 App.jsx - navegarAFormularioProveedorConHotel llamado');
    console.log('📋 App.jsx - Evento recibido:', evento);
    
    if (!evento || !evento.id) {
      console.error('❌ App.jsx - Evento inválido recibido:', evento);
      alert('Error: No se pudo cargar el evento seleccionado');
      return;
    }

    setEventoSeleccionado(evento);
    setVistaActual('formulario-proveedor-con-hotel');
  };

  const navegarAFormularioProveedorSinHotel = (evento) => {
    console.log('🔍 App.jsx - navegarAFormularioProveedorSinHotel llamado');
    console.log('📋 App.jsx - Evento recibido:', evento);
    
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
        setVistaActual('dashboard');
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

  // Si no hay usuario logueado, mostrar login
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

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
          />
        );

      case 'eventos':
        return (
          <div className="app">
            {/* Header con información del usuario */}
            <header className="app-header">
              <div className="header-content">
                <h1>🏠 RedAcero Eventos</h1>
                <div className="header-actions">
                  <span>👤 {usuario.nombre || usuario.email}</span>
                  <button 
                    onClick={navegarADashboard}
                    className="btn-admin"
                    title="Ir al panel de administración"
                  >
                    🔧 Administración
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="btn-logout"
                    title="Cerrar sesión"
                  >
                    🚪 Salir
                  </button>
                </div>
              </div>
            </header>
            
            <main className="app-main">
              <EventosDestacados
                onFormularioSocio={navegarAFormularioSocio}
                onFormularioProveedorConHotel={navegarAFormularioProveedorConHotel}
                onFormularioProveedorSinHotel={navegarAFormularioProveedorSinHotel}
              />
            </main>
          </div>
        );

      case 'formulario-socio':
        return (
          <FormularioSocio
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );

      case 'formulario-proveedor-con-hotel':
        return (
          <FormularioProveedorConHotel
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );

      case 'formulario-proveedor-sin-hotel':
        return (
          <FormularioProveedorSinHotel
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );

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

  return renderVistaActual();
}

export default App;
