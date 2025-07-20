import { useState, useEffect } from 'react';
import { FirebaseService } from '../../services/FirebaseService';
import './FormularioBase.css';
import { useEventoDestacado } from "../../context/EventoDestacadoContext";

function FormularioProveedorConHotel({ user }) {
  const { rolUsuario, eventoId } = useEventoDestacado();

  const [datosEmpresa, setDatosEmpresa] = useState({
    empresa: '',
    direccion: '',
    ciudad: '',
    paginaWeb: '',
    codigoPostal: '',
    rubro: '',
    cantidad_personas: 0
  });

  const [personas, setPersonas] = useState([{
    id: 1,
    nombre: '',
    apellido: '',
    cargo: '',
    celular: '',
    telefono: '',
    email: '',
    dni: '',
    fechaLlegada: '',
    horaLlegada: '',
    fechaSalida: '',
    horaSalida: '',
    lunes: null,
    martes: null,
    miercoles: null,
    asisteCena: null,
    menuEspecial: '',
    atiendeReuniones: null,
    tipoHabitacion: null,
    noches: 0
  }]);

  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [eventosLoading, setEventosLoading] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      setEventosLoading(true);
      const todos = await FirebaseService.obtenerEventos();
      const activos = todos.filter(ev => ev.estado === 'planificado' || ev.estado === 'activo');
      setEventos(activos);

      // Seleccionar por defecto el evento destacado si no es admin
      if (rolUsuario !== 'admin' && eventoId) {
        setEventoSeleccionado(eventoId);
      }
      setEventosLoading(false);
    };
    cargarEventos();
  }, [rolUsuario, eventoId]);

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
      atiendeReuniones: false,
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
    if (!eventoSeleccionado) {
      alert('Debe seleccionar un evento');
      return;
    }
    setGuardando(true);

    try {
      // 1. Calcular cantidad de personas
      const cantidadPersonas = personas.length;

      // 2. Calcular noches para cada persona
      const personasActualizadas = personas.map(persona => {
        let noches = 0;
        if (persona.fechaLlegada && persona.fechaSalida) {
          const fechaLlegada = new Date(persona.fechaLlegada);
          const fechaSalida = new Date(persona.fechaSalida);
          // Diferencia en milisegundos, luego a días
          noches = Math.max(1, Math.round((fechaSalida - fechaLlegada) / (1000 * 60 * 60 * 24)));
        }
        return { ...persona, noches };
      });

      // 3. Guardar cantidad_personas en datosEmpresa
      const datosEmpresaActualizados = {
        ...datosEmpresa,
        cantidad_personas: cantidadPersonas
      };

      const formularioData = {
        tipo: 'Proveedor-con-hotel',
        eventoId: eventoSeleccionado,
        datosEmpresa: datosEmpresaActualizados,
        personas: personasActualizadas,
        comentarios,
        fechaEnvio: new Date().toISOString(),
        usuarioCreador: user?.email || 'Anónimo'
      };

      console.log('Enviando formulario Proveedor con Hotel:', formularioData);

      const id = await FirebaseService.guardarFormularioProveedorConHotel(formularioData);

      alert('✅ Formulario de Proveedor con Hotel guardado exitosamente!');
      console.log('Formulario guardado con ID:', id);

      // Limpiar formulario después de guardar
      setDatosEmpresa({
        empresa: '',
        direccion: '',
        ciudad: '',
        paginaWeb: '',
        codigoPostal: '',
        rubro: '',
        cantidad_personas: 0
      });
      setPersonas([{
        id: 1,
        nombre: '',
        apellido: '',
        cargo: '',
        celular: '',
        telefono: '',
        email: '',
        dni: '',
        fechaLlegada: '',
        horaLlegada: '',
        fechaSalida: '',
        horaSalida: '',
        lunes: null,
        martes: null,
        miercoles: null,
        asisteCena: null,
        menuEspecial: '',
        atiendeReuniones: null,
        tipoHabitacion: null,
        noches: 0,
      }]);
      setComentarios('');

    } catch (error) {
      console.error('Error completo:', error);
      alert(`❌ Error al guardar el formulario: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="formulario-container"> {/* ✅ Clase principal del CSS */}
      <div className="formulario-header">
        <h1>Eventos Red Acero</h1>
        <h2>📝 Formulario Proveedor con Hotel</h2>
      </div>

      <div className="nota-importante superior">
        <div className="nota-icon">🏨</div>
        <div className="nota-content">
          <h3>Información para Proveedores con Hotel</h3>
          <ul>
            <li><strong>Complete todos los campos obligatorios (*)</strong></li>
            <li>Indique el tipo de habitación y número de acompañantes</li>
            <li>Especifique las fechas exactas de alojamiento</li>
            <li>Los datos de acompañantes son importantes para el registro</li>
          </ul>
        </div>
      </div>
      
      <form className="formulario-form" onSubmit={handleSubmit}>
        {/* Sección Selección de Evento - Color Amarillo */}
        {eventosLoading ? (
          <div style={{ marginBottom: 24 }}>Cargando eventos...</div>
        ) : (
          <div className="seccion-formulario" >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              📅 Selección de Evento <span style={{ color: 'red' }}>*</span>
            </h3>
            <select
              value={eventoSeleccionado}
              onChange={e => setEventoSeleccionado(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #bbb',
                fontSize: '1.1rem'
              }}
              disabled={rolUsuario !== 'admin' || guardando} // Solo admin puede modificar
            >
              <option value="">-- Seleccione un evento --</option>
              {eventos.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.nombre} ({ev.fechaDesde?.split('-').reverse().join('/')} - {ev.fechaHasta?.split('-').reverse().join('/')})
                </option>
              ))}
            </select>
            {!eventoSeleccionado && (
              <div style={{ color: 'red', marginTop: 8, fontSize: '0.95rem' }}>
                Debe seleccionar un evento para continuar.
              </div>
            )}
          </div>
        )}

        {/* Sección Datos de la Empresa - Color Azul */}
        <div className="seccion-formulario">
          <h3>   🏢 Datos de la Empresa    </h3>
          <div className="campo-fila"> {/* ✅ Cambio: campo-fila en lugar de form-grid */}
            <div className="campo-grupo">
                  <label>Empresa: (Razón Social)</label>
                  <input
                    type="text"
                    value={datosEmpresa.empresa}
                    onChange={(e) => actualizarDatosEmpresa('empresa', e.target.value)}
                    onInvalid={e => e.target.setCustomValidity('Por favor complete este campo.')}
                    onInput={e => e.target.setCustomValidity('')}
                    disabled={guardando}
                  />
                </div>
            <div className="campo-grupo"> {/* ✅ Cambio: campo-grupo en lugar de form-group */}
              <label>Dirección:</label>
              <input
                type="text"
                value={datosEmpresa.direccion}
                onChange={(e) => actualizarDatosEmpresa('direccion', e.target.value)}
                placeholder="calle y número"
                required
                disabled={guardando}
              />
            </div>
          </div>
          <div className="campo-fila"> 
             <div className="campo-grupo">
               <label>Ciudad:</label>
               <input
                 type="text"
                 value={datosEmpresa.ciudad}
                 onChange={(e) => actualizarDatosEmpresa('ciudad', e.target.value)}
                 placeholder="ej.: Buenos Aires"
                 required
                 disabled={guardando}
               />
             </div>
             <div className="campo-grupo">
               <label>Página Web:</label>
               <input
                 type="url"
                 value={datosEmpresa.paginaWeb}
                 onChange={(e) => actualizarDatosEmpresa('paginaWeb', e.target.value)}
                 placeholder="ej.: https://www.articulos_del_hogar.com.ar"
                 required
                 disabled={guardando}
               />
             </div>
          </div>  
          <div className="campo-fila"> 
            <div className="campo-grupo">
              <label>Código Postal:</label>
                <input
                type="text" 
                value={datosEmpresa.codigoPostal}
                placeholder="ej.: 1234"
                onChange={(e) => actualizarDatosEmpresa('codigoPostal', e.target.value)}
                required  
                disabled={guardando}
               />
            </div>
            <div className="campo-grupo">
              <label>Rubro:</label>
              <input
              type="text"
              value={datosEmpresa.rubro}
              onChange={(e) => actualizarDatosEmpresa('rubro', e.target.value)}
              placeholder="ej.: Artículos del Hogar"              
              required
              disabled={guardando}
              />
            </div>
          </div>  
        </div>
        
        <div className="seccion-formulario" style={{
          border: '2px solid --color-azul-oscuro',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
        }}>
          <h3>
            👥 Personas que asistirán
          </h3>
          {personas.map((persona, index) => (
            <div key={persona.id} >
              <div className="persona-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid --color-gris'
              }}>
                <h5>Persona {index + 1}</h5>
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
                    required
                    disabled={guardando}
                  />
                </div>
                <div className="campo-grupo">
                  <label>Apellido:</label>
                  <input
                    type="text"
                    value={persona.apellido}
                    onChange={(e) => actualizarPersona(persona.id, 'apellido', e.target.value)}
                    required
                    disabled={guardando}
                  />
                </div>
              </div>
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Cargo:</label>
                  <input
                    type="text"
                    value={persona.cargo}
                    onChange={(e) => actualizarPersona(persona.id, 'cargo', e.target.value)}
                    required
                    disabled={guardando}
                  />
                </div>
                <div className="campo-grupo">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={persona.email}
                    onChange={(e) => actualizarPersona(persona.id, 'email', e.target.value)}
                    placeholder="ejemplo@dominio.com"
                    required
                    onInput={e => e.target.setCustomValidity('')}
                    onInvalid={e => e.target.setCustomValidity('Por favor ingrese un email válido')}
                    disabled={guardando}
                  />
                </div>
              </div>
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Celular:</label>
                  <input
                    type="tel"
                    value={persona.celular}
                    onChange={e => {
                      let valor = e.target.value.replace(/\D/g, '');

                      // Empieza con +54 9
                      let resultado = '+54 9 ';
                      if (valor.startsWith('549')) {
                        valor = valor.slice(3);
                      } else if (valor.startsWith('54')) {
                        valor = valor.slice(2);
                      } else if (valor.startsWith('9')) {
                        valor = valor.slice(1);
                      }

                      // Código de área (2 a 4 dígitos)
                      if (valor.length > 0) resultado += valor.slice(0, 4);
                      if (valor.length > 4) resultado += ' ' + valor.slice(4, 7);
                      if (valor.length > 7) resultado += ' ' + valor.slice(7, 11);

                      actualizarPersona(persona.id, 'celular', resultado.trim());
                    }}
                    placeholder="+54 9 11 6789 0123"
                    onInvalid={e => e.target.setCustomValidity('Por favor ingrese el celular en formato internacional.')}
                    onInput={e => e.target.setCustomValidity('')}
                    required
                    disabled={guardando}
                  />
                  
                </div>
                <div className="campo-grupo">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={persona.telefono}
                    onChange={(e) => {
                      // Máscara para teléfono fijo: (011) 4567-8901
                      let valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 12) {
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
                    onInvalid={e => e.target.setCustomValidity('Por favor ingrese el teléfono fijo.')}
                    required
                    disabled={guardando}
                  />
                </div>
                <div className="campo-grupo">
                  <label>DNI:</label>
                  <input
                      type="text"
                      value={persona.dni}
                      onChange={e => actualizarPersona(persona.id, 'dni', e.target.value)}
                      placeholder="Cargue su documento sin puntos."
                      required
                      pattern="\d{7,8}"
                      onInvalid={e => e.target.setCustomValidity('El DNI debe tener 7 u 8 números, sin puntos.')}
                      onInput={e => e.target.setCustomValidity('')}
                      disabled={guardando}
                    />
                </div>
              </div>

              {/* Información de Hotel */}
              <div>
                <h5 style={{ 
                  marginTop: '0', 
                  marginBottom: '1rem',
                  fontSize: '1.2rem'
                }}>
                  🏨 Información de Alojamiento
                </h5>
                <div className="campo-grupo">
                  <label>Tipo de Habitación:</label>
                 <select
                  value={persona.tipoHabitacion || ''}
                  onChange={e => actualizarPersona(persona.id, 'tipoHabitacion', e.target.value)}
                  required
                  onInvalid={e => e.target.setCustomValidity('Por favor ingrese el tipo de habitación.')}
                  onInput={e => e.target.setCustomValidity('')}
                  disabled={guardando}
                >
                  <option value="">-- Seleccione --</option>
                  <option value="doble">Doble</option>
                  <option value="matrimonial">Matrimonial</option>
                  </select> 
                </div>
                {/* Ca  mpo Comentario */}
                <div className="campo-grupo">
                  <label>Comentario sobre tipo de habitación seleccionada:</label>
                  <input
                    type="text"
                    value={persona.comentario || ''}
                    onChange={e => actualizarPersona(persona.id, 'comentario', e.target.value)}
                    placeholder="Ej: Indique con quién comparte habitación o a quién reemplaza"
                    required
                    onInvalid={e => e.target.setCustomValidity('Por favor indique en caso de corresponder o no con quien comparte habitación o a quien reemplaza.')}
                    onInput={e => e.target.setCustomValidity('')}
                    disabled={guardando}
                  />
                </div>

                {/* Fechas y Horas */}
                <div className="campo-fila">
                  <div className="campo-grupo">
                    <label>Fecha de Llegada:</label>
                    <input
                      type="date"
                      value={persona.fechaLlegada}
                      onChange={(e) => actualizarPersona(persona.id, 'fechaLlegada', e.target.value)}
                      required
                      onInvalid={e => e.target.setCustomValidity('Por favor indique la fecha de llegada al hotel.')}
                      onInput={e => e.target.setCustomValidity('')}
                      disabled={guardando}
                    />
                  </div>
                  <div className="campo-grupo">
                    <label>Hora de Llegada:</label>
                    <input
                      type="time"
                      value={persona.horaLlegada}
                      onChange={(e) => actualizarPersona(persona.id, 'horaLlegada', e.target.value)}
                      onInvalid={e => e.target.setCustomValidity('Por favor indique la hora de llegada al hotel.')}
                      onInput={e => e.target.setCustomValidity('')}
                      required
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
                      onInvalid={e => e.target.setCustomValidity('Por favor indique la fecha de salida al hotel.')}
                      onInput={e => e.target.setCustomValidity('')}
                      required
                      disabled={guardando}
                    />
                  </div>
                  <div className="campo-grupo">
                    <label>Hora de Salida:</label>
                    <input
                      type="time"
                      value={persona.horaSalida}
                      onChange={(e) => actualizarPersona(persona.id, 'horaSalida', e.target.value)}
                      onInvalid={e => e.target.setCustomValidity('Por favor indique la hora de salida al hotel.')}
                      onInput={e => e.target.setCustomValidity('')}
                      required
                      disabled={guardando}
                    />
                  </div>
                </div>
              </div>

              {/* Subsección Actividades - Color Púrpura */}
              <div >
                <div className="checkbox-section" style={{ marginTop: '0' }}>
                  <h6 style={{ 
                    marginBottom: '0.75rem', 
                    fontSize: '1.1rem'
                  }}>
                    📅 Días de asistencia y actividades:
                  </h6>
                  <div className="checkbox-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '0.75rem' 
                  }}>
                    <div className="campo-grupo">
                      <label>Asiste Lunes:</label>
                      <select
                        value={persona.lunes === true ? 'si' : persona.lunes === false ? 'no' : ''}
                        onChange={e => {
                          let val = e.target.value;
                          actualizarPersona(persona.id, 'lunes', val === '' ? null : val === 'si');
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir o no el lunes al evento.')}
                        disabled={guardando}
                      >

                         <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                     </select>
                    </div>
                    <div className="campo-grupo">
                      <label>Asiste Martes:</label>
                      <select
                        value={persona.martes === true ? 'si' : persona.martes === false ? 'no' : ''}
                        onChange={e => {
                          let val = e.target.value;
                          actualizarPersona(persona.id, 'martes', val === '' ? null : val === 'si');
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir o no el martes al evento.')}
                        disabled={guardando}
                      >

                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>
                    <div className="campo-grupo">
                      <label>Asiste Miércoles:</label>
                      <select
                        value={persona.miercoles === true ? 'si' : persona.miercoles === false ? 'no' : ''}
                        onChange={e => {
                          let val = e.target.value;
                          actualizarPersona(persona.id, 'miercoles', val === '' ? null : val === 'si');
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir o no el miércoles al evento.')}
                        disabled={guardando}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>
                    <div className="campo-grupo">
                      <label>Asiste a la cena de cierre:</label>
                      <select
                        value={persona.asisteCena  === true ? 'si' : persona.asisteCena === false ? 'no' : ''}
                        onChange={e => {
                          let val = e.target.value;
                          actualizarPersona(persona.id, 'asisteCena', val === '' ? null : val === 'si');
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir a la cena de cierre del evento.')}
                        disabled={guardando}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>                    
                    <div className="campo-grupo">
                      <label>Atiende agenda de reuniones:</label>
                      <select
                        value={persona.atiendeReuniones  === true ? 'si' : persona.atiendeReuniones === false ? 'no' : ''}
                        onChange={e => {
                          let val = e.target.value;
                          actualizarPersona(persona.id, 'atiendeReuniones', val === '' ? null : val === 'si');
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a gestionar la agenda de reuniones.')}
                        disabled={guardando}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>
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
                  required
                  onInvalid={e => e.target.setCustomValidity('Por favor indique si requiere un menú especial, por lo contrario escriba "No".')}
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
                background: 'linear-gradient(135deg, --color-azul-claro 0%, --color-azul-oscuro 100%)',
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

export default FormularioProveedorConHotel;