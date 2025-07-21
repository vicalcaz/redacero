import { useEffect, useState } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './EventosDestacados.css';
import SubirImagen from '../components/SubirImagen';

function EventosDestacados({
  onFormularioSocio,
  onFormularioProveedorConHotel,
  onFormularioProveedorSinHotel,
  onDetalleFormulario
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
        console.log('🔄 EventosDestacados: Cargando eventos...');
        
        const todos = await FirebaseService.obtenerEventos();
        // Filtrar solo los destacados
        const eventosDestacados = todos.filter(ev => ev.destacado);
        
        console.log('📅 EventosDestacados: Eventos obtenidos:', eventosDestacados);
        
        // Mostrar el estado de cada evento para debugging
        eventosDestacados.forEach(evento => {

          const esDestacado = evento.destacado === true;
          const esPlanificado = evento.estado === 'planificado';
          const esActivo = evento.estado === 'activo' || evento.activo === true;
          const pasaFiltro = esDestacado && (esPlanificado || esActivo);
          
          console.log(`📊 Evento "${evento.nombre}":`, {
            destacado: evento.destacado,
            estado: evento.estado,
            activo: evento.activo,
            esDestacado,
            esPlanificado,
            esActivo,
            pasaFiltro
          });
        });
        
        console.log('✅ EventosDestacados: Eventos que pasaron el filtro:', eventosDestacados);
        console.log('📊 EventosDestacados: Total filtrados:', eventosDestacados.length);
        
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
        <div className="page-header">
          <h1>🌟 Eventos Destacados</h1>
          <p>Completa el formulario correspondiente a tu perfil</p>

          {/* INFO DE FILTRO ACTUALIZADA */}
          <div style={{
             background: '#f0f8ff',
             border: '1px solid #ddeeff',
             borderRadius: '8px',
             padding: '1rem',
             margin: '1rem 0',  
             fontSize: '0.9rem'
           }}> 
            
           </div>
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
    <div className="eventos-destacados">
      <div className="page-header">
        <h1>🌟 Eventos Destacados</h1>
        <p>Completa el formulario correspondiente a tu perfil</p>
        {/* Botón Panel Adm. eliminado por solicitud */}
      </div>

      <div className="eventos-grid">
        {eventos.map(evento => {
          return (
            <div key={evento.id} className="evento-card">
              {/* MOSTRAR IMAGEN SI EXISTE */}
              {evento.imagenBase64 && (
                <div className={`evento-imagen${evento.destacado ? ' destacado-flash' : ''}`}>
                  <img 
                    src={evento.imagenBase64} 
                    alt={evento.nombre}
                    className="evento-img"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px 12px 0 0'
                    }}
                  />
                  {evento.destacado && (
                    <div className="flash-overlay">
                      <span>⭐ Evento Destacado</span>
                    </div>
                  )}
                </div>
              )}
              <div className="evento-content" style={{ padding: '1.5rem' }}>
                <div className="evento-header">
                  <h3>{evento.nombre}</h3>
                  <span className="evento-tipo">{evento.tipo}</span>
                </div>
                <div className="evento-info">
                  <div className="info-item">
                    <span className="icon">📍</span>
                    <span>{evento.ubicacion}</span>
                  </div>
                  <div className="info-item fecha-brillante">
                    <span className="icon">📅</span>
                    <span>
                      {evento.fechaDesde?.split('-').reverse().join('/')} - 
                      {evento.fechaHasta?.split('-').reverse().join('/')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botones de acceso a los tres formularios debajo del evento destacado */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        margin: '2.5rem 0 2rem 0',
        flexWrap: 'wrap'
      }}>
        <button
          className="form-btn socio"
          style={{
            background: 'var(--color-azul-oscuro)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '1.2rem 2.5rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(69, 55, 150, 0.15)'
          }}
          onClick={() => {
            if (eventos.length > 0) handleFormularioSocio(eventos[0]);
          }}
        >
          🧑‍💼 Formulario Socio
        </button>
        <button
          className="form-btn proveedor-hotel"
          style={{
            background: 'var(--color-azul-medio)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '1.2rem 2.5rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(87, 84, 164, 0.15)'
          }}
          onClick={() => {
            if (eventos.length > 0) handleFormularioProveedorConHotel(eventos[0]);
          }}
        >
          🏨 Formulario Proveedor con Hotel
        </button>
        <button
          className="form-btn proveedor-sin-hotel"
          style={{
            background: 'var(--color-azul-claro)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '1.2rem 2.5rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(107, 102, 174, 0.15)'
          }}
          onClick={() => {
            if (eventos.length > 0) handleFormularioProveedorSinHotel(eventos[0]);
          }}
        >
          🏢 Formulario Proveedor sin Hotel
        </button>
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