import { useEffect, useState } from 'react';
import { matchSorter } from 'match-sorter';
import { FirebaseService } from '../../services/FirebaseService';
import './FormularioBase.css';
import { useEventoDestacado } from "../../context/EventoDestacadoContext";


function FormularioSocio({ user, evento, onSubmit, onCancel }) {
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

  // Estado para controlar si se está guardando el formulario
  const [guardando, setGuardando] = useState(false);

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
    noches: 0,
    comparteHabitacion: false, // Por defecto false
    comparteCon: ''
  }]);

  const [comentarios, setComentarios] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [eventosLoading, setEventosLoading] = useState(true);
  const [configProveedorConHotel, setConfigProveedorConHotel] = useState(null);
  const [formularioExistente, setFormularioExistente] = useState(null);
  const [edicionHabilitada, setEdicionHabilitada] = useState(true);
  const [configSocio, setConfigSocio] = useState(null);

  // Al montar, buscar si ya existe formulario para este usuario y evento
  useEffect(() => {
    const cargarFormularioExistente = async () => {
      const emailParaBuscar = rolUsuario === 'admin' && usuarioSeleccionado?.email ? usuarioSeleccionado.email : user?.email;
      if (!eventoSeleccionado || !emailParaBuscar) return;
      const existente = await FirebaseService.obtenerFormularioSocioPorUsuarioYEvento(emailParaBuscar, eventoSeleccionado);
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
          comparteHabitacion: false, // Por defecto false
          comparteCon: ''
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
      console.log("Evento aún no está disponible");
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
      acompanantes: 0,
      comparteHabitacion: false, // Por defecto false
      comparteCon: '',
      comentario: '' // Asegura que el campo comentario también esté presente
    };
    setPersonas([...personas, nuevaPersona]);
  };

  const eliminarPersona = (id) => {
    if (personas.length > 1) {
      setPersonas(personas.filter(persona => persona.id !== id));
    }
  };

  const actualizarPersona = (id, campo, valor) => {
    setPersonas(personas.map(persona => {
      if (persona.id !== id) return persona;
      let nuevaPersona = { ...persona };
      if (campo === null && typeof valor === 'object' && valor !== null) {
        nuevaPersona = { ...nuevaPersona, ...valor };
      } else {
        nuevaPersona = { ...nuevaPersona, [campo]: valor };
      }
      // Si se cambia la fecha de llegada o salida, recalcular noches
      if (
        campo === 'fechaLlegada' || campo === 'fechaSalida' ||
        (campo === null && (valor.fechaLlegada !== undefined || valor.fechaSalida !== undefined))
      ) {
        const fechaLlegada = nuevaPersona.fechaLlegada;
        const fechaSalida = nuevaPersona.fechaSalida;
        let noches = 0;
        if (fechaLlegada && fechaSalida) {
          const llegada = new Date(fechaLlegada + 'T00:00:00');
          const salida = new Date(fechaSalida + 'T00:00:00');
          noches = Math.max(1, Math.round((salida - llegada) / (1000 * 60 * 60 * 24)));
          // Sumar una noche extra si la hora de salida es > 10:00 y la fecha de salida es mayor a la de llegada
          if (
            nuevaPersona.horaSalida &&
            nuevaPersona.horaSalida > '10:00' &&
            fechaSalida > fechaLlegada
          ) {
            noches += 1;
          }
          // Si no hay horaSalida, setear por defecto '10:00'
          if (!nuevaPersona.horaSalida) {
            nuevaPersona.horaSalida = '10:00';
          }
        }
        nuevaPersona.noches = noches;
      }
      return nuevaPersona;
    }));
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
        let horaSalida = persona.horaSalida;
        if (persona.fechaLlegada && persona.fechaSalida) {
          const fechaLlegada = new Date(persona.fechaLlegada + 'T00:00:00');
          const fechaSalida = new Date(persona.fechaSalida + 'T00:00:00');
          noches = Math.max(1, Math.round((fechaSalida - fechaLlegada) / (1000 * 60 * 60 * 24)));
          if (
            persona.horaSalida &&
            persona.horaSalida > '10:00' &&
            persona.fechaSalida > persona.fechaLlegada
          ) {
            noches += 1;
          }
          if (!horaSalida) {
            horaSalida = '10:00';
          }
        }
        // Asegurar que menuEspecial siempre tenga valor
        const menuEspecial = persona.menuEspecial ? persona.menuEspecial : 'Ninguno';
        return { ...persona, noches, horaSalida, comparteCon: persona.comparteCon || null, menuEspecial };
      });
      // 3. Guardar cantidad_personas en datosEmpresa
      const datosEmpresaActualizados = {
        ...datosEmpresa,
        cantidad_personas: cantidadPersonas
      };
      const emailParaGuardar = rolUsuario === 'admin' && usuarioSeleccionado?.email ? usuarioSeleccionado.email : user.email;
      const formularioData = {
        tipo: 'socio',
        eventoId: eventoSeleccionado,
        datosEmpresa: datosEmpresaActualizados,
        personas: personasActualizadas,
        comentarios,
        fechaEnvio: new Date().toISOString(),
        usuarioCreador: emailParaGuardar.toLowerCase().trim()
      };
      let idFormularioExistente = formularioExistente?.id;
      // Si existe, actualizar, si no, crear nuevo
      if (idFormularioExistente) {
        // Actualizar el documento existente
        await FirebaseService.actualizarFormulario('formularios', idFormularioExistente, formularioData);
        alert('✅ Formulario de Socio actualizado exitosamente!');
      } else {
        await FirebaseService.guardarFormularioSocio(formularioData);
        alert('✅ Formulario de Socio guardado exitosamente!');
      }
      // 🔄 Volver a consultar el formulario guardado
      const existente = await FirebaseService.obtenerFormularioSocioPorUsuarioYEvento(
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
    const cargarConfigSocio = async () => {
      try {
        const config = await FirebaseService.obtenerConfiguracionFormularioSocio();
        setConfigSocio(config);
      } catch (error) {
        console.error("Error cargando configuración de socio:", error);
      }
    };
    cargarConfigSocio();
  }, []);

  const onFormularioSocio = (evento) => {
    // lógica para mostrar el formulario de socio
};

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
        <h2>📝 Formulario Socio</h2>
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
        {configSocio?.imageninicio && (
          <div style={{ margin: '12px 0' }}>
            <img
              src={configSocio.imageninicio}
              alt="Imagen de inicio"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: 180, display: 'block',  objectFit: 'cover',
                    borderRadius: '12px' }}
            />
          </div>
        )}

        {/* Nota de inicio */}
        {configSocio?.notainicio && (
          <div className="nota-inicio-formulario" dangerouslySetInnerHTML={{ __html: configSocio.notainicio }} />
        )}

        {/* Sección Selección de Evento - Color Amarillo */}
        {eventosLoading ? (
          <div style={{ marginBottom: 24 }}>Cargando eventos...</div>
        ) : (
          <div className="seccion-formulario" >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              📅 Evento seleccionado <span style={{ color: 'red' }}>*</span>
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
                   // Si el campo está vacío, precompletar con 'www.'
                   if (valor === '') {
                     valor = 'www.';
                   }
                   // Si el usuario escribe 'http://' o 'https://', eliminarlo
                   valor = valor.replace(/^https?:\/\//, '');
                   // Si no empieza con 'www.', agregarlo
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
          {/* Resumen de personas */}
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
            <span style={{ fontSize: '0.92em' }}>👥 Personas registradas: <b>{personas.length}</b></span>
            <span style={{ fontSize: '0.68em', color: '#333', marginLeft: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100%' }}>
              {personas.map((p, i) => `${p.nombre} ${p.apellido}`.trim()).filter(n => n !== '').join(', ')}
            </span>
            <span style={{ fontSize: '0.92em' }}>🛏️ Total noches tomadas: <b>{personas.reduce((acc, p) => acc + (p.noches || 0), 0)}</b></span>
            <span style={{ fontSize: '0.92em' }}>🏨 Habitaciones tomadas: <b>{(() => {
              // Contar habitaciones únicas: cada persona con tipoHabitacion doble/matrimonial y que NO comparte, o solo una vez por pareja que comparte
              const habitaciones = new Set();
              personas.forEach(p => {
                if (p.tipoHabitacion === 'doble' || p.tipoHabitacion === 'matrimonial') {
                  if (p.comparteHabitacion && p.comparteCon) {
                    // Usar un id único para la pareja (menor id primero)
                    const ids = [p.id, Number(p.comparteCon)].sort((a, b) => a - b).join('-');
                    habitaciones.add(ids);
                  } else if (!personas.some(o => o.comparteHabitacion && Number(o.comparteCon) === p.id)) {
                    // Solo agregar si no es el "compañero" de otra persona (evita doble conteo)
                    habitaciones.add(String(p.id));
                  }
                }
              });
              return habitaciones.size;
            })()}</b></span>
          </div>
        {/* Tabla resumen de personas */}
        <div style={{ margin: '1.5rem 0', overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', background: '#f8fafc', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#e3f2fd', color: '#1976d2' }}>
                <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Nombre</th>
                <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Tipo Habitación</th>
                <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Comparte con</th>
                <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Fecha Llegada</th>
                <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Fecha Salida</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{`${p.nombre} ${p.apellido}`.trim()}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{p.tipoHabitacion ? (p.tipoHabitacion.charAt(0).toUpperCase() + p.tipoHabitacion.slice(1)) : ''}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{p.comparteHabitacion && p.comparteCon ? (() => {
                    const comp = personas.find(o => String(o.id) === String(p.comparteCon));
                    return comp ? `${comp.nombre} ${comp.apellido}`.trim() : '';
                  })() : ''}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{p.fechaLlegada ? p.fechaLlegada.split('-').reverse().join('/') : ''}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{p.fechaSalida ? p.fechaSalida.split('-').reverse().join('/') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        <div style={{ marginTop: 16, background: '#fffbe6', borderRadius: 6, padding: '0.75rem 1rem', border: '1px solid #ffe066', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--color-naranja)', fontWeight: 'bold', fontSize: '1rem' }}>Nota:</span>
          <span style={{ color: '#453796', fontSize: '0.7em' }}>recuerde que solo tiene una habitación sin cargo.</span>
        </div>
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

              {/* Información de Hotel */}
              <div>
                <h5 style={{ 
                  marginTop: '0', 
                  marginBottom: '1rem',
                  fontSize: '1.2rem'
                }}>
                  🏨 Información de Alojamiento
                </h5>
                {/* Mostrar noches y días tomados */}
                {(persona.fechaLlegada && persona.fechaSalida) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    marginBottom: 12
                  }}>
                    <div style={{ fontWeight: 600, color: '#1976d2', fontSize: '1.05rem' }}>
                      Noches tomadas: {persona.noches || 0}
                    </div>
                    <div style={{ fontWeight: 500, color: '#424242', fontSize: '0.98rem' }}>
                      Días tomados: {(() => {
                        // Calcular días tomados (array de fechas)
                        const llegada = new Date(persona.fechaLlegada + 'T00:00:00');
                        const salida = new Date(persona.fechaSalida + 'T00:00:00');
                        let dias = [];
                        let d = new Date(llegada);
                        // Si noches=0, no mostrar nada
                        if (!persona.noches || isNaN(llegada) || isNaN(salida)) return '-';
                        // Si noches=1, solo el día de llegada
                        if (persona.noches === 1) {
                          dias.push(llegada.toLocaleDateString('es-AR'));
                        } else {
                          for (let i = 0; i < persona.noches; i++) {
                            dias.push(new Date(d).toLocaleDateString('es-AR'));
                            d.setDate(d.getDate() + 1);
                          }
                        }
                        return dias.join(', ');
                      })()}
                    </div>
                  </div>
                )}
                <div className="campo-grupo">
                  <label>Tipo de Habitación:</label>
                  <select
                    value={String(persona.tipoHabitacion || '')}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === 'no-requiere') {
                        actualizarPersona(persona.id, null, {
                          tipoHabitacion: value,
                          fechaLlegada: '',
                          horaLlegada: '',
                          fechaSalida: '',
                          comparteCon: '',
                          comparteHabitacion: false
                        });
                      } else {
                        actualizarPersona(persona.id, 'tipoHabitacion', value);
                      }
                    }}
                    required={edicionHabilitada}
                    onInvalid={e => e.target.setCustomValidity('Por favor ingrese el tipo de habitación.')}
                    onInput={e => e.target.setCustomValidity('')}
                  >
                    <option value="">-- Seleccione --</option>
                    <option value="doble">Doble</option>
                    <option value="matrimonial">Single (Matrimonial)</option>
                    <option value="no-requiere">No requiere</option>
                  </select>
                </div>
                {/* Nuevo: ¿Comparte habitación? y Comparte con en la misma línea */}
                {(persona.tipoHabitacion === 'doble' || persona.tipoHabitacion === 'matrimonial') && (
                  <div className="campo-fila">
                    <div className="campo-grupo" style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <input
                          type="checkbox"
                          checked={!!persona.comparteHabitacion}
                          onChange={e => {
                            const checked = e.target.checked;
                            if (!checked) {
                              actualizarPersona(persona.id, null, {comparteHabitacion: false, comparteCon: ''});
                            } else {
                              actualizarPersona(persona.id, 'comparteHabitacion', true);
                            }
                          }}
                          disabled={guardando || !edicionHabilitada}
                          style={{ marginRight: 8 }}
                        />
                        ¿Comparte habitación?
                      </label>
                    </div>
                    <div className="campo-grupo" style={{ flex: 2, minWidth: 220 }}>
                      <label>Comparte habitación con:</label>
                      <select
                        value={persona.comparteCon || ''}
                        onChange={e => actualizarPersona(persona.id, 'comparteCon', e.target.value)}
                        required={!!persona.comparteHabitacion}
                        onInvalid={e => {
                          if (persona.comparteHabitacion) {
                            e.target.setCustomValidity('Por favor seleccione con quién comparte la habitación.');
                          }
                        }}
                        onInput={e => e.target.setCustomValidity('')}
                        disabled={guardando || !edicionHabilitada || !persona.comparteHabitacion}
                        style={!persona.comparteHabitacion ? { background: '#eee', color: '#888' } : {}}
                      >
                        <option value="">-- Seleccione --</option>
                        {personas.filter(p => p.id !== persona.id).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {/* Campo Comentario */}
                <div className="campo-grupo">
                  <label>Comentario sobre tipo de habitación seleccionada:</label>
                  <input
                    type="text"
                    value={persona.comentario || ''}
                    onChange={e => actualizarPersona(persona.id, 'comentario', e.target.value)}
                    placeholder="Ej: Indique cualquier observación sobre la habitación seleccionada (opcional)"
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
                      required={persona.tipoHabitacion !== 'no-requiere'}
                      onInvalid={e => {
                        if (persona.tipoHabitacion !== 'no-requiere') {
                          e.target.setCustomValidity('Por favor indique la fecha de llegada al hotel.');
                        }
                      }}
                      onInput={e => e.target.setCustomValidity('')}
                      disabled={guardando || !edicionHabilitada || persona.tipoHabitacion === 'no-requiere'}
                    >
                      <option value="">-- Seleccione --</option>
                      {(() => {
                        // Lógica robusta UTC/context igual que en ProveedorConHotel
                        function parseFecha(fecha) {
                          if (!fecha) return null;
                          if (fecha instanceof Date) return fecha;
                          if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
                            return new Date(fecha);
                          }
                          return null;
                        }
                        function toUTCDate(fecha) {
                          if (!fecha) return null;
                          if (typeof fecha === 'string') {
                            return new Date(fecha + 'T00:00:00Z');
                          }
                          const iso = fecha.toISOString().slice(0, 10);
                          return new Date(iso + 'T00:00:00Z');
                        }
                        const desde = parseFecha(eventoContext?.fechaDesde);
                        const hasta = parseFecha(eventoContext?.fechaHasta);
                        if (!desde || !hasta) return null;
                        const dias = [];
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
                      onInvalid={e => {
                        if (persona.tipoHabitacion !== 'no-requiere') {
                          e.target.setCustomValidity('Por favor indique la hora de llegada al hotel.');
                        }
                      }}
                      onInput={e => e.target.setCustomValidity('')}
                      required={persona.tipoHabitacion !== 'no-requiere'}
                      disabled={guardando || !edicionHabilitada || persona.tipoHabitacion === 'no-requiere'}
                    />
                  </div>
                </div>
                
                <div className="campo-fila">
                  <div className="campo-grupo">
                    <label>Fecha de Salida:</label>
                    <select
                      value={persona.fechaSalida}
                      onChange={e => actualizarPersona(persona.id, 'fechaSalida', e.target.value)}
                      required={persona.tipoHabitacion !== 'no-requiere'}
                      onInvalid={e => {
                        if (persona.tipoHabitacion !== 'no-requiere') {
                          e.target.setCustomValidity('Por favor indique la fecha de salida al hotel.');
                        }
                      }}
                      onInput={e => e.target.setCustomValidity('')}
                      disabled={guardando || !edicionHabilitada || persona.tipoHabitacion === 'no-requiere'}
                    >
                      <option value="">-- Seleccione --</option>
                      {(() => {
                        function parseFecha(fecha) {
                          if (!fecha) return null;
                          if (fecha instanceof Date) return fecha;
                          if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
                            return new Date(fecha);
                          }
                          return null;
                        }
                        function toUTCDate(fecha) {
                          if (!fecha) return null;
                          if (typeof fecha === 'string') {
                            return new Date(fecha + 'T00:00:00Z');
                          }
                          const iso = fecha.toISOString().slice(0, 10);
                          return new Date(iso + 'T00:00:00Z');
                        }
                        const desde = parseFecha(eventoContext?.fechaDesde);
                        const hasta = parseFecha(eventoContext?.fechaHasta);
                        if (!desde || !hasta) return null;
                        const dias = [];
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
                      required={persona.tipoHabitacion !== 'no-requiere'}
                      disabled={guardando || !edicionHabilitada || persona.tipoHabitacion === 'no-requiere'}
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

      {configSocio?.notafin && (
        <div className="nota-fin-formulario" style={{ margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: configSocio.notafin }} />
      )}
     
    </div>
  );
}

export default FormularioSocio;

