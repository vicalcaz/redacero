import { useState, useEffect } from 'react';
import { useEventoDestacado } from '../context/EventoDestacadoContext';
import { FirebaseService } from '../services/FirebaseService';
import './EventManagement.css';
import SubirImagen from './SubirImagen';

function EventManagement() {
  const { setEvento, setEventoId, setNombre, setFechaDesde, setFechaHasta, setFechaLimiteEdicion } = useEventoDestacado();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [imagenBase64, setImagenBase64] = useState(null);

  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '',
    descripcion: '',
    fechaDesde: '',
    fechaHasta: '',
    fechaLimiteEdicion: '', // <-- NUEVO CAMPO
    ubicacion: '',
    estado: 'planificado',
    destacado: false,
    imagenBase64: null
  });

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    setNuevoEvento(prev => ({
      ...prev,
      imagenBase64: imagenBase64
    }));
  }, [imagenBase64]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    if (nuevoEvento.fechaHasta && nuevoEvento.fechaDesde &&
      new Date(nuevoEvento.fechaHasta) < new Date(nuevoEvento.fechaDesde)) {
      alert('❌ La fecha hasta no puede ser anterior a la fecha desde');
      setGuardando(false);
      return;
    }

    // Al guardar, simplemente usa el valor del input (string)
    const eventoData = {
      id: editando ? editando.id : undefined, // Si estamos editando, usamos el ID del evento
      nombre: nuevoEvento.nombre, // string, ej: "2025-07-20"
      descripcion: nuevoEvento.descripcion, // string
      fechaDesde: nuevoEvento.fechaDesde, // string
      fechaHasta: nuevoEvento.fechaHasta, // string
      destacado: nuevoEvento.destacado, // boolean
      ubicacion: nuevoEvento.ubicacion || '', // string
      fechaLimiteEdicion: nuevoEvento.fechaLimiteEdicion, // string
      imagenBase64: imagenBase64,
      estado: nuevoEvento.estado || 'planificado',
      fechaCreacion: editando ? editando.fechaCreacion : new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      fechaCreacionString: editando ? editando.fechaCreacionString : new Date().toLocaleString('es-AR'),
      fechaActualizacionString: new Date().toLocaleString('es-AR')
    };

    try {
      // Si el evento se marca como destacado, desmarcar los demás antes de guardar
      let eventoDestacadoActualizado = null;
      if (eventoData.destacado) {
        const eventosTodos = await FirebaseService.obtenerEventos();
        const destacados = eventosTodos.filter(ev => ev.id !== (editando ? editando.id : null) && ev.destacado);
        const updates = destacados.map(ev => FirebaseService.actualizarEvento(ev.id, {
          nombre: ev.nombre,
          descripcion: ev.descripcion,
          fechaDesde: ev.fechaDesde,
          fechaHasta: ev.fechaHasta,
          fechaLimiteEdicion: ev.fechaLimiteEdicion,
          ubicacion: ev.ubicacion,
          estado: ev.estado,
          destacado: false,
          imagenBase64: ev.imagenBase64 || null
        }));
        await Promise.all(updates);
      }
      let eventoIdGuardado = null;
      if (editando) {
        await FirebaseService.actualizarEvento(editando.id, eventoData);
        eventoIdGuardado = editando.id;
        alert('✅ Evento actualizado exitosamente');
      } else {
        const idNuevo = await FirebaseService.crearEvento(eventoData);
        eventoIdGuardado = idNuevo;
        alert('✅ Evento creado exitosamente');
      }
      // Si el evento guardado es destacado, actualizar el contexto
      if (eventoData.destacado) {
        // Obtener el evento actualizado desde Firebase
        const eventoActualizado = await FirebaseService.obtenerEventoPorId(eventoIdGuardado);
        setEvento(eventoActualizado);
        setEventoId(eventoActualizado.id);
        setNombre(eventoActualizado.nombre);
        setFechaDesde(eventoActualizado.fechaDesde);
        setFechaHasta(eventoActualizado.fechaHasta);
        setFechaLimiteEdicion(eventoActualizado.fechaLimiteEdicion);
      }
      limpiarFormulario();
      cargarEventos();
    } catch (error) {
      console.error('Error guardando evento:', error);
      alert('❌ Error al guardar el evento');
    } finally {
      setGuardando(false);
    }
  };

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const data = await FirebaseService.obtenerEventos();
      console.log('🔥 Eventos recibidos de Firebase:', data.map(ev => ({ id: ev.id, fechaDesde: ev.fechaDesde })));
      setEventos(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      alert('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (evento) => {
    setEditando(evento);
    setNuevoEvento({
      nombre: evento.nombre || '',
      descripcion: evento.descripcion || '',
      fechaDesde: evento.fechaDesde || '',
      fechaHasta: evento.fechaHasta || '',
      fechaLimiteEdicion: evento.fechaLimiteEdicion || '', // <-- NUEVO CAMPO
      ubicacion: evento.ubicacion || '',
      estado: evento.estado || 'planificado',
      destacado: evento.destacado || false,
      imagenBase64: evento.imagenBase64 || null
    });
    setImagenBase64(evento.imagenBase64 || null);
  };

  const limpiarFormulario = () => {
    setNuevoEvento({
      nombre: '',
      descripcion: '',
      fechaDesde: '',
      fechaHasta: '',
      fechaLimiteEdicion: '', // <-- NUEVO CAMPO
      ubicacion: '',
      estado: 'planificado',
      destacado: false,
      imagenBase64: null
    });
    setImagenBase64(null);
    setEditando(null);
  };

  // Maneja el cambio de cualquier campo, pero intercepta el cambio a destacado=true para mostrar confirmación
  const actualizarCampo = async (campo, valor) => {
    if (campo === 'destacado' && valor === true) {
      // Si se intenta marcar como destacado, mostrar confirmación
      const eventosTodos = await FirebaseService.obtenerEventos();
      const destacados = eventosTodos.filter(ev => ev.id !== (editando ? editando.id : null) && ev.destacado);
      if (destacados.length > 0) {
        const confirmar = window.confirm('Al marcar este evento como destacado, se desmarcará cualquier otro que esté como destacado. ¿Desea continuar?');
        if (!confirmar) return;
      }
    }
    setNuevoEvento(prev => ({
      ...prev,
      [campo]: valor
    }));
  }
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await FirebaseService.eliminarEvento(id);
        alert('✅ Evento eliminado exitosamente');
        cargarEventos();
      } catch (error) {
        console.error('Error eliminando evento:', error);
        alert('❌ Error al eliminar el evento');
      }
    }
  };

  const toggleDestacado = async (evento) => {
    try {
      const nuevoEstadoDestacado = !evento.destacado;
      if (nuevoEstadoDestacado) {
        const confirmar = window.confirm('Al marcar este evento como destacado, se desmarcará cualquier otro que esté como destacado. ¿Desea continuar?');
        if (!confirmar) return;
        const eventosTodos = await FirebaseService.obtenerEventos();
        const destacados = eventosTodos.filter(ev => ev.id !== evento.id && ev.destacado);
        const updates = destacados.map(ev => FirebaseService.actualizarEvento(ev.id, {
          nombre: ev.nombre,
          descripcion: ev.descripcion,
          fechaDesde: ev.fechaDesde,
          fechaHasta: ev.fechaHasta,
          fechaLimiteEdicion: ev.fechaLimiteEdicion,
          ubicacion: ev.ubicacion,
          estado: ev.estado,
          destacado: false,
          imagenBase64: ev.imagenBase64 || null
        }));
        await Promise.all(updates);
      }
      // Crea una copia del evento y reemplaza undefined por valores vacíos
      const eventoLimpio = {
        nombre: evento.nombre || '',
        descripcion: evento.descripcion || '',
        fechaDesde: evento.fechaDesde || '',
        fechaHasta: evento.fechaHasta || '',
        fechaLimiteEdicion: evento.fechaLimiteEdicion || '',
        ubicacion: evento.ubicacion || '',
        estado: evento.estado || 'planificado',
        destacado: nuevoEstadoDestacado,
        imagenBase64: evento.imagenBase64 || null
      };
      await FirebaseService.actualizarEvento(evento.id, eventoLimpio);
      if (nuevoEstadoDestacado) {
        // Actualizar el contexto de evento destacado
        const eventoActualizado = await FirebaseService.obtenerEventoPorId(evento.id);
        setEvento(eventoActualizado);
        setEventoId(eventoActualizado.id);
        setNombre(eventoActualizado.nombre);
        setFechaDesde(eventoActualizado.fechaDesde);
        setFechaHasta(eventoActualizado.fechaHasta);
        setFechaLimiteEdicion(eventoActualizado.fechaLimiteEdicion);
      }
      alert(nuevoEstadoDestacado ?
        '⭐ Evento marcado como destacado' :
        '☆ Evento removido de destacados'
      );
      cargarEventos();
    } catch (error) {
      console.error('Error actualizando estado destacado:', error);
      alert('❌ Error al actualizar el evento');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  function mostrarFecha(fechaStr) {
    if (!fechaStr) return '';
    const soloFecha = fechaStr.split('T')[0]; // Por si acaso
    const [y, m, d] = soloFecha.split('-');
    return `${d}/${m}/${y}`;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando eventos...</p>
      </div>
    );
  }

  return (

    <div className="gestion-eventos-container">
      <div className="gestion-eventos-header">
        <h1>Gestión de Eventos</h1>
        <p>Administre las fechas, detalles e imágenes de los eventos</p>
      </div>

      <div className="gestion-eventos-card">
        <h2>{editando ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>
        <form onSubmit={handleSubmit} className="event-form">
          {/* Fila 1: Nombre y Ubicación */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                value={nuevoEvento.nombre}
                onChange={(e) => actualizarCampo('nombre', e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
              <label htmlFor="ubicacion">Ubicación</label>
              <input
                type="text"
                id="ubicacion"
                value={nuevoEvento.ubicacion}
                onChange={(e) => actualizarCampo('ubicacion', e.target.value)}
              />
            </div>
          </div>

          {/* Fila 2: Fechas */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaDesde">Fecha Desde</label>
              <input
                type="date"
                id="fechaDesde"
                value={nuevoEvento.fechaDesde}
                onChange={(e) => actualizarCampo('fechaDesde', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fechaHasta">Fecha Hasta</label>
              <input
                type="date"
                id="fechaHasta"
                value={nuevoEvento.fechaHasta}
                onChange={(e) => actualizarCampo('fechaHasta', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fechaLimiteEdicion">Límite Edición</label>
              <input
                type="date"
                id="fechaLimiteEdicion"
                value={nuevoEvento.fechaLimiteEdicion}
                onChange={(e) => actualizarCampo('fechaLimiteEdicion', e.target.value)}
              />
            </div>
          </div>

          {/* Fila 3: Estado centrado */}
          <div className="form-row" style={{ justifyContent: 'center', marginTop: '10px' }}>
            <div className="form-group" style={{ minWidth: 200, textAlign: 'center' }}>
              <label htmlFor="estado"><strong>Estado del Evento</strong></label>
              <select
                id="estado"
                value={nuevoEvento.estado}
                onChange={e => actualizarCampo('estado', e.target.value)}
                style={{ textAlign: 'center', fontWeight: 'bold' }}
              >
                <option value="planificado">Planificado</option>
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Fila 4: Descripción */}
          {/* Solo un campo de descripción, se eliminó el duplicado */}

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={nuevoEvento.descripcion}
              onChange={(e) => actualizarCampo('descripcion', e.target.value)}
              rows="2"
            />
          </div>

          <div className="form-group destacado-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="destacado"
                checked={nuevoEvento.destacado}
                onChange={async (e) => {
                  await actualizarCampo('destacado', e.target.checked);
                }}
                className="destacado-checkbox"
              />
              <label htmlFor="destacado" className="destacado-label">
                <span className="checkbox-icon">
                  {nuevoEvento.destacado ? '⭐' : '☆'}
                </span>
                <span className="checkbox-text">
                  <strong>Evento Destacado</strong>
                  <small>Se mostrará prominentemente en la página de inicio</small>
                </span>
              </label>
            </div>
            {nuevoEvento.destacado && (
              <div className="destacado-info">
                <p>✨ Este evento aparecerá destacado en la página principal</p>
                <p>💡 <strong>Recomendación:</strong> Los eventos destacados deben tener imagen para mejor presentación</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>🖼️ Imagen del Evento</label>
            <SubirImagen
              onImagenSeleccionada={setImagenBase64}
              imagenActual={imagenBase64}
            />
          </div>

          <div className="form-actions">
            {editando && (
              <button type="button" onClick={limpiarFormulario} className="gestion-eventos-btn btn-secundario">
                Cancelar Edición
              </button>
            )}
            <button
              type="submit"
              disabled={guardando}
              className="gestion-eventos-btn btn-primario"
            >
              {guardando ? 'Guardando...' : editando ? 'Actualizar Evento' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>

      <div className="gestion-eventos-card">
        <h2>Eventos Creados ({eventos.length})</h2>
        {eventos.length === 0 ? (
          <div className="no-events">
            <p>No hay eventos creados aún.</p>
            <p>¡Crea tu primer evento usando el formulario de arriba!</p>
          </div>
        ) : (
          <div className="events-grid">
            {eventos.map(evento => {
              console.log('🟢 Evento en render:', evento.id, evento.fechaDesde);
              return (
                <div key={evento.id} className={`event-card ${evento.destacado ? 'destacado' : ''}`}>
                  {evento.imagenBase64 && (
                    <div className="event-image-container">
                      <img
                        src={evento.imagenBase64}
                        alt={evento.nombre}
                        className="event-image"
                      />
                    </div>
                  )}
                  <div className="event-header">
                    <h3>
                      {evento.destacado && <span className="star-icon">⭐</span>}
                      {evento.nombre}
                    </h3>
                    <div className="event-actions">
                      <button
                        onClick={() => toggleDestacado(evento)}
                        className={`btn-star ${evento.destacado ? 'active' : ''}`}
                        title={evento.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                      >
                        {evento.destacado ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={() => handleEditar(evento)}
                        className="btn-edit"
                        title="Editar evento"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminar(evento.id)}
                        className="btn-delete"
                        title="Eliminar evento"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="event-content">
                    {evento.descripcion && (
                      <p className="event-description">{evento.descripcion}</p>
                    )}
                    <div className="event-details">
                      {evento.fechaDesde && (
                        <>
                          {console.log('🔵 fechaDesde antes de mostrar:', evento.fechaDesde)}
                          <div className="detail-item">
                            <span className="detail-icon">📅</span>
                            <span className="detail-text">
                              {mostrarFecha(evento.fechaDesde)}
                              {evento.fechaHasta && evento.fechaHasta !== evento.fechaDesde &&
                                ` - ${mostrarFecha(evento.fechaHasta)}`
                              }
                            </span>
                          </div>
                        </>
                      )}
                      {evento.ubicacion && (
                        <div className="detail-item">
                          <span className="detail-icon">📍</span>
                          <span className="detail-text">{evento.ubicacion}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-icon">📊</span>
                        <span className={`status-badge status-${evento.estado}`}>
                          {evento.estado?.charAt(0).toUpperCase() + evento.estado?.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="event-metadata">
                      <small>Creado: {evento.fechaCreacionString}</small>
                      {evento.fechaActualizacionString && evento.fechaActualizacionString !== evento.fechaCreacionString && (
                        <small>Actualizado: {evento.fechaActualizacionString}</small>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventManagement;