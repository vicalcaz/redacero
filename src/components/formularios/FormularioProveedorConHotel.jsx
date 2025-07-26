// Utilidad robusta para parsear fechas tipo 'YYYY-MM-DD' o Date
function parseFecha(fecha) {
  if (!fecha) return null;
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    return new Date(fecha);
  }
  return null;
}
import { useEffect, useState } from 'react';
import { matchSorter } from 'match-sorter';
import { FirebaseService } from '../../services/FirebaseService';
import './FormularioBase.css';
import { useEventoDestacado } from "../../context/EventoDestacadoContext";


function FormularioProveedorConHotel({ user, evento, onSubmit, onCancel }) {
  const { rolUsuario, eventoId, evento: eventoContext, setEvento } = useEventoDestacado();

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
    fechaLlegada: '',
    horaLlegada: '',
    fechaSalida: '',
    horaSalida: '',
    lunes: '',
    martes: '',
    miercoles: '',
    asisteCena: '',
    menuEspecial: '',
    atiendeReuniones: '',
    tipoHabitacion: '',
    noches: 0
  }]);

  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [eventosLoading, setEventosLoading] = useState(true);
  const [configProveedorConHotel, setConfigProveedorConHotel] = useState(null);
  const [formularioExistente, setFormularioExistente] = useState(null);
  const [edicionHabilitada, setEdicionHabilitada] = useState(true);

// ...existing code...

  // Cargar configuración de formulario proveedor-con-hotel (imageninicio, notainicio, notafin)
  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const config = await FirebaseService.obtenerConfiguracionFormularioProveedorConHotel();
        setConfigProveedorConHotel(config);
      } catch (error) {
        console.error("Error cargando configuración proveedor con hotel:", error);
      }
    };
    cargarConfig();
  }, []);
