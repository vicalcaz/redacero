import { useEffect, useState } from 'react';
import { matchSorter } from 'match-sorter';
import { FirebaseService } from '../../services/FirebaseService';
import './FormularioBase.css';
import { useEventoDestacado } from "../../context/EventoDestacadoContext";


function FormularioProveedorSinHotel({ user, onCancel }) {
  const { rolUsuario, eventoId, evento, setEvento } = useEventoDestacado();

  // Admin user selector state
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [filtroUsuario, setFiltroUsuario] = useState('');

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
    lunes: '',
    martes: '',
    miercoles: '',
    asisteCena: '',
    menuEspecial: '',
    atiendeReuniones: ''
    
  }]);

  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [eventosLoading, setEventosLoading] = useState(true);
  
  const [formularioExistente, setFormularioExistente] = useState(null);
  const [edicionHabilitada, setEdicionHabilitada] = useState(true);

  const [configProveedorSinHotel, setConfigProveedorSinHotel] = useState(null);

  // Al montar, buscar si ya existe formulario para este usuario y evento
  useEffect(() => {
    const cargarFormularioExistente = async () => {
      const emailParaBuscar = rolUsuario === 'admin' && usuarioSeleccionado?.email ? usuarioSeleccionado.email : user?.email;
      if (!eventoSeleccionado || !emailParaBuscar) return;
      const existente = await FirebaseService.obtenerFormularioProveedorSinHotelPorUsuarioYEvento(emailParaBuscar, eventoSeleccionado);
      if (existente) {
        setFormularioExistente(existente);
        setDatosEmpresa(existente.datosEmpresa || {});
        setPersonas(existente.personas || []);
        setComentarios(existente.comentarios || '');
      } else {
        setFormularioExistente(null);
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
          lunes: '',
          martes: '',
          miercoles: '',
          asisteCena: '',
          menuEspecial: '',
          atiendeReuniones: ''
        }]);
        setComentarios('');
      }
    };
    cargarFormularioExistente();
    // eslint-disable-next-line
  }, [eventoSeleccionado, user, rolUsuario, usuarioSeleccionado]);

  // Cargar usuarios para admin
  useEffect(() => {
    if (rolUsuario === 'admin') {
      FirebaseService.obtenerUsuarios().then(setUsuarios);
    }
  }, [rolUsuario]);

  // Controlar si la edición está habilitada según la fecha límite
  useEffect(() => {
    if (!evento) {
      console.log("evento aún no está disponible");
      return;
    }
    if (!evento.fechaLimiteEdicion) {
      setEdicionHabilitada(true);
      return;
    }
    const hoy = new Date();
    const fechaLimite = new Date(evento.fechaLimiteEdicion);
    setEdicionHabilitada(hoy <= fechaLimite);
  }, [evento]);

  useEffect(() => {
    const cargarEventos = async () => {
      setEventosLoading(true);
      try {
        const eventosObtenidos = await FirebaseService.obtenerEventos(); // Ajusta el método si es necesario
        setEventos(eventosObtenidos);
        // Si hay uno destacado, selecciónalo por defecto
        if (eventosObtenidos.length > 0 && !eventoSeleccionado) {
          setEventoSeleccionado(eventosObtenidos[0].id);
        }
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setEventosLoading(false);
      }
    };
    cargarEventos();
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
      lunes: '',
      martes: '',
      miercoles: '',
      asisteCena: '',
      menuEspecial: '',
      atiendeReuniones: '',
      comentario: ''
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
      // 1. Calcular cantidad de personas
      const cantidadPersonas = personas.length;
      // 3. Guardar cantidad_personas en datosEmpresa
      const datosEmpresaActualizados = {
        ...datosEmpresa,
        cantidad_personas: cantidadPersonas
      };
      // Siempre usar el usuario logueado para usuarioCreador
      const emailParaGuardar = user?.email || '';
      // Asegurar que menuEspecial siempre tenga valor en cada persona
      const personasActualizadas = personas.map(persona => ({
        ...persona,
        menuEspecial: persona.menuEspecial ? persona.menuEspecial : 'Ninguno'
      }));
      const formularioData = {
        tipo: 'proveedor-sin-hotel',
        eventoId: eventoSeleccionado,
        datosEmpresa: datosEmpresaActualizados,
        personas: personasActualizadas,
        comentarios,
        fechaEnvio: new Date().toISOString(),
        usuarioCreador: emailParaGuardar.toLowerCase().trim()
      };
      let idFormularioExistente = formularioExistente?.id;
      if (idFormularioExistente) {
        await FirebaseService.actualizarFormulario('formularios', idFormularioExistente, formularioData);
        alert('✅ Formulario de Proveedor actualizado exitosamente!');
      } else {
        await FirebaseService.guardarFormularioProveedorSinHotel(formularioData);
        alert('✅ Formulario de Proveedor sin Hotel guardado exitosamente!');
      }
      // 🔄 Volver a consultar el formulario guardado
      const existente = await FirebaseService.obtenerFormularioProveedorSinHotelPorUsuarioYEvento(
        emailParaGuardar,
        eventoSeleccionado
      );
      if (existente) {
        setFormularioExistente(existente);
        setDatosEmpresa(existente.datosEmpresa || {});
        setPersonas(existente.personas || []);
        setComentarios(existente.comentarios || '');
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(`❌ Error al guardar el formulario: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  function addDays(dateStr, days) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  const minFecha = addDays(evento?.fechaDesde, -2);
  const maxFecha = addDays(evento?.fechaHasta, 2);

  useEffect(() => {
    if (!eventoSeleccionado || eventos.length === 0) return;
    const ev = eventos.find(e => e.id === eventoSeleccionado);
    if (ev && typeof setEvento === "function") {
      setEvento(ev);
    }
  }, [eventoSeleccionado, eventos, setEvento]);

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const config = await FirebaseService.obtenerConfiguracionFormularioProveedorSinHotel();
        setConfigProveedorSinHotel(config);
      } catch (error) {
        console.error("Error cargando configuración proveedor sin hotel:", error);
      }
    };
    cargarConfig();
  }, []);

  // Filtrado de usuarios para admin
  const usuariosFiltrados = filtroUsuario
    ? matchSorter(usuarios, filtroUsuario, { keys: ['nombre', 'email', 'empresa'] })
    : usuarios;

  return (
    <div className="formulario-container"> {/* ✅ Clase principal del CSS */}

      {/* Admin: Selector de usuario */}
      {rolUsuario === 'admin' && (
        <div style={{ marginBottom: 24, background: '#e3f2fd', padding: 16, borderRadius: 8 }}>
          <h3 style={{ marginBottom: 8 }}>👤 Seleccionar usuario para cargar/modificar formulario</h3>
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={filtroUsuario}
            onChange={e => setFiltroUsuario(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 4, border: '1px solid #bbb' }}
            disabled={guardando}
          />
          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4, background: '#fff' }}>
            {usuariosFiltrados.length === 0 ? (
              <div style={{ padding: 8, color: '#888' }}>No se encontraron usuarios</div>
            ) : (
              usuariosFiltrados.slice(0, 20).map(u => (
                <div
                  key={u.email}
                  style={{
                    padding: 8,
                    background: usuarioSeleccionado?.email === u.email ? '#90caf9' : 'transparent',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    fontWeight: usuarioSeleccionado?.email === u.email ? 600 : 400
                  }}
                  onClick={() => setUsuarioSeleccionado(u)}
                >
                  {u.nombre} ({u.email}) {u.empresa ? `- ${u.empresa}` : ''}
                </div>
              ))
            )}
          </div>
          {usuarioSeleccionado && (
            <div style={{ marginTop: 8, color: '#1976d2' }}>
              Usuario seleccionado: <b>{usuarioSeleccionado.nombre} ({usuarioSeleccionado.email})</b>
              <button type="button" style={{ marginLeft: 12 }} onClick={() => setUsuarioSeleccionado(null)} disabled={guardando}>Quitar selección</button>
            </div>
          )}
        </div>
      )}
      <div className="formulario-header">
        <h1>Eventos Red Acero</h1>
        <h2>📝 Formulario Proveedor sin Hotel</h2>
      </div>

      {!edicionHabilitada && (
        <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 16 }}>
          La edición del formulario ya no está permitida (fecha límite: {evento?.fechaLimiteEdicion}).
        </div>
      )}

      {formularioExistente && (
  <div style={{
    background: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeeba',
    borderRadius: 8,
    padding: '1rem',
    marginBottom: 24,
    fontWeight: 500
  }}>
    Ya existe un formulario cargado para este evento y usuario. Puedes editarlo y volver a guardar si es necesario.
  </div>
)}

      <form className="formulario-form" onSubmit={handleSubmit}>
        {/* Imagen de inicio */}
        {configProveedorSinHotel?.imageninicio && (
          <div style={{ margin: '12px 0' }}>
            <img
              src={configProveedorSinHotel.imageninicio}
              alt="Imagen de inicio"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: 180, display: 'block',  objectFit: 'cover',
                    borderRadius: '12px' }}
            />
          </div>
        )}

        {/* Nota de inicio */}
        {configProveedorSinHotel?.notainicio && (
          <div className="nota-inicio-formulario" dangerouslySetInnerHTML={{ __html: configProveedorSinHotel.notainicio }} />
        )}

        {/* Sección Selección de Evento - Color Amarillo */}
        {eventosLoading ? (
          <div style={{ marginBottom: 24 }}>Cargando eventos...</div>
        ) : (
          <div className="seccion-formulario" >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              📅 Evento seleccionado<span style={{ color: 'red' }}>*</span>
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
                    disabled={guardando || !edicionHabilitada}
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
                disabled={guardando || !edicionHabilitada}
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
                 disabled={guardando || !edicionHabilitada}
               />
             </div>
             <div className="campo-grupo">
              <label>Página Web:</label>
              <input
                type="text"
                value={datosEmpresa.paginaWeb}
                onChange={e => {
                  let valor = e.target.value;
                  if (valor === '') {
                    valor = 'www.';
                  }
                  valor = valor.replace(/^https?:\/\//, '');
                  if (!valor.startsWith('www.')) {
                    valor = 'www.' + valor.replace(/^www\./, '');
                  }
                  actualizarDatosEmpresa('paginaWeb', valor);
                }}
                placeholder="ej.: www.articulos_del_hogar.com.ar"
                required
                disabled={guardando || !edicionHabilitada}
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
                disabled={guardando || !edicionHabilitada}
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
              disabled={guardando || !edicionHabilitada}
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
          <h3 style={{ marginBottom: '1.2rem', color: '#1976d2', fontWeight: 700, fontSize: '1.25rem' }}>
            Resumen información formulario
          </h3>
          <div style={{
            background: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center',
            fontSize: '1.08rem',
            fontWeight: 500
          }}>
            <span>👥 Personas registradas: <b>{personas.length}</b></span>
            <span style={{ fontSize: '0.98rem', color: '#333', marginLeft: 12 }}>
              {personas.map((p, i) => `${p.nombre} ${p.apellido}`.trim()).filter(n => n !== '').join(', ')}
            </span>
          </div>
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
                    disabled={guardando || !edicionHabilitada}
                  />
                </div>
                <div className="campo-grupo">
                  <label>Apellido:</label>
                  <input
                    type="text"
                    value={persona.apellido}
                    onChange={(e) => actualizarPersona(persona.id, 'apellido', e.target.value)}
                    required
                    disabled={guardando || !edicionHabilitada}
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
                    disabled={guardando || !edicionHabilitada}
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
                    disabled={guardando || !edicionHabilitada}
                  />
                </div>
              </div>
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Celular:</label>
                  <input
                    type="tel"
                    value={persona.celular}
                    onChange={e => actualizarPersona(persona.id, 'celular', e.target.value)}
                    placeholder="Celular"
                    onInvalid={e => e.target.setCustomValidity('Por favor ingrese el celular.')}
                    onInput={e => e.target.setCustomValidity('')}
                    disabled={guardando || !edicionHabilitada}
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
                    disabled={guardando || !edicionHabilitada}
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
                      disabled={guardando || !edicionHabilitada}
                    />
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
                        value={persona.lunes || ''}
                        onChange={e => {
                          actualizarPersona(persona.id, 'lunes', e.target.value === '' ? null : e.target.value);
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir o no el lunes al evento.')}
                        disabled={guardando || !edicionHabilitada}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                    </div>
                    <div className="campo-grupo">
                      <label>Asiste Martes:</label>
                      <select
                        value={persona.martes || ''}
                        onChange={e => {
                          actualizarPersona(persona.id, 'martes', e.target.value === '' ? null : e.target.value);
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir o no el martes al evento.')}
                        disabled={guardando || !edicionHabilitada}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>
                    <div className="campo-grupo">
                      <label>Asiste Miércoles:</label>
                      <select
                        value={persona.miercoles || ''}
                        onChange={e => {
                          actualizarPersona(persona.id, 'miercoles', e.target.value === '' ? null : e.target.value);
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir o no el miércoles al evento.')}
                        disabled={guardando || !edicionHabilitada}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>
                    <div className="campo-grupo">
                      <label>Asiste a la cena de cierre:</label>
                      <select
                        value={persona.asisteCena || ''}
                        onChange={e => {
                          actualizarPersona(persona.id, 'asisteCena', e.target.value === '' ? null : e.target.value);
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a asistir a la cena de cierre del evento.')}
                        disabled={guardando || !edicionHabilitada}
                      >
                        <option value="">-- Seleccione --</option>
                        <option value="no">No</option>
                        <option value="si">Sí</option>
               
                     </select>
                    </div>                    
                    <div className="campo-grupo">
                      <label>Atiende agenda de reuniones:</label>
                      <select
                        value={persona.atiendeReuniones || ''}
                        onChange={e => {
                          actualizarPersona(persona.id, 'atiendeReuniones', e.target.value === '' ? null : e.target.value);
                        }}
                        required
                        onInvalid={e => e.target.setCustomValidity('Por favor indique si va a gestionar la agenda de reuniones.')}
                        disabled={guardando || !edicionHabilitada}
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
                <select
                  value={persona.menuEspecial || ''}
                  onChange={e => actualizarPersona(persona.id, 'menuEspecial', e.target.value)}
                  required
                  onInvalid={e => e.target.setCustomValidity('Por favor seleccione una opción de menú especial.')}
                  disabled={guardando || !edicionHabilitada}
                >
                  <option value="Ninguno">Ninguno</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Vegano">Vegano</option>
                  <option value="Sin gluten">Sin gluten</option>
                  <option value="Sin Lactosa">Sin Lactosa</option>
                </select>
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <button
              type="button"
              className="btn-secundario"
              onClick={agregarPersona}
              disabled={guardando || !edicionHabilitada}
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


        <div className="formulario-acciones">
          <button
            type="submit"
            className="btn-primario"
            disabled={guardando || !edicionHabilitada}
          >
            {guardando ? '⏳ Guardando...' : '✅ Guardar Formulario'}
          </button>
          <button
            type="button"
            className="btn-secundario"
            onClick={onCancel}
            style={{ marginLeft: '1rem' }}
          >
            ← Volver
          </button>
        </div>
      </form>

      {configProveedorSinHotel?.notafin && (
        <div className="nota-fin-formulario" style={{ margin: '12px 0', color: '#453796', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: configProveedorSinHotel.notafin }} />
      )}
      <small>
        Solo puedes elegir entre {minFecha} y {maxFecha}
      </small>
    </div>
  );
}

export default FormularioProveedorSinHotel;

