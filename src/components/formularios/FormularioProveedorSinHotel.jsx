import { useEffect, useState } from 'react';
import { FirebaseService } from '../../services/FirebaseService';
import './FormularioBase.css';
import SelectorEvento from '../SelectorEvento';
import { useEventoDestacado } from "../../context/EventoDestacadoContext";

function FormularioProveedorSinHotel({ user }) {
  const { rolUsuario, eventoId } = useEventoDestacado();

  console.log('🔎 Rol de usuario desde contexto:', rolUsuario, 'Evento destacado:', eventoId);

  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  
  const [datosEmpresa, setDatosEmpresa] = useState({
    direccion: '',
    ciudad: '',
    paginaWeb: '',
    codigoPostal: '',
    rubro: ''
  });

  const [personas, setPersonas] = useState([{
    id: 1,
    nombre: '',
    apellido: '',
    empresa: '',
    cargo: '',
    celular: '',
    telefono: '',
    email: '',
    dni: '',
    lunes: false,
    martes: false,
    miercoles: false,
    asisteCena: false,
    menuEspecial: '',
    atendeReuniones: false
  }]);

  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [config, setConfig] = useState(null);
  const [eventos, setEventos] = useState([]);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setCargandoEventos(true);
        let eventosData = await FirebaseService.obtenerEventosActivos();
        if (rolUsuario !== 'admin') {
          eventosData = eventosData.filter(ev => ev.id === eventoId);
        }
        setEventos(eventosData);
        console.log('rolUsuario:', rolUsuario, 'Evento ID:', eventoId, 'Eventos cargados:', eventosData);
        // Seleccionar automáticamente el evento si no es admin y hay uno solo
        if (rolUsuario !== 'admin' && eventosData.length === 1) {
          setEventoSeleccionado(eventosData[0]);
          console.log
        }
      } catch (error) {
        console.error('Error cargando eventos:', error);
        alert('Error al cargar los eventos disponibles');
      } finally {
        setCargandoEventos(false);
      }
    };

    cargarEventos();
  }, [rolUsuario, eventoId]);

  useEffect(() => {
    const cargarConfig = async () => {
      const conf = await FirebaseService.obtenerConfiguracionFormularios();
      setConfig(conf);
    };
    cargarConfig();
  }, []);

  const agregarPersona = () => {
    const nuevaPersona = {
      id: personas.length + 1,
      nombre: '',
      apellido: '',
      empresa: '',
      cargo: '',
      celular: '',
      telefono: '',
      email: '',
      dni: '',
      lunes: false,
      martes: false,
      miercoles: false,
      asisteCena: false,
      menuEspecial: '',
      atendeReuniones: false
    };
    setPersonas([...personas, nuevaPersona]);
  };

  const eliminarPersona = (id) => {
    if (personas.length > 1) {
      setPersonas(personas.filter(persona => persona.id !== id));
    }
  };

  const actualizarPersona = (id, campo, valor) => {
    setPersonas(personas.map(persona =>
      persona.id === id ? { ...persona, [campo]: valor } : persona
    ));
  };

  const actualizarDatosEmpresa = (campo, valor) => {
    setDatosEmpresa({ ...datosEmpresa, [campo]: valor });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventoSeleccionado) {
      alert('Debe seleccionar un evento');
      return;
    }
    setGuardando(true);

    try {
      const formularioData = {
        tipo: 'Proveedor sin hotel',
        eventoId: eventoSeleccionado,
        datosEmpresa,
        personas,
        comentarios,
        fechaEnvio: new Date().toISOString(),
        usuarioCreador: user?.email || 'Anónimo'
      };

      console.log('Enviando formulario Proveedor sin Hotel:', formularioData);
      
      const id = await FirebaseService.guardarFormularioProveedorSinHotel(formularioData);
      
      alert('✅ Formulario de Proveedor sin Hotel guardado exitosamente!');
      console.log('Formulario guardado con ID:', id);
      
      // Limpiar formulario después de guardar
      setEventoSeleccionado('');
      setDatosEmpresa({
        direccion: '',
        ciudad: '',
        paginaWeb: '',
        codigoPostal: '',
        rubro: ''
      });
      setPersonas([{
        id: 1,
        nombre: '',
        apellido: '',
        empresa: '',
        cargo: '',
        celular: '',
        telefono: '',
        email: '',
        dni: '',
        lunes: false,
        martes: false,
        miercoles: false,
        asisteCena: false,
        menuEspecial: '',
        atendeReuniones: false
      }]);
      setComentarios('');
      
    } catch (error) {
      console.error('Error guardando formulario:', error);
      alert(`❌ Error al guardar el formulario: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // Si el usuario no es admin, deshabilita el selector y selecciona el evento automáticamente
  const selectorDisabled = rolUsuario !== 'admin';

  return (
    <div className="formulario-container">
      <div className="formulario-header" style={{ padding: 0, flexDirection: 'column', minHeight: 'unset' }}>
        {/* Imagen de fondo como banner */}
        {config?.mostrarImagenFondo && config?.imagenFondo && (
          <div
            className="formulario-header-fondo"
            style={{
              width: '100%',
              height: 180,
              backgroundImage: `url(${config.imagenFondo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '12px 12px 0 0'
            }}
          />
        )}
        {/* Logo y títulos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          background: config?.colorSecundario || 'var(--color-azul-oscuro)',
          borderRadius: config?.mostrarImagenFondo && config?.imagenFondo ? '0 0 12px 12px' : '12px 12px 0 0',
          padding: '1.5rem 2rem'
        }}>
          {config?.mostrarLogo && config?.logoEmpresa && (
            <img
              src={config.logoEmpresa}
              alt="Logo empresa"
              className="formulario-logo"
            />
          )}
          <div style={{ marginLeft: 24 }}>
            <h2>{config?.textoEncabezado || 'Formulario Proveedor Sin Hotel'}</h2>
            <p>{config?.textoDescripcion || ''}</p>
          </div>
        </div>
      </div>

      <div className="nota-importante superior">
        <div className="nota-icon">🏢</div>
        <div className="nota-content">
          <h3>Información para Proveedores sin Hotel</h3>
          <ul>
            <li><strong>Seleccione primero el evento al que desea asistir</strong></li>
            <li><strong>Complete todos los campos obligatorios (*)</strong></li>
            <li>Proporcione información completa de su empresa</li>
            <li>Indique los días y actividades de asistencia</li>
            <li>No se requiere información de alojamiento</li>
          </ul>
        </div>
      </div>
      
      <form className="formulario-form" onSubmit={handleSubmit}>
        <div className="seccion-formulario">
          <h3>📅 Selección de Evento</h3>
          <SelectorEvento
            eventoSeleccionado={eventoSeleccionado}
            onEventoSeleccionado={setEventoSeleccionado}
            eventos={eventos}
            disabled={selectorDisabled}
          />
          {eventoSeleccionado && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid #4caf50',
              borderRadius: '8px',
              color: '#2e7d32'
            }}>
              ✅ Evento seleccionado: <strong>{eventoSeleccionado.nombre}</strong><br />
              Fechas: {eventoSeleccionado.fechaDesde?.split('-').reverse().join('/')}
              {eventoSeleccionado.fechaHasta && eventoSeleccionado.fechaHasta !== eventoSeleccionado.fechaDesde &&
                ` - ${eventoSeleccionado.fechaHasta.split('-').reverse().join('/')}`}
            </div>
          )}
        </div>

        {/* Resto del formulario solo se muestra si hay un evento seleccionado */}
        {eventoSeleccionado && (
          <>
            {/* Sección Datos de la Empresa - Color Azul */}
            <div className="seccion-formulario" style={{
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '2px solid #2196f3',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
            }}>
              <h3 style={{ color: '#1976d2', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                🏢 Datos de la Empresa
              </h3>
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Dirección:</label>
                  <input
                    type="text"
                    value={datosEmpresa.direccion}
                    onChange={(e) => actualizarDatosEmpresa('direccion', e.target.value)}
                    disabled={guardando}
                  />
                </div>
                <div className="campo-grupo">
                  <label>Ciudad:</label>
                  <input
                    type="text"
                    value={datosEmpresa.ciudad}
                    onChange={(e) => actualizarDatosEmpresa('ciudad', e.target.value)}
                    disabled={guardando}
                  />
                </div>
              </div>
              
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Página Web:</label>
                  <input
                    type="url"
                    value={datosEmpresa.paginaWeb}
                    onChange={(e) => actualizarDatosEmpresa('paginaWeb', e.target.value)}
                    placeholder="ej.: https://www.articulos_del_hogar.com.ar"
                    disabled={guardando}
                  />
                </div>
                <div className="campo-grupo">
                  <label>Código Postal:</label>
                  <input
                    type="text"
                    value={datosEmpresa.codigoPostal}
                    onChange={(e) => actualizarDatosEmpresa('codigoPostal', e.target.value)}
                    disabled={guardando}
                  />
                </div>
              </div>
              
              <div className="campo-grupo">
                <label>Rubro:</label>
                <input
                  type="text"
                  value={datosEmpresa.rubro}
                  onChange={(e) => actualizarDatosEmpresa('rubro', e.target.value)}
                  disabled={guardando}
                />
              </div>
            </div>

            {/* Sección Personas - Color Verde */}
            <div className="seccion-formulario" style={{
              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
              border: '2px solid #4caf50',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
            }}>
              <h3 style={{ color: '#388e3c', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                👥 Personas que asistirán
              </h3>
              {personas.map((persona, index) => (
                <div key={persona.id} className="persona-card" style={{
                  background: 'white',
                  border: '1px solid #81c784',
                  borderRadius: 'var(--radius-medium)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
                }}>
                  <div className="persona-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #81c784'
                  }}>
                    <h5 style={{ color: '#388e3c' }}>Persona {index + 1}</h5>
                    {personas.length > 1 && (
                      <button
                        type="button"
                        className="btn-secundario"
                        onClick={() => eliminarPersona(persona.id)}
                        disabled={guardando}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--danger-color)',
                          fontSize: '0.9rem'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="campo-fila">
                    <div className="campo-grupo">
                      <label>Nombre:</label>
                      <input
                        type="text"
                        value={persona.nombre}
                        onChange={(e) => actualizarPersona(persona.id, 'nombre', e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                    <div className="campo-grupo">
                      <label>Apellido:</label>
                      <input
                        type="text"
                        value={persona.apellido}
                        onChange={(e) => actualizarPersona(persona.id, 'apellido', e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                  </div>
                  
                  <div className="campo-fila">
                    <div className="campo-grupo">
                      <label>Empresa: (Razón Social)</label>
                      <input
                        type="text"
                        value={persona.empresa}
                        onChange={(e) => actualizarPersona(persona.id, 'empresa', e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                    <div className="campo-grupo">
                      <label>Cargo:</label>
                      <input
                        type="text"
                        value={persona.cargo}
                        onChange={(e) => actualizarPersona(persona.id, 'cargo', e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                  </div>
                  
                  <div className="campo-fila">
                    <div className="campo-grupo">
                      <label>Email:</label>
                      <input
                        type="email"
                        value={persona.email}
                        onChange={(e) => actualizarPersona(persona.id, 'email', e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                    <div className="campo-grupo">
                      <label>Celular:</label>
                      <input
                        type="tel"
                        value={persona.celular}
                        onChange={(e) => {
                          // Máscara para celular: (011) 15-6789-0123
                          let valor = e.target.value.replace(/\D/g, '');
                          if (valor.length <= 13) {
                            if (valor.length >= 3) {
                              valor = `(${valor.slice(0, 3)}) ${valor.slice(3)}`;
                            }
                            if (valor.length >= 8) {
                              valor = valor.replace(/(\(\d{3}\) )(\d{2})/, '$1$2-');
                            }
                            if (valor.length >= 13) {
                              valor = valor.replace(/(\(\d{3}\) \d{2}-\d{4})(\d{4})/, '$1-$2');
                            }
                            actualizarPersona(persona.id, 'celular', valor);
                          }
                        }}
                        placeholder="(011) 15-6789-0123"
                        disabled={guardando}
                      />
                    </div>
                  </div>
                  
                  <div className="campo-fila">
                    <div className="campo-grupo">
                      <label>Teléfono:</label>
                      <input
                        type="tel"
                        value={persona.telefono}
                        onChange={(e) => {
                          // Máscara para teléfono fijo: (011) 4567-8901
                          let valor = e.target.value.replace(/\D/g, '');
                          if (valor.length <= 10) {
                            if (valor.length >= 3) {
                              valor = `(${valor.slice(0, 3)}) ${valor.slice(3)}`;
                            }
                            if (valor.length >= 9) {
                              valor = valor.replace(/(\(\d{3}\) )(\d{4})(\d{4})/, '$1$2-$3');
                            }
                            actualizarPersona(persona.id, 'telefono', valor);
                          }
                        }}
                        placeholder="(011) 4567-8901"
                        disabled={guardando}
                      />
                    </div>
                    <div className="campo-grupo">
                      <label>DNI:</label>
                      <input
                        type="text"
                        value={persona.dni}
                        onChange={(e) => actualizarPersona(persona.id, 'dni', e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                  </div>

                  {/* Subsección Actividades - Color Púrpura */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)',
                    border: '1px solid #9c27b0',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginTop: '1.5rem'
                  }}>
                    <div className="checkbox-section" style={{ marginTop: '0' }}>
                      <h6 style={{ 
                        marginBottom: '0.75rem', 
                        color: '#7b1fa2',
                        fontSize: '1.1rem'
                      }}>
                        📅 Días de asistencia y actividades:
                      </h6>
                      <div className="checkbox-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '0.75rem' 
                      }}>
                        <label className="checkbox-container" style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-small)',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={persona.lunes}
                            onChange={(e) => actualizarPersona(persona.id, 'lunes', e.target.checked)}
                            disabled={guardando}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>📅 Asiste Lunes</span>
                        </label>
                        
                        <label className="checkbox-container" style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-small)',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={persona.martes}
                            onChange={(e) => actualizarPersona(persona.id, 'martes', e.target.checked)}
                            disabled={guardando}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>📅 Asiste Martes</span>
                        </label>
                        
                        <label className="checkbox-container" style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-small)',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={persona.miercoles}
                            onChange={(e) => actualizarPersona(persona.id, 'miercoles', e.target.checked)}
                            disabled={guardando}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>📅 Asiste Miércoles</span>
                        </label>
                        
                        <label className="checkbox-container" style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-small)',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={persona.asisteCena}
                            onChange={(e) => actualizarPersona(persona.id, 'asisteCena', e.target.checked)}
                            disabled={guardando}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>🍽️ Asiste a la cena de cierre</span>
                        </label>
                        
                        <label className="checkbox-container" style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-small)',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={persona.atendeReuniones}
                            onChange={(e) => actualizarPersona(persona.id, 'atendeReuniones', e.target.checked)}
                            disabled={guardando}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>🤝 Atiende agenda de reuniones</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Campo Menú Especial */}
                  <div className="campo-grupo" style={{ marginTop: '1.5rem' }}>
                    <label>Menú Especial cena de cierre:</label>
                    <input
                      type="text"
                      value={persona.menuEspecial}
                      onChange={(e) => actualizarPersona(persona.id, 'menuEspecial', e.target.value)}
                      placeholder="Vegetariano, sin gluten, etc."
                      disabled={guardando}
                    />
                  </div>
                </div>
              ))}
              
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={agregarPersona}
                  disabled={guardando}
                  style={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  ➕ Agregar Persona
                </button>
              </div>
            </div>

            {/* Sección Comentarios - Color Gris */}
            <div className="seccion-formulario" style={{
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '2px solid #757575',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(117, 117, 117, 0.15)'
            }}>
              <h3 style={{ color: '#424242', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                💬 Comentarios
              </h3>
              <div className="campo-grupo">
                <label>Comentarios adicionales:</label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comentarios adicionales..."
                  disabled={guardando}
                  rows="4"
                />
              </div>
            </div>

            <div className="nota-importante inferior">
              <div className="nota-icon">🏢</div>
              <div className="nota-content">
                <h3>Confirmación de registro:</h3>
                <ul>
                  <li>✅ Evento seleccionado</li>
                  <li>✅ Datos de la empresa completos</li>
                  <li>✅ Información de contacto actualizada</li>
                  <li>✅ Días y actividades seleccionadas</li>
                </ul>
                <p><strong>La confirmación se enviará en las próximas 24 horas.</strong></p>
              </div>
            </div>

            <div className="formulario-acciones">
              <button 
                type="submit" 
                className="btn-primario"
                disabled={guardando}
              >
                {guardando ? '⏳ Guardando...' : '✅ Guardar Formulario'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default FormularioProveedorSinHotel;