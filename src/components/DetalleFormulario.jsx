import { useState, useEffect } from 'react';
import './DetalleFormulario.css';

function DetalleFormulario({ formulario, modoEdicion, onCerrar, onGuardar, puedeEditar }) {
  const [formularioEditado, setFormularioEditado] = useState(formulario);
  const [editandoActivo, setEditandoActivo] = useState(modoEdicion);

  useEffect(() => {
    setFormularioEditado(formulario);
    setEditandoActivo(modoEdicion);
  }, [formulario, modoEdicion]);

  const actualizarDatosEmpresa = (campo, valor) => {
    setFormularioEditado({
      ...formularioEditado,
      datosEmpresa: {
        ...formularioEditado.datosEmpresa,
        [campo]: valor
      }
    });
  };

  const actualizarPersona = (index, campo, valor) => {
    const personasActualizadas = [...formularioEditado.personas];
    personasActualizadas[index] = {
      ...personasActualizadas[index],
      [campo]: valor
    };
    setFormularioEditado({
      ...formularioEditado,
      personas: personasActualizadas
    });
  };

  const actualizarComentarios = (valor) => {
    setFormularioEditado({
      ...formularioEditado,
      comentarios: valor
    });
  };

  const handleGuardar = () => {
    onGuardar(formularioEditado);
  };

  const activarEdicion = () => {
    setEditandoActivo(true);
  };

  const cancelarEdicion = () => {
    setFormularioEditado(formulario); // Restaurar datos originales
    setEditandoActivo(false);
  };

  const handleFormularioSocio = (evento) => {
    // lógica para mostrar el formulario de socio
  };

  return (
    <div className="modal-overlay">
      <div className="modal-detalle">
        <div className="modal-header">
          <h3>
            {editandoActivo ? 'Editar' : 'Ver'} Formulario - {formulario.tipo}
          </h3>
          <button className="btn-cerrar" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-content">
          <div className="info-general">
            <div className="info-item">
              {/* Remove duplicated Editar/Cerrar buttons here */}
            </div>
            <div className="form-group">
              <label>Empresa:</label>
              {editandoActivo ? (
                <input
                  type="text"
                  value={formularioEditado.datosEmpresa?.empresa || ''}
                  onChange={e => actualizarDatosEmpresa('empresa', e.target.value)}
                />
              ) : (
                <span>{formulario.datosEmpresa?.empresa || 'N/A'}</span>
              )}
            </div>
            <div className="form-group">
              <label>Dirección:</label>
              {editandoActivo ? (
                <input
                  type="text"
                  value={formularioEditado.datosEmpresa?.direccion || ''}
                  onChange={e => actualizarDatosEmpresa('direccion', e.target.value)}
                />
              ) : (
                <span>{formulario.datosEmpresa?.direccion || 'N/A'}</span>
              )}
            </div>

            <div className="form-group">
              <label>Ciudad:</label>
              {editandoActivo ? (
                <input
                  type="text"
                  value={formularioEditado.datosEmpresa?.ciudad || ''}
                  onChange={(e) => actualizarDatosEmpresa('ciudad', e.target.value)}
                />
              ) : (
                <span>{formulario.datosEmpresa?.ciudad || 'N/A'}</span>
              )}
            </div>
            <div className="form-group">
              <label>Página Web:</label>
              {editandoActivo ? (
                <input
                  type="url"
                  value={formularioEditado.datosEmpresa?.paginaWeb || ''}
                  onChange={(e) => actualizarDatosEmpresa('paginaWeb', e.target.value)}
                />
              ) : (
                <span>{formulario.datosEmpresa?.paginaWeb || 'N/A'}</span>
              )}
            </div>
            <div className="form-group">
              <label>Rubro:</label>
              {editandoActivo ? (
                <input
                  type="text"
                  value={formularioEditado.datosEmpresa?.rubro || ''}
                  onChange={(e) => actualizarDatosEmpresa('rubro', e.target.value)}
                />
              ) : (
                <span>{formulario.datosEmpresa?.rubro || 'N/A'}</span>
              )}
            </div>
          </div>

          <div className="seccion">
            <h4>Personas ({formulario.personas?.length || 0})</h4>
            {/* TABLA DE PERSONAS CON SCROLL HORIZONTAL */}
            <div className="tabla-personas-wrapper">
              <table className="tabla-personas-resumen">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th classname="camposlargos"> Cargo</th>
                    <th classname="camposlargos"> Email</th>
                    <th>Teléfono</th>
                    <th>DNI</th>
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Fecha llegada</th>}
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Hora llegada</th>}
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Fecha salida</th>}
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Hora salida</th>}
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Tipo Habitación</th>}
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Comparte con</th>}
                    {formulario.tipo !== 'proveedor-sin-hotel' && <th>Noches</th>}
                    <th className="lunes"> Asiste cena</th>
                    <th className="lunes">Atiende reuniones</th>
                    <th className="lunes"> Menú especial</th>
                    <th className="lunes">Lunes</th>
                    <th className="martes">Martes</th>
                    <th className="miercoles">Miércoles</th>
                    {/* Agrega más columnas si lo necesitas */}
                  </tr>
                </thead>
                <tbody>
                  {(editandoActivo ? formularioEditado.personas : formulario.personas)?.map((p, i, arr) => {
                    // --- INICIO: Colores para parejas que comparten habitación ---
                    // Creamos un mapa para asignar un color único a cada pareja
                    if (!window._parejaColorMap) window._parejaColorMap = {};
                    const pastel = [
                      '#ffe0b2', '#b2dfdb', '#c5cae9', '#f8bbd0', '#dcedc8', '#fff9c4', '#b3e5fc', '#f0f4c3'
                    ];
                    let parejaKey = null;
                    let parejaColor = '';
                    if (p.comparteCon) {
                      // La clave de pareja es el id menor + '_' + id mayor (para que ambos tengan la misma)
                      const ids = [String(p.id), String(p.comparteCon)].sort();
                      parejaKey = ids.join('_');
                      if (!window._parejaColorMap[parejaKey]) {
                        // Asigna un color de la paleta
                        window._parejaColorMap[parejaKey] = pastel[Object.keys(window._parejaColorMap).length % pastel.length];
                      }
                      parejaColor = window._parejaColorMap[parejaKey];
                    }
                    // --- FIN: Colores para parejas que comparten habitación ---
                    return (
                      <tr key={i} style={parejaColor ? { background: parejaColor } : {}}>
                        <td>{i + 1}</td>
                        <td>{editandoActivo ? (<input type="text" value={p.nombre} onChange={e => actualizarPersona(i, 'nombre', e.target.value)} />) : p.nombre}</td>
                        <td>{editandoActivo ? (<input type="text" value={p.apellido} onChange={e => actualizarPersona(i, 'apellido', e.target.value)} />) : p.apellido}</td>
                        <td classname="camposlargos"> {editandoActivo ? (<input type="text" value={p.cargo} onChange={e => actualizarPersona(i, 'cargo', e.target.value)} />) : p.cargo}</td>
                        <td classname="camposlargos"> {editandoActivo ? (<input type="email" value={p.email} onChange={e => actualizarPersona(i, 'email', e.target.value)} />) : p.email}</td>
                        <td>{editandoActivo ? (<input type="tel" value={p.telefono} onChange={e => actualizarPersona(i, 'telefono', e.target.value)} />) : p.telefono}</td>
                        <td>{editandoActivo ? (<input type="text" value={p.dni} onChange={e => actualizarPersona(i, 'dni', e.target.value)} />) : p.dni}</td>
                        {formulario.tipo !== 'proveedor-sin-hotel' && (
                          <>
                            <td>{editandoActivo ? (<input type="date" value={p.fechaLlegada || ''} onChange={e => actualizarPersona(i, 'fechaLlegada', e.target.value)} />) : p.fechaLlegada}</td>
                            <td>{editandoActivo ? (<input type="time" value={p.horaLlegada || ''} onChange={e => actualizarPersona(i, 'horaLlegada', e.target.value)} />) : p.horaLlegada}</td>
                            <td>{editandoActivo ? (<input type="date" value={p.fechaSalida || ''} onChange={e => actualizarPersona(i, 'fechaSalida', e.target.value)} />) : p.fechaSalida}</td>
                            <td>{editandoActivo ? (<input type="time" value={p.horaSalida || ''} onChange={e => actualizarPersona(i, 'horaSalida', e.target.value)} />) : p.horaSalida}</td>
                            <td>{editandoActivo ? (
                              <select value={p.tipoHabitacion} onChange={e => actualizarPersona(i, 'tipoHabitacion', e.target.value)}>
                                <option value="">--</option>
                                <option value="doble">Doble</option>
                                <option value="matrimonial">Single (Matrimonial)</option>
                                <option value="no-requiere">No requiere</option>
                              </select>
                            ) : p.tipoHabitacion}</td>
                            {editandoActivo ? (
                              <input classname="si-no"
                                type="text"
                                value={p.comparteCon ? obtenerNombrePorId(p.comparteCon, formulario.personas) : ''}
                                onChange={e => {
                                  // Buscar si el valor coincide con algún nombre completo
                                  const valor = e.target.value;
                                  const personaSeleccionada = formulario.personas?.find(
                                    persona => `${persona.nombre} ${persona.apellido}`.toLowerCase() === valor.toLowerCase()
                                  );
                                  if (personaSeleccionada) {
                                    actualizarPersona(i, 'comparteCon', personaSeleccionada.id);
                                  } else {
                                    actualizarPersona(i, 'comparteCon', '');
                                  }
                                }}
                                placeholder="Nombre completo"
                                list={`personas-list-${i}`}
                                style={{ fontSize: '0.8em', height: '100%', boxSizing: 'border-box', width: '100%' }}
                              />
                            ) : (p.comparteCon ? obtenerNombrePorId(p.comparteCon, formulario.personas) : '')}
                            {editandoActivo && (
                              <datalist id={`personas-list-${i}`}>
                                {formulario.personas?.map((persona) => (
                                  <option key={persona.id} value={`${persona.nombre} ${persona.apellido}`}>{persona.nombre} {persona.apellido}</option>
                                ))}
                              </datalist>
                            )}
                            <td>{editandoActivo ? (<input type="number" value={p.noches || ''} onChange={e => actualizarPersona(i, 'noches', Number(e.target.value))} min={0} />) : p.noches}</td>
                          </>
                        )}
                        <td className="lunes">{editandoActivo ? (
                          <select className="si-no" value={p.asisteCena || ''} onChange={e => actualizarPersona(i, 'asisteCena', e.target.value)}>
                            <option value="">--</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        ) : (p.asisteCena === 'si' ? 'Sí' : p.asisteCena === 'no' ? 'No' : '--')}</td>
                        <td className="lunes"> {editandoActivo ? (
                          <select className="si-no" value={p.atiendeReuniones || ''} onChange={e => actualizarPersona(i, 'atendeReuniones', e.target.value)}>
                            <option value="">--</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        ) : (p.atiendeReuniones === 'si' ? 'Sí' : p.atiendeReuniones === 'no' ? 'No' : '--')}</td>
                        <td>{editandoActivo ? (<input type="text" value={p.menuEspecial || ''} onChange={e => actualizarPersona(i, 'menuEspecial', e.target.value)} />) : (p.menuEspecial || 'Ninguno')}</td>
                        <td className="lunes">{editandoActivo ? (
                          <select className="agenda-dia" value={p.lunes || ''} onChange={e => actualizarPersona(i, 'lunes', e.target.value)}>
                            <option value="">--</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        ) : (p.lunes === 'si' ? 'Sí' : p.lunes === 'no' ? 'No' : '--')}</td>
                        <td className="martes">{editandoActivo ? (
                          <select className="agenda-dia" value={p.martes || ''} onChange={e => actualizarPersona(i, 'martes', e.target.value)}>
                            <option value="">--</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        ) : (p.martes === 'si' ? 'Sí' : p.martes === 'no' ? 'No' : '--')}</td>
                        <td className="miercoles">{editandoActivo ? (
                          <select className="agenda-dia" value={p.miercoles || ''} onChange={e => actualizarPersona(i, 'miercoles', e.target.value)}>
                            <option value="">--</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        ) : (p.miercoles === 'si' ? 'Sí' : p.miercoles === 'no' ? 'No' : '--')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="seccion">
            <h4>Comentarios</h4>
            {editandoActivo ? (
              <textarea
                value={formularioEditado.comentarios || ''}
                onChange={(e) => actualizarComentarios(e.target.value)}
                placeholder="Comentarios adicionales..."
              />
            ) : (
              <p>{formulario.comentarios || 'Sin comentarios'}</p>
            )}
          </div>

<div className="detalle-formulario-resumen">
  <h2>Resumen del Formulario</h2>
  <div className="resumen-grid">
    <div>
      <strong>Empresa:</strong> {formulario.datosEmpresa?.empresa}
    </div>
    <div>
      <strong>Tipo:</strong> {formulario.tipo}
    </div>
    <div>
      <strong>Personas:</strong> {formulario.personas?.length}
    </div>
    <div>
      <strong>Usuario Creador:</strong> {formulario.usuarioCreador}
    </div>
    {/* Puedes agregar más campos clave aquí si lo deseas */}
  </div>
  <hr />
 <h3>Personas</h3>
  <div className="tabla-resumen-wrapper">
    <table className="tabla-personas-resumen">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Cargo</th>
          <th>Email</th>
          <th>Tipo Habitación</th>
          <th>Comparte con</th>
          <th>Fecha Llegada</th>
          <th>Fecha Salida</th>
          <th>Atiende reuniones</th> {/* <-- Agrega esta columna */}
          {/* ...otros campos si necesitas... */}
        </tr>
      </thead>
      <tbody>
        {formulario.personas?.map((p, i) => (
          <tr key={i}>
            <td>{p.nombre}</td>
            <td>{p.apellido}</td>
            <td>{p.cargo}</td>
            <td>{p.email}</td>
            <td>{p.tipoHabitacion}</td>
            <td>{p.comparteCon ? obtenerNombrePorId(p.comparteCon, formulario.personas) : ''}</td>
            <td>{p.fechaLlegada}</td>
            <td>{p.fechaSalida}</td>
            <td>
              {p.atendeReuniones === 'si'
                ? 'Sí'
                : p.atendeReuniones === 'no'
                ? 'No'
                : '--'}
            </td>
            {/* ... */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <hr />
  <div className="resumen-final">
    <strong>Total noches:</strong> {calcularNoches(formulario.personas)}
    <strong>Habitaciones tomadas:</strong> {calcularHabitaciones(formulario.personas).total}
    <div style={{ width: '100%' }}>
      <strong>Detalle habitaciones tomadas:</strong>
      <ul style={{ margin: '0.5em 0 0 1em', padding: 0 }}>
        {calcularHabitaciones(formulario.personas).detalle.map((h, idx) => (
          <li key={idx}>
            <span style={{ fontWeight: 500 }}>{h.personas}</span> — Tipo: <span style={{ fontStyle: 'italic' }}>{h.tipoHabitacion}</span> — Cantidad: {h.cantidad}
          </li>
        ))}
      </ul>
      <strong>Detalle noches por habitación:</strong>
      <ul style={{ margin: '0.5em 0 0 1em', padding: 0 }}>
        {obtenerNochesPorHabitacion(formulario.personas).map((h, idx) => (
          <li key={h.key || idx}>
            <span style={{ fontWeight: 500 }}>{h.nombres}:</span> {h.noches} noche{h.noches === 1 ? '' : 's'}
          </li>
        ))}
      </ul>
    </div>
    {/* ...otros totales/resúmenes... */}
  </div>
</div>
        </div>

        <div className="modal-footer">
          {editandoActivo ? (
            <>
              <button className="btn-success" onClick={handleGuardar}>
                Guardar Cambios
              </button>
              <button className="btn-secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-primary" 
                onClick={activarEdicion}
              >
                Editar
              </button>
              <button className="btn-secondary" onClick={onCerrar}>
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function obtenerNombrePorId(id, personas) {
  const persona = personas.find(p => String(p.id) === String(id));
  return persona ? `${persona.nombre} ${persona.apellido}` : '';
}

function calcularNoches(personas) {
  if (!Array.isArray(personas)) return 0;
  // Agrupar personas por habitación (parejaKey)
  const grupos = {};
  personas.forEach(p => {
    let key;
    if (p.comparteCon) {
      // La clave de pareja es el id menor + '_' + id mayor
      const ids = [String(p.id), String(p.comparteCon)].sort();
      key = ids.join('_');
    } else {
      key = String(p.id);
    }
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  });

  let totalNoches = 0;
  Object.values(grupos).forEach(grupo => {
    // Buscar la fecha mínima de entrada y máxima de salida en el grupo
    let minLlegada = null;
    let maxSalida = null;
    grupo.forEach(p => {
      if (p.fechaLlegada) {
        const llegada = new Date(p.fechaLlegada);
        if (!minLlegada || llegada < minLlegada) minLlegada = llegada;
      }
      if (p.fechaSalida) {
        const salida = new Date(p.fechaSalida);
        if (!maxSalida || salida > maxSalida) maxSalida = salida;
      }
    });
    if (minLlegada && maxSalida) {
      const diff = (maxSalida - minLlegada) / (1000 * 60 * 60 * 24);
      totalNoches += diff > 0 ? diff : 0;
    } else {
      // Si no hay fechas, sumar noches individuales si existen
      grupo.forEach(p => {
        if (typeof p.noches === 'number') totalNoches += p.noches;
      });
    }
  });
  return totalNoches;
}

// Devuelve un array con el detalle de noches por habitación
function obtenerNochesPorHabitacion(personas) {
  if (!Array.isArray(personas)) return [];
  const grupos = {};
  personas.forEach(p => {
    let key;
    if (p.comparteCon) {
      const ids = [String(p.id), String(p.comparteCon)].sort();
      key = ids.join('_');
    } else {
      key = String(p.id);
    }
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  });
  const detalles = [];
  Object.entries(grupos).forEach(([key, grupo]) => {
    let minLlegada = null;
    let maxSalida = null;
    grupo.forEach(p => {
      if (p.fechaLlegada) {
        const llegada = new Date(p.fechaLlegada);
        if (!minLlegada || llegada < minLlegada) minLlegada = llegada;
      }
      if (p.fechaSalida) {
        const salida = new Date(p.fechaSalida);
        if (!maxSalida || salida > maxSalida) maxSalida = salida;
      }
    });
    let noches = 0;
    if (minLlegada && maxSalida) {
      noches = (maxSalida - minLlegada) / (1000 * 60 * 60 * 24);
      noches = noches > 0 ? noches : 0;
    } else {
      grupo.forEach(p => {
        if (typeof p.noches === 'number') noches += p.noches;
      });
    }
    // Mostrar los nombres de las personas en la habitación
    const nombres = grupo.map(p => `${p.nombre} ${p.apellido}`).join(' y ');
    detalles.push({ key, nombres, noches });
  });
  return detalles;
}

function calcularHabitaciones(personas) {
  if (!Array.isArray(personas)) return { total: 0, detalle: [] };
  // Agrupar personas por habitación (parejaKey)
  const grupos = {};
  personas.forEach(p => {
    let key;
    if (p.comparteCon) {
      const ids = [String(p.id), String(p.comparteCon)].sort();
      key = ids.join('_');
    } else {
      key = String(p.id);
    }
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  });

  const detalle = [];
  let total = 0;
  Object.values(grupos).forEach(grupo => {
    // Si al menos una persona requiere habitación, cuenta 1 habitación
    const personasGrupo = grupo.map(p => `${p.nombre} ${p.apellido}`);
    // Si todos tienen el mismo tipoHabitacion, lo mostramos, si no, ponemos "varios"
    const tipos = grupo.map(p => p.tipoHabitacion).filter(t => t && t !== 'no-requiere');
    let tipoHabitacion = tipos.length > 0 ? tipos[0] : 'no-requiere';
    if (tipos.length > 1 && !tipos.every(t => t === tipoHabitacion)) {
      tipoHabitacion = 'varios';
    }
    if (tipos.length > 0) {
      total += 1;
      detalle.push({
        personas: personasGrupo.join(' y '),
        tipoHabitacion,
        cantidad: 1
      });
    }
  });
  return { total, detalle };
}

export default DetalleFormulario;

// Ejemplo al abrir el modal:
//setFormularioSeleccionado({ ...formulario }); // crea una copia