// ...existing code...

  // Al montar, buscar si ya existe formulario para este usuario y evento
  useEffect(() => {
    const cargarFormularioExistente = async () => {
      const emailParaBuscar = rolUsuario === 'admin' && usuarioSeleccionado?.email ? usuarioSeleccionado.email : user?.email;
      if (!eventoSeleccionado || !emailParaBuscar) return;
      const existente = await FirebaseService.obtenerFormularioProveedorConHotelPorUsuarioYEvento(emailParaBuscar, eventoSeleccionado);
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
          fechaLlegada: '',
          horaLlegada: '',
          fechaSalida: '',
          horaSalida: '',
          lunes: '',
          martes: '',
          miercoles: '',
          asisteCena: '',
          menuEspecial: '',
          atiendeReuniones: '',
          tipoHabitacion: '',
          noches: 0,
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
      fechaLlegada: '',
      horaLlegada: '',
      fechaSalida: '',
      horaSalida: '',
      lunes: '',
      martes: '',
      miercoles: '',
      asisteCena: '',
      menuEspecial: '',
      atiendeReuniones: '',
      tipoHabitacion: '',
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
      // 1. Calcular cantidad de personas
      const cantidadPersonas = personas.length;
      // 2. Calcular noches para cada persona
      const personasActualizadas = personas.map(persona => {
        let noches = 0;
        if (persona.fechaLlegada && persona.fechaSalida) {
          const fechaLlegada = new Date(persona.fechaLlegada);
          const fechaSalida = new Date(persona.fechaSalida);
          noches = Math.max(1, Math.round((fechaSalida - fechaLlegada) / (1000 * 60 * 60 * 24)));
        }
        return { ...persona, noches };
      });
      // 3. Guardar cantidad_personas en datosEmpresa
      const datosEmpresaActualizados = {
        ...datosEmpresa,
        cantidad_personas: cantidadPersonas
      };
      const emailParaGuardar = rolUsuario === 'admin' && usuarioSeleccionado?.email ? usuarioSeleccionado.email : user.email;
      const formularioData = {
        tipo: 'Proveedor-con-hotel',
        eventoId: eventoSeleccionado,
        datosEmpresa: datosEmpresaActualizados,
        personas: personasActualizadas,
        comentarios,
        fechaEnvio: new Date().toISOString(),
        usuarioCreador: emailParaGuardar.toLowerCase().trim()
      };
      let idFormularioExistente = formularioExistente?.id;
      if (idFormularioExistente) {
        await FirebaseService.actualizarFormulario('formularios-proveedores', idFormularioExistente, formularioData);
        alert('✅ Formulario de Proveedor actualizado exitosamente!');
      } else {
        await FirebaseService.guardarFormularioProveedorConHotel(formularioData);
        alert('✅ Formulario de Proveedor guardado exitosamente!');
      }
      // 🔄 Volver a consultar el formulario guardado
      const existente = await FirebaseService.obtenerFormularioProveedorConHotelPorUsuarioYEvento(
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

  const minFecha = addDays(eventoContext?.fechaDesde, -2);
  const maxFecha = addDays(eventoContext?.fechaHasta, 2);

  useEffect(() => {
    if (!eventoSeleccionado || eventos.length === 0) return;
    const ev = eventos.find(e => e.id === eventoSeleccionado);
    if (ev && typeof setEvento === "function") {
      setEvento(ev);
    }
  }, [eventoSeleccionado, eventos, setEvento]);

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
        <h2>📝 Formulario Proveedor</h2>
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
        {configProveedorConHotel?.imageninicio && (
          <div style={{ margin: '12px 0' }}>
            <img
              src={configProveedorConHotel.imageninicio}
              alt="Imagen de inicio"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: 180, display: 'block',  objectFit: 'cover',
                    borderRadius: '12px' }}
            />
          </div>
        )}

        {/* Nota de inicio */}
        {configProveedorConHotel?.notainicio && (
          <div className="nota-inicio-formulario" dangerouslySetInnerHTML={{ __html: configProveedorConHotel.notainicio }} />
        )}

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
              <option value="">-- Evento seleccionado --</option>
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
                    onChange={e => actualizarPersona(persona.id, 'telefono', e.target.value)}
                    placeholder="Teléfono fijo"
                    onInvalid={e => e.target.setCustomValidity('Por favor ingrese el teléfono fijo.')}
                    onInput={e => e.target.setCustomValidity('')}
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
                  disabled={guardando || !edicionHabilitada}
                >
                  <option value="">-- Seleccione --</option>
                  <option value="doble">Doble</option>
                  <option value="matrimonial">single (Matrimonial)</option>
                  </select> 
                </div>
                {/* Campo Comentario */}
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
                    disabled={guardando || !edicionHabilitada}
                  />
                </div>

                {/* Fechas y Horas */}
                <div className="campo-fila">
                  <div className="campo-grupo">
                    <label>Fecha de Llegada:</label>
                    <select
                      value={persona.fechaLlegada}
                      onChange={e => actualizarPersona(persona.id, 'fechaLlegada', e.target.value)}
                      required
                      onInvalid={e => e.target.setCustomValidity('Por favor indique la fecha de llegada al hotel.')}
                      onInput={e => e.target.setCustomValidity('')}
                      disabled={guardando || !edicionHabilitada}
                    >
                      <option value="">-- Seleccione --</option>
                      {(() => {
                        const desde = parseFecha(eventoContext?.fechaDesde);
                        const hasta = parseFecha(eventoContext?.fechaHasta);
                        if (!desde || !hasta) return null;
                        const dias = [];
                        // Convertir fecha a string UTC (YYYY-MM-DD) y crear Date con 'T00:00:00Z'
                        function toUTCDate(fecha) {
                          if (!fecha) return null;
                          if (typeof fecha === 'string') {
                            return new Date(fecha + 'T00:00:00Z');
                          }
                          // Si ya es Date, formatear a ISO y volver a crear en UTC
                          const iso = fecha.toISOString().slice(0, 10);
                          return new Date(iso + 'T00:00:00Z');
                        }
                        let d = toUTCDate(eventoContext?.fechaDesde);
                        const hastaUTC = toUTCDate(eventoContext?.fechaHasta);
                        while (d && hastaUTC && d <= hastaUTC) {
                          const yyyy = d.getUTCFullYear();
                          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                          const dd_ = String(d.getUTCDate()).padStart(2, '0');
                          const fechaStr = `${yyyy}-${mm}-${dd_}`;
                          const fechaFormateada = `${dd_}/${mm}/${yyyy}`;
                          const diaSemana = d.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' });
                          dias.push(
                            <option key={fechaStr} value={fechaStr}>
                              {fechaFormateada} ({diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)})
                            </option>
                          );
                          d.setUTCDate(d.getUTCDate() + 1);
                        }
                        return dias;
                      })()}
                    </select>
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
                      disabled={guardando || !edicionHabilitada}
                    />
                  </div>
                </div>
                
                <div className="campo-fila">
                  <div className="campo-grupo">
                    <label>Fecha de Salida:</label>
                    <select
                      value={persona.fechaSalida}
                      onChange={e => actualizarPersona(persona.id, 'fechaSalida', e.target.value)}
                      required
                      onInvalid={e => e.target.setCustomValidity('Por favor indique la fecha de salida al hotel.')}
                      onInput={e => e.target.setCustomValidity('')}
                      disabled={guardando || !edicionHabilitada}
                    >
                      <option value="">-- Seleccione --</option>
                      {(() => {
                        const desde = parseFecha(eventoContext?.fechaDesde);
                        const hasta = parseFecha(eventoContext?.fechaHasta);
                        if (!desde || !hasta) return null;
                        const dias = [];
                        // Convertir fecha a string UTC (YYYY-MM-DD) y crear Date con 'T00:00:00Z'
                        function toUTCDate(fecha) {
                          if (!fecha) return null;
                          if (typeof fecha === 'string') {
                            return new Date(fecha + 'T00:00:00Z');
                          }
                          const iso = fecha.toISOString().slice(0, 10);
                          return new Date(iso + 'T00:00:00Z');
                        }
                        let d = toUTCDate(eventoContext?.fechaDesde);
                        if (d) d.setUTCDate(d.getUTCDate() + 1); // salida es al menos un día después de llegada
                        const hastaSalida = toUTCDate(eventoContext?.fechaHasta);
                        if (hastaSalida) hastaSalida.setUTCDate(hastaSalida.getUTCDate() + 1); // salida puede ser hasta un día después del fin
                        while (d && hastaSalida && d <= hastaSalida) {
                          const yyyy = d.getUTCFullYear();
                          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                          const dd_ = String(d.getUTCDate()).padStart(2, '0');
                          const fechaStr = `${yyyy}-${mm}-${dd_}`;
                          const fechaFormateada = `${dd_}/${mm}/${yyyy}`;
                          const diaSemana = d.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' });
                          dias.push(
                            <option key={fechaStr} value={fechaStr}>
                              {fechaFormateada} ({diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)})
                            </option>
                          );
                          d.setUTCDate(d.getUTCDate() + 1);
                        }
                        return dias;
                      })()}
                    </select>
                  </div>
                  <div className="campo-grupo">
                    <label>Hora de Salida:</label>
                    <input
                      type="time"
                      value="10:00"
                      readOnly
                      disabled
                      required
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
                <input
                  type="text"
                  value={persona.menuEspecial}
                  onChange={(e) => actualizarPersona(persona.id, 'menuEspecial', e.target.value)}
                  placeholder="Vegetariano, sin gluten, etc. (Ingrese No si no requiere)"
                  required
                  onInvalid={e => e.target.setCustomValidity('Por favor indique si requiere un menú especial, por lo contrario escriba "No".')}
                  disabled={guardando || !edicionHabilitada}
                />
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

      {configProveedorConHotel?.notafin && (
        <div className="nota-fin-formulario" style={{ margin: '12px 0', color: '#453796', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: configProveedorConHotel.notafin }} />
      )}
      <small>
        Solo puedes elegir entre {minFecha} y {maxFecha}
      </small>
    </div>
  );
}

export default FormularioProveedorConHotel;


