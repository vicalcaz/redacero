import { useState } from 'react';
import { FirebaseService } from '../../services/FirebaseService';
import './FormularioBase.css';

function FormularioSocio({ user }) {
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
    fechaLlegada: '',
    horaLlegada: '',
    fechaSalida: '',
    horaSalida: '',
    lunes: false,
    martes: false,
    miercoles: false,
    asisteCena: false,
    menuEspecial: '',
    atendeReuniones: false,
    tipoHabitacion: 'simple',
    noches: 1,
    acompanantes: 0
  }]);

  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [config, setConfig] = useState(null);

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
      fechaLlegada: '',
      horaLlegada: '',
      fechaSalida: '',
      horaSalida: '',
      lunes: false,
      martes: false,
      miercoles: false,
      asisteCena: false,
      menuEspecial: '',
      atendeReuniones: false,
      tipoHabitacion: 'simple',
      noches: 1,
      acompanantes: 0
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
    setGuardando(true);

    try {
      const formularioData = {
        tipo: 'Socio',
        datosEmpresa,
        personas,
        comentarios,
        fechaEnvio: new Date().toISOString(),
        usuarioCreador: user?.email || 'Anónimo'
      };

      console.log('Enviando formulario Socio:', formularioData);
      
      // Usar el método específico que existe en FirebaseService
      const id = await FirebaseService.guardarFormularioSocio(formularioData);
      
      alert('✅ Formulario de Socio guardado exitosamente!');
      console.log('Formulario guardado con ID:', id);
      
      // Limpiar formulario después de guardar
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
        fechaLlegada: '',
        horaLlegada: '',
        fechaSalida: '',
        horaSalida: '',
        lunes: false,
        martes: false,
        miercoles: false,
        asisteCena: false,
        menuEspecial: '',
        atendeReuniones: false,
        tipoHabitacion: 'doble',
        noches: 1,
        acompanantes: 0
      }]);
      setComentarios('');
      
    } catch (error) {
      console.error('Error completo:', error);
      console.error('FirebaseService disponible:', !!FirebaseService);
      console.error('Métodos de FirebaseService:', Object.keys(FirebaseService || {}));
      alert(`❌ Error al guardar el formulario: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };
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
          <div className="formulario-container"> {/* ✅ Clase principal del CSS */}
            <div className="formulario-header">
              <h1>Eventos Red Acero</h1>
              <h2>📝 Formulario Socio</h2>
            </div>
            </div><div style={{ marginLeft: 24 }}>
            <h2>{config?.textoEncabezado || 'Formulario Socio'}</h2>
            <p>{config?.textoDescripcion || ''}</p>
          </div> 
          </div>
        </div> 
      <div className="nota-importante superior">
        <div className="nota-icon">🏨</div>
        <div className="nota-content">
          <h3>Información para Socios</h3>
          <ul>
            <li><strong>Complete todos los campos obligatorios (*)</strong></li>
            <li>Indique el tipo de habitación y número de acompañantes</li>
            <li>Especifique las fechas exactas de alojamiento</li>
            <li>Los datos de acompañantes son importantes para el registro</li>
          </ul>
        </div>
      </div>
      
      <form className="formulario-form" onSubmit={handleSubmit}>
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
          <div className="campo-fila"> {/* ✅ Cambio: campo-fila en lugar de form-grid */}
            <div className="campo-grupo"> {/* ✅ Cambio: campo-grupo en lugar de form-group */}
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

              {/* Información de Hotel */}
              <div style={{
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                border: '1px solid #ff9800',
                borderRadius: '8px',
                padding: '1.5rem',
                marginTop: '1.5rem'
              }}>
                <h5 style={{ 
                  marginTop: '0', 
                  color: '#f57c00', 
                  marginBottom: '1rem',
                  fontSize: '1.2rem'
                }}>
                  🏨 Información de Alojamiento
                </h5>
                <div className="campo-grupo">
                  <label>Tipo de Habitación:</label>
                  <select
                    value={persona.tipoHabitacion}
                    onChange={(e) => actualizarPersona(persona.id, 'tipoHabitacion', e.target.value)}
                    disabled={guardando}
                  >
                    <option value="doble">Doble</option>
                    <option value="matrimonial">Matrimonial</option>
                  </select>
                </div>

                {/* Fechas y Horas */}
                <div className="campo-fila">
                  <div className="campo-grupo">
                    <label>Fecha de Llegada:</label>
                    <input
                      type="date"
                      value={persona.fechaLlegada}
                      onChange={(e) => actualizarPersona(persona.id, 'fechaLlegada', e.target.value)}
                      disabled={guardando}
                    />
                  </div>
                  <div className="campo-grupo">
                    <label>Hora de Llegada:</label>
                    <input
                      type="time"
                      value={persona.horaLlegada}
                      onChange={(e) => actualizarPersona(persona.id, 'horaLlegada', e.target.value)}
                      disabled={guardando}
                    />
                  </div>
                </div>
                
                <div className="campo-fila">
                  <div className="campo-grupo">
                    <label>Fecha de Salida:</label>
                    <input
                      type="date"
                      value={persona.fechaSalida}
                      onChange={(e) => actualizarPersona(persona.id, 'fechaSalida', e.target.value)}
                      disabled={guardando}
                    />
                  </div>
                  <div className="campo-grupo">
                    <label>Hora de Salida:</label>
                    <input
                      type="time"
                      value={persona.horaSalida}
                      onChange={(e) => actualizarPersona(persona.id, 'horaSalida', e.target.value)}
                      disabled={guardando}
                    />
                  </div>
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
          <div className="nota-icon">🏨</div>
          <div className="nota-content">
            <h3>Confirmación de reserva hotelera:</h3>
            <ul>
              <li>✅ Tipo de habitación y fechas están correctas</li>
              <li>✅ Información de acompañantes completa</li>
              <li>✅ Datos de contacto actualizados</li>
            </ul>
            <p><strong>La reserva se confirmará en las próximas 24 horas.</strong></p>
          </div>
        </div>

        <div className="formulario-acciones"> {/* ✅ Cambio: formulario-acciones */}
          <button 
            type="submit" 
            className="btn-primario"
            disabled={guardando}
          >
            {guardando ? '⏳ Guardando...' : '✅ Guardar Formulario'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioSocio;