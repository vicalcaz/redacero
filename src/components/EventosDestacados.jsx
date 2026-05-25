import { useEffect, useState } from 'react';

// Obtener la fecha límite de carga desde variables de entorno (.env)
const FECHA_LIMITE_CARGA_DEFAULT = import.meta.env.VITE_FECHA_LIMITE_CARGA || '';
import { FirebaseService } from '../services/FirebaseService';
import './EventosDestacados.css';
import SubirImagen from '../components/SubirImagen';

function EventosDestacados({
  onFormularioSocio,
  onFormularioProveedorConHotel,
  onFormularioProveedorSinHotel,
  onDetalleFormulario,
  rolUsuario
}) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mailConfig, setMailConfig] = useState({
    destinatario: '',
    asunto: '',
    cuerpo: ''
  });

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const todos = await FirebaseService.obtenerEventos();
        const eventosDestacados = todos.filter(ev => ev.destacado);
        setEventos(eventosDestacados);
      } catch (error) {
        console.error('❌ EventosDestacados: Error cargando eventos:', error);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  const handleFormularioSocio = (evento) => {
    console.log('🔍 EventosDestacados: Botón formulario socio clickeado');
    console.log('📋 EventosDestacados: Evento seleccionado:', evento);
    
    if (!evento || !evento.id) {
      console.error('❌ EventosDestacados: Evento inválido:', evento);
      alert('Error: Evento inválido seleccionado');
      return;
    }
    
    console.log('✅ EventosDestacados: Llamando onFormularioSocio con evento:', evento);
    onFormularioSocio(evento);
  };

  const handleFormularioProveedorConHotel = (evento) => {
    console.log('🔍 EventosDestacados: Botón proveedor con hotel clickeado');
    console.log('📋 EventosDestacados: Evento seleccionado:', evento);
    
    if (!evento || !evento.id) {
      console.error('❌ EventosDestacados: Evento inválido:', evento);
      alert('Error: Evento inválido seleccionado');
      return;
    }
    
    console.log('✅ EventosDestacados: Llamando onFormularioProveedorConHotel con evento:', evento);
    onFormularioProveedorConHotel(evento);
  };

  const handleFormularioProveedorSinHotel = (evento) => {
    console.log('🔍 EventosDestacados: Botón proveedor sin hotel clickeado');
    console.log('📋 EventosDestacados: Evento seleccionado:', evento);
    
    if (!evento || !evento.id) {
      console.error('❌ EventosDestacados: Evento inválido:', evento);
      return;
    }
    console.log('✅ EventosDestacados: Llamando onFormularioProveedorSinHotel con evento:', evento);
    onFormularioProveedorSinHotel(evento);
  };

  const guardarMailConfig = async () => {
    try {
      setGuardando(true);
      await FirebaseService.guardarConfiguracionMailEvento(mailConfig);
      alert('✅ Configuración de mail guardada exitosamente');
    } catch (error) {
      alert('❌ Error al guardar la configuración de mail: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleDetalleFormulario = (evento, tipo) => {
    // lógica para mostrar el detalle del formulario
  };

  if (loading) {
    return (
      <div className="eventos-destacados">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <h2>Cargando eventos destacados...</h2>
        </div>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="eventos-destacados">
        <div className="page-header" style={{ marginBottom: '2.5rem', padding: '1.5rem 0 1.2rem 0', minHeight: '120px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', width: '100%' }}>
            <img
              src="/rediseño/HERO/ESTRELLA.svg"
              alt="Estrella"
              style={{ height: '2.2rem', width: '2.2rem', objectFit: 'contain', verticalAlign: 'middle', marginLeft: '1cm' }}
            />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              minWidth: 180,
              maxWidth: 600,
              marginLeft: '0.2rem',
              flex: 1
            }}>
              <span style={{
                fontFamily: 'Manrope, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: '#5b4e96',
                lineHeight: 1,
                marginBottom: 2,
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                width: 'auto',
                paddingLeft: '1.2rem',
                textAlign: 'left',
                display: 'block',
                alignSelf: 'flex-start'
              }}>Evento destacado</span>
              <span style={{
                fontFamily: 'Manrope, Arial, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: '#282828',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                width: '100%'
              }}>
                Completa los formularios para asegurar tu participación en el evento más importante del sector.
              </span>
            </div>
            {/* Botones de acceso a los tres formularios debajo del evento destacado */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginRight: '1cm', flexWrap: 'wrap', minWidth: 0 }}>
              {rolUsuario === 'socio' && (
                <button
                  // className="form-btn socio"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '1.5rem'
                  }}
                  onClick={() => {
                    if (eventos.length > 0) handleFormularioSocio(eventos[0]);
                  }}
                >
                  <svg
                    viewBox="0 0 300 62"
                    style={{ height: '3.2rem', width: '300px', minWidth: '300px', maxWidth: '300px', display: 'block', flexShrink: 0 }}
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Completar formulario"
                    role="img"
                  >
                    <rect x="0" y="0" width="300" height="62" rx="16" fill="#5b4e96" />
                    <text x="28" y="37" fontFamily="Manrope, Arial, sans-serif" fontWeight="700" fontSize="20" fill="#fff">Completar formulario</text>
                    <g>
                      <circle cx="260" cy="31" r="15" fill="#5b4e96" />
                      <path d="M255 31h10m-4-4 4 4-4 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </g>
                  </svg>
                </button>
              )}

              {rolUsuario === 'proveedor-con-hotel' && (
                <button
                  className="form-btn proveedor-hotel"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '1.5rem'
                  }}
                  onClick={() => {
                    if (eventos.length > 0) handleFormularioProveedorConHotel(eventos[0]);
                  }}
                >
                  <img
                    src="/rediseño/HERO/CTA.svg"
                    alt="Formulario Proveedor con Hotel"
                    style={{ height: '3.2rem', width: 'auto', display: 'block' }}
                  />
                </button>
              )}

              {rolUsuario === 'proveedor-sin-hotel' && (
                <button
                  className="form-btn proveedor-sin-hotel"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '1.5rem'
                  }}
                  onClick={() => {
                    if (eventos.length > 0) handleFormularioProveedorSinHotel(eventos[0]);
                  }}
                >
                  {/* Aquí puedes agregar la imagen o texto para el botón si lo deseas */}
                </button>
              )}
            </div>
          </h1>
          {/* Botón Panel Adm. eliminado por solicitud */}
        </div>

        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h2>No hay eventos destacados disponibles</h2>
          <p>Los eventos deben tener <code>destacado: true</code> y estado <code>"planificado"</code> o <code>"activo"</code></p>
          
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            margin: '2rem auto',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            
          </div>

          {/* BOTÓN PARA ACTIVAR EL EVENTO EXISTENTE CON ESTADO PLANIFICADO */}
          <button 
            onClick={async () => {
              try {
                console.log('🔄 Activando evento existente...');
                
                await FirebaseService.actualizarEvento('Dp0HcMdT4yTb73x5ULiT', {
                  destacado: true,
                  estado: 'planificado', // Cambiar a planificado para que aparezca
                  activo: true, // Por si acaso también tener activo en true
                  fechaActualizacion: new Date().toISOString(),
                  fechaActualizacionString: new Date().toLocaleString('es-AR')
                });
                
                console.log('✅ Evento actualizado a estado planificado');
                alert('✅ ¡Evento actualizado! Ahora debería aparecer en la lista.');
                cargarEventos();
              } catch (error) {
                console.error('❌ Error actualizando evento:', error);
                alert('❌ Error: ' + error.message);
              }
            }}
            style={{
              margin: '1rem',
              padding: '1rem 2rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            ✅ ACTIVAR EVENTO "Encuentro Red Acero 2025"
          </button>

          {/* BOTÓN PARA CREAR EVENTO NUEVO CON ESTADO PLANIFICADO */}
          {mostrarModalCrear && (
            <div className="modal-overlay">
              <div className="modal-crear-evento">
                <h3>📅 Crear Nuevo Evento</h3>
                
                {/* COMPONENTE PARA SUBIR IMAGEN */}
                <SubirImagen 
                  onImagenSeleccionada={(imagenBase64) => {
                    console.log('📷 Imagen seleccionada para el evento');
                    setImagenSeleccionada(imagenBase64);
                  }}
                />
                
                {/* FORMULARIO BÁSICO */}
                <div className="form-group">
                  <label>Nombre del Evento *</label>
                  <input
                    type="text"
                    id="nombreEvento"
                    placeholder="Ej: Encuentro Red Acero 2025"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    id="descripcionEvento"
                    placeholder="Descripción del evento..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    id="ubicacionEvento"
                    placeholder="Ej: Hotel Hilton, Puerto Madero, Buenos Aires"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  />
                </div>

            
                
                <div className="modal-actions">
                  <button 
                    onClick={() => {
                      setMostrarModalCrear(false);
                      setImagenSeleccionada(null);
                    }}
                    className="btn-cancelar"
                    style={{
                      padding: '0.8rem 1.5rem',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginRight: '1rem'
                    }}
                  >
                    ❌ Cancelar
                  </button>
                  
                  <button 
                    onClick={async () => {
                      try {
                        const nombre = document.getElementById('nombreEvento').value;
                        const descripcion = document.getElementById('descripcionEvento').value;
                        const ubicacion = document.getElementById('ubicacionEvento').value;
                        const estado = document.getElementById('estadoEvento').value; // <-- nuevo
                        
                        if (!nombre.trim()) {
                          alert('❌ El nombre del evento es obligatorio');
                          return;
                        }
                        
                        console.log('➕ Creando nuevo evento con imagen...');
                        
                        const nuevoEvento = {
                          nombre: nombre.trim(),
                          descripcion: descripcion.trim() || 'Evento de Red Acero',
                          ubicacion: ubicacion.trim() || 'Por definir',
                          fechaInicio: new Date().toISOString(),
                          fechaFin: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
                          capacidad: 200,
                          tipo: 'Encuentro Empresarial',
                          destacado: true,
                          estado, // <-- guardar el estado seleccionado
                          activo: estado === 'activo',
                          imagenBase64: imagenSeleccionada || null
                        };
                        
                        const id = await FirebaseService.crearEvento(nuevoEvento);
                        console.log('✅ Nuevo evento creado con ID:', id);
                        alert('✅ ¡Evento creado exitosamente con imagen!');
                        
                        // Limpiar y cerrar modal
                        setMostrarModalCrear(false);
                        setImagenSeleccionada(null);
                        cargarEventos();
                        
                      } catch (error) {
                        console.error('❌ Error creando evento:', error);
                        alert('❌ Error: ' + error.message);
                      }
                    }}
                    className="btn-crear"
                    style={{
                      padding: '0.8rem 1.5rem',
                      background: imagenSeleccionada ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: imagenSeleccionada ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!imagenSeleccionada}
                  >
                    ✅ Crear Evento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botón para abrir el modal */}
          <button 
            onClick={() => setMostrarModalCrear(true)}
            style={{
              margin: '1rem',
              padding: '1rem 2rem',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ➕ CREAR EVENTO CON IMAGEN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eventos-destacados" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px #e0e0e0', padding: '2rem 1.5rem' }}>
      <div className="page-header" style={{ marginBottom: '2.5rem', padding: '1.5rem 0 1.2rem 0', minHeight: '120px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', width: '100%' }}>
          <img
            src="/rediseño/HERO/ESTRELLA.svg"
            alt="Estrella"
            style={{ height: '2.2rem', width: '2.2rem', objectFit: 'contain', verticalAlign: 'middle', marginLeft: '1cm' }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            minWidth: 180,
            maxWidth: 600,
            marginLeft: '0.2rem',
            flex: 1
          }}>
            <span style={{
              fontFamily: 'Manrope, Arial, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              color: '#5b4e96',
              lineHeight: 1,
              marginBottom: 2,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              width: 'auto',
              paddingLeft: '1.2rem',
              textAlign: 'left',
              display: 'block',
              alignSelf: 'flex-start'
            }}>Evento destacado</span>
            <span style={{
              fontFamily: 'Manrope, Arial, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              color: '#282828',
              lineHeight: 1.1,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              width: '100%'
            }}>
              Completa los formularios para asegurar tu participación en el evento más importante del sector.
            </span>
          </div>
        </h1>
        <div style={{width: '100%'}}>
          <div className="formulario-botones">
            {rolUsuario === 'socio' && (
              <button
                // className="form-btn socio"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  if (eventos.length > 0) handleFormularioSocio(eventos[0]);
                }}
              >
                <svg
                  viewBox="0 0 300 62"
                  style={{ height: '3.2rem', width: '100%', maxWidth: '300px', minWidth: 0, display: 'block', flexShrink: 0 }}
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Completar formulario"
                  role="img"
                >
                  <rect x="0" y="0" width="300" height="62" rx="16" fill="#5b4e96" />
                  <text x="28" y="37" fontFamily="Manrope, Arial, sans-serif" fontWeight="700" fontSize="20" fill="#fff">Completar formulario</text>
                  <g>
                    <circle cx="260" cy="31" r="15" fill="#5b4e96" />
                    <path d="M255 31h10m-4-4 4 4-4 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </g>
                </svg>
              </button>
            )}

            {rolUsuario === 'proveedor-con-hotel' && (
              <button
                className="form-btn proveedor-hotel"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  if (eventos.length > 0) handleFormularioProveedorConHotel(eventos[0]);
                }}
              >
                <img
                  src="/rediseño/HERO/CTA.svg"
                  alt="Formulario Proveedor con Hotel"
                  style={{ height: '3.2rem', width: 'auto', display: 'block' }}
                />
              </button>
            )}

            {rolUsuario === 'proveedor-sin-hotel' && (
              <button
                className="form-btn proveedor-sin-hotel"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  if (eventos.length > 0) handleFormularioProveedorSinHotel(eventos[0]);
                }}
              >
                {/* Aquí puedes agregar la imagen o texto para el botón si lo deseas */}
              <svg
                  viewBox="0 0 300 62"
                  style={{ height: '3.2rem', width: '100%', maxWidth: '300px', minWidth: 0, display: 'block', flexShrink: 0 }}
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Completar formulario"
                  role="img"
                >
                  <rect x="0" y="0" width="300" height="62" rx="16" fill="#5b4e96" />
                  <text x="28" y="37" fontFamily="Manrope, Arial, sans-serif" fontWeight="700" fontSize="20" fill="#fff">Completar formulario</text>
                  <g>
                    <circle cx="260" cy="31" r="15" fill="#5b4e96" />
                    <path d="M255 31h10m-4-4 4 4-4 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </g>
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Botón Panel Adm. eliminado por solicitud */}
      </div>

      <div className="eventos-grid">
        {eventos.map(evento => {
          return (
            <div key={evento.id} className="evento-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', maxHeight: "none", minHeight: 380, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* MOSTRAR IMAGEN SI EXISTE */}
              {evento.imagenBase64 && (
                <div
                  className="evento-imagen"
                  style={{
                    position: 'relative',
                    background: undefined,
                    overflow: 'hidden',
                    height: '320px',
                    minHeight: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={evento.imagenBase64}
                    alt={evento.nombre}
                    className="evento-img"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '220px',
                      objectFit: 'contain',
                      borderRadius: '12px 12px 0 0',
                      display: 'block',
                      margin: '0 auto',
                      position: 'relative',
                      zIndex: 2,
                      background: 'transparent',
                    }}
                  />
                </div>
              )}
              <div className="evento-content" style={{ background: '#fff', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '0 0 12px 12px' }}>
                <div className="evento-header">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 4, color: '#b0b6c3', fontFamily: 'Manrope, Arial, sans-serif', fontWeight: 700 }}>{evento.nombre}</h3>
                  <span className="evento-tipo" style={{ fontSize: '0.95rem' }}>{evento.tipo}</span>
                </div>
                {/* Mostrar descripción del evento */}
                {/* Fecha límite de carga como alarma visual SIEMPRE visible */}
                <div  style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f5e8dd',
                  color: '#e27824',
                  fontFamily: 'Manrope, Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.18rem',
                  borderRadius: '12px',
                  padding: '0.7rem 2.2rem 0.7rem 1.2rem',
                  margin: '0.7rem 1cm 0.5rem 1cm',
                  letterSpacing: '0.01em',
                  minHeight: '48px',
                  width: 'calc(100% - 2cm)',
                  maxWidth: '100%',
                  borderBottom: '4px solid #e27824'
                }}>
                  <span className="alarma-ico" role="img" aria-label="alarma" style={{display:'inline-flex',verticalAlign:'middle',alignItems:'center'}}>
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="10" width="36" height="30" rx="4" fill="#f0ece9" stroke="#e27824" strokeWidth="2"/>
                      <rect x="6" y="10" width="36" height="8" rx="2" fill="#e27824"/>
                      <rect x="14" y="6" width="4" height="8" rx="2" fill="#e27824"/>
                      <rect x="30" y="6" width="4" height="8" rx="2" fill="#e27824"/>
                      <rect x="14" y="22" width="4" height="4" rx="2" fill="#e27824"/>
                      <rect x="22" y="22" width="4" height="4" rx="2" fill="#e27824"/>
                      <rect x="30" y="22" width="4" height="4" rx="2" fill="#e27824"/>
                      {/* Relojito todo naranja, agujas blancas */}
                      <g>
                        <circle cx="36" cy="35" r="9" fill="#e27824" stroke="#e27824" strokeWidth="2.2"/>
                        <circle cx="36" cy="35" r="6.5" fill="none" stroke="#e27824" strokeWidth="2"/>
                        {/* Aguja horaria */}
                        <rect x="35.2" y="27.5" width="1.5" height="7" rx="0.75" fill="#fff"/>
                        {/* Aguja minutera */}
                        <rect x="36" y="35" width="4.5" height="1.5" rx="0.75" fill="#fff" transform="rotate(45 36 35)"/>
                        <circle cx="36" cy="35" r="1.5" fill="#fff"/>
                      </g>
                    </svg>
                  </span>
                  <span style={{marginLeft: 8, color: '#e27824', fontFamily: 'Manrope, Arial, sans-serif', fontWeight: 700, fontSize: '1.18rem', whiteSpace: 'pre-line'}}>
                    Fecha límite de carga:
                    <span style={{
                      color: '#e27824',
                      fontFamily: 'Manrope, Arial, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.18rem',
                      marginLeft: 8
                    }}>
                      {(() => {
                        const raw = evento.fechaLimiteEdicion || FECHA_LIMITE_CARGA_DEFAULT;
                        if (!raw) return ' No definida';
                        let d = raw;
                        if (typeof d === 'string' && d.includes('T')) d = d.split('T')[0];
                        const [y, m, day] = d.split('-');
                        if (y && m && day) return ` ${day.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
                        return ` ${raw}`;
                      })()}
                    </span>
                  </span>
                </div>
                {evento.descripcion && (
                  <div className="descripcion descripcion-evento" style={{ margin: '0.5rem 3rem 0.7rem 3rem' }}>
                    {evento.descripcion}
                  </div>
                )}
                <div className="evento-info" style={{ marginTop: '1cm' }}>
                  <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <img
                      src="/rediseño/CUERPO/ubicacion.svg"
                      alt="Ubicación"
                      style={{ height: '3rem', width: '3rem', objectFit: 'contain', verticalAlign: 'middle' }}
                    />
                    <span style={{
                      fontSize: '1.08rem',
                      color: '#2B2B2B',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      textShadow: '0 1px 0 #fff, 0 2px 4px #e0e0e0',
                      fontFamily: 'Manrope, Arial, sans-serif',
                      lineHeight: 1.2
                    }}>
                      
                      {evento.ubicacion && evento.ubicacion.split(',').map((linea, idx) => (
                        <span
                        
                          key={idx}
                          style={
                            idx === 0
                              ? {
                                  display: 'block',
                                  fontSize: '1.35rem',
                                  fontWeight: 700,
                                  color: '#5b4e96',
                                  marginBottom: '0.1em',
                                }
                              : {
                                  display: 'flex',
                                  marginLeft: '0.5cm',
                                  alignItems: 'center',
                                  fontSize: '0.92rem',
                                  fontWeight: 400,
                                  color: '#a0a0a0',
                                  marginBottom: idx === evento.ubicacion.split(',').length - 1 ? 0 : '0.03em',
                                }
                          }
                        >
                         
                          {idx === 1 && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 10" width="18" height="18" style={{marginRight: 6, minWidth: 18, marginLeft: '-0.7cm'}}>
                              <path fill="#282828" d="M11.44,2.81h-1.44v-1.6c0-1-.81-1.81-1.81-1.81h-3.13c-1,0-1.8.81-1.8,1.81v1.6h-1.45c-1,0-1.81.81-1.81,1.81v6.44h13.25v-6.44c0-1-.81-1.81-1.81-1.81ZM3.25,10.09H.97v-5.47c0-.46.37-.83.83-.83h1.45v6.3ZM7.92,10.09v-1.85h-2.58v1.85h-1.11v-8.87c0-.46.37-.83.83-.83h3.13c.46,0,.83.37.83.83v1.6h0v7.27h-1.1ZM12.27,10.09h-2.27v-6.3h1.44c.46,0,.83.37.83.83v5.47Z"/>
                              <rect fill="#282828" x="5.49" y="7.02" width="2.27" height=".92"/>
                              <rect fill="#282828" x="5.49" y="4.84" width="2.27" height=".92"/>
                              <rect fill="#282828" x="5.49" y="2.66" width="2.27" height=".92"/>
                            </svg>
                          )}
                          
                          {linea.trim()}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div >
                    <span className="icon"></span>
                    <span style={{ color: '#b0b6c3', fontFamily: 'Manrope, Arial, sans-serif', fontWeight: 600 }}>
                      {evento.fechaDesde?.split('-').reverse().join('/')} - {evento.fechaHasta?.split('-').reverse().join('/')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

     
    </div>
  );
// Wrapper para obtener datos de usuario desde localStorage y pasar a FormulariosGuardados
function FormularioGuardadosWrapper() {
  let userPerfil = 'usuario';
  let userEmail = '';
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
      userPerfil = usuario.perfil || usuario.rol || 'usuario';
      userEmail = usuario.email || '';
    }
  } catch {}
  return <FormulariosGuardados userPerfil={userPerfil} userEmail={userEmail} />;
}
}

export default EventosDestacados;