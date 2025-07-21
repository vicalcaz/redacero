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
              <strong>Fecha de envío:</strong> {formulario.fechaCreacionString || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Usuario:</strong> {formulario.usuarioCreador || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Tipo:</strong> {formulario.tipo}
            </div>
          </div>

          <div className="seccion">
            <h4>Datos de la Empresa</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Dirección:</label>
                {editandoActivo ? (
                  <input
                    type="text"
                    value={formularioEditado.datosEmpresa?.direccion || ''}
                    onChange={(e) => actualizarDatosEmpresa('direccion', e.target.value)}
                  />
                ) : (
                  <span className="form-value">{formulario.datosEmpresa?.direccion || 'N/A'}</span>
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
          </div>

          <div className="seccion">
            <h4>Personas ({formulario.personas?.length || 0})</h4>
            {formulario.personas?.map((persona, index) => (
              <div key={index} className="persona-detalle">
                <h5>Persona {index + 1}</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre:</label>
                    {editandoActivo ? (
                      <input
                        type="text"
                        value={formularioEditado.personas[index]?.nombre || ''}
                        onChange={(e) => actualizarPersona(index, 'nombre', e.target.value)}
                      />
                    ) : (
                      <span>{persona.nombre || 'N/A'}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Apellido:</label>
                    {editandoActivo ? (
                      <input
                        type="text"
                        value={formularioEditado.personas[index]?.apellido || ''}
                        onChange={(e) => actualizarPersona(index, 'apellido', e.target.value)}
                      />
                    ) : (
                      <span>{persona.apellido || 'N/A'}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    {editandoActivo ? (
                      <input
                        type="email"
                        value={formularioEditado.personas[index]?.email || ''}
                        onChange={(e) => actualizarPersona(index, 'email', e.target.value)}
                      />
                    ) : (
                      <span>{persona.email || 'N/A'}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Teléfono:</label>
                    {editandoActivo ? (
                      <input
                        type="tel"
                        value={formularioEditado.personas[index]?.telefono || ''}
                        onChange={(e) => actualizarPersona(index, 'telefono', e.target.value)}
                      />
                    ) : (
                      <span>{persona.telefono || 'N/A'}</span>
                    )}
                  </div>
                </div>
                
                <div className="dias-evento">
                  <strong>Días de asistencia:</strong>
                  <div className="checkboxes">
                    {['lunes', 'martes', 'miercoles'].map(dia => (
                      <label key={dia}>
                        {editandoActivo ? (
                          <select
                            value={formularioEditado.personas[index]?.[dia] || ''}
                            onChange={e => actualizarPersona(index, dia, e.target.value)}
                          >
                            <option value="">--</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        ) : (
                          <span>
                            {persona[dia] === 'si' ? 'Sí' : persona[dia] === 'no' ? 'No' : '--'}
                          </span>
                        )}
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Campos específicos según tipo */}
                {formulario.tipo === 'Proveedor con hotel' && (
                  <div className="hotel-info">
                    <strong>Información de Hotel:</strong>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Tipo de habitación:</label>
                        <span>{persona.tipoHabitacion || 'N/A'}</span>
                      </div>
                      <div className="form-group">
                        <label>Noches:</label>
                        <span>{persona.noches || 'N/A'}</span>
                      </div>
                      <div className="form-group">
                        <label>Acompañantes:</label>
                        <span>{persona.acompanantes || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {formulario.tipo === 'Proveedor sin hotel' && (
                  <div className="transporte-info">
                    <strong>Transporte y Alojamiento:</strong>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Transporte propio:</label>
                        <span>{persona.transportePropio ? 'Sí' : 'No'}</span>
                      </div>
                      <div className="form-group">
                        <label>Alojamiento externo:</label>
                        <span>{persona.alojamientoExterno || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              {puedeEditar && (
                <button 
                  className="btn-primary" 
                  onClick={activarEdicion}
                >
                  Editar
                </button>
              )}
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

export default DetalleFormulario;

// Ejemplo al abrir el modal:
//setFormularioSeleccionado({ ...formulario }); // crea una copia