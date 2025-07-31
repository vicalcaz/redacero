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
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table className="tabla-personas-resumen">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Cargo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>DNI</th>
                    <th>Empresa</th>
                    <th>Fecha llegada</th>
                    <th>Hora llegada</th>
                    <th>Fecha salida</th>
                    <th>Hora salida</th>
                    <th>Tipo Habitación</th>
                    <th>Comparte con</th>
                    <th>Noches</th>
                    <th>Asiste cena</th>
                    <th>Atiende reuniones</th>
                    <th>Menú especial</th>
                    <th>Lunes</th>
                    <th>Martes</th>
                    <th>Miércoles</th>
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
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.nombre}
                              onChange={e => actualizarPersona(i, 'nombre', e.target.value)}
                            />
                          ) : p.nombre}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.apellido}
                              onChange={e => actualizarPersona(i, 'apellido', e.target.value)}
                            />
                          ) : p.apellido}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.cargo}
                              onChange={e => actualizarPersona(i, 'cargo', e.target.value)}
                            />
                          ) : p.cargo}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="email"
                              value={p.email}
                              onChange={e => actualizarPersona(i, 'email', e.target.value)}
                            />
                          ) : p.email}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="tel"
                              value={p.telefono}
                              onChange={e => actualizarPersona(i, 'telefono', e.target.value)}
                            />
                          ) : p.telefono}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.dni}
                              onChange={e => actualizarPersona(i, 'dni', e.target.value)}
                            />
                          ) : p.dni}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.empresa}
                              onChange={e => actualizarPersona(i, 'empresa', e.target.value)}
                            />
                          ) : p.empresa}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="date"
                              value={p.fechaLlegada || ''}
                              onChange={e => actualizarPersona(i, 'fechaLlegada', e.target.value)}
                            />
                          ) : p.fechaLlegada}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="time"
                              value={p.horaLlegada || ''}
                              onChange={e => actualizarPersona(i, 'horaLlegada', e.target.value)}
                            />
                          ) : p.horaLlegada}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="date"
                              value={p.fechaSalida || ''}
                              onChange={e => actualizarPersona(i, 'fechaSalida', e.target.value)}
                            />
                          ) : p.fechaSalida}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="time"
                              value={p.horaSalida || ''}
                              onChange={e => actualizarPersona(i, 'horaSalida', e.target.value)}
                            />
                          ) : p.horaSalida}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <select
                              value={p.tipoHabitacion}
                              onChange={e => actualizarPersona(i, 'tipoHabitacion', e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="doble">Doble</option>
                              <option value="matrimonial">Single (Matrimonial)</option>
                              <option value="no-requiere">No requiere</option>
                            </select>
                          ) : p.tipoHabitacion}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.comparteCon || ''}
                              onChange={e => actualizarPersona(i, 'comparteCon', e.target.value)}
                              placeholder="ID o nombre"
                            />
                          ) : (p.comparteCon ? obtenerNombrePorId(p.comparteCon, formulario.personas) : '')}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="number"
                              value={p.noches || ''}
                              onChange={e => actualizarPersona(i, 'noches', Number(e.target.value))}
                              min={0}
                            />
                          ) : p.noches}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <select
                              value={p.asisteCena || ''}
                              onChange={e => actualizarPersona(i, 'asisteCena', e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          ) : (p.asisteCena === 'si' ? 'Sí' : p.asisteCena === 'no' ? 'No' : '--')}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <select
                              value={p.atendeReuniones || ''}
                              onChange={e => actualizarPersona(i, 'atendeReuniones', e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          ) : (p.atendeReuniones === 'si' ? 'Sí' : p.atendeReuniones === 'no' ? 'No' : '--')}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <input
                              type="text"
                              value={p.menuEspecial || ''}
                              onChange={e => actualizarPersona(i, 'menuEspecial', e.target.value)}
                            />
                          ) : (p.menuEspecial || 'Ninguno')}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <select
                              value={p.lunes || ''}
                              onChange={e => actualizarPersona(i, 'lunes', e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          ) : (p.lunes === 'si' ? 'Sí' : p.lunes === 'no' ? 'No' : '--')}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <select
                              value={p.martes || ''}
                              onChange={e => actualizarPersona(i, 'martes', e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          ) : (p.martes === 'si' ? 'Sí' : p.martes === 'no' ? 'No' : '--')}
                        </td>
                        <td>
                          {editandoActivo ? (
                            <select
                              value={p.miercoles || ''}
                              onChange={e => actualizarPersona(i, 'miercoles', e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          ) : (p.miercoles === 'si' ? 'Sí' : p.miercoles === 'no' ? 'No' : '--')}
                        </td>
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
  <div style={{overflowX: 'auto'}}>
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
    <strong>Habitaciones tomadas:</strong> {calcularHabitaciones(formulario.personas)}
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
  return personas.reduce((total, p) => {
    // Si el campo noches existe y es un número, lo suma
    if (typeof p.noches === 'number') return total + p.noches;
    // Si no, intenta calcularlo a partir de fechas
    if (p.fechaLlegada && p.fechaSalida) {
      const llegada = new Date(p.fechaLlegada);
      const salida = new Date(p.fechaSalida);
      const diff = (salida - llegada) / (1000 * 60 * 60 * 24);
      return total + (diff > 0 ? diff : 0);
    }
    return total;
  }, 0);
}

function calcularHabitaciones(personas) {
  if (!Array.isArray(personas)) return 0;
  // Cuenta personas con tipoHabitacion distinto de "no-requiere" y que no comparten o son el "dueño" de la habitación
  return personas.filter(
    p => p.tipoHabitacion && p.tipoHabitacion !== 'no-requiere' && (!p.comparteCon || p.comparteCon === '')
  ).length;
}

export default DetalleFormulario;

// Ejemplo al abrir el modal:
//setFormularioSeleccionado({ ...formulario }); // crea una copia