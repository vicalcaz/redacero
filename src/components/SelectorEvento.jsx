import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
//import './SelectorEvento.css';

function SelectorEvento({ onEventoSeleccionado, eventoSeleccionado }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEventosActivos();
  }, []);

  const cargarEventosActivos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const todosEventos = await FirebaseService.obtenerEventos();
      
      // Filtrar solo eventos planificados o activos
      const eventosActivos = todosEventos.filter(evento => 
        evento.estado === 'planificado' || evento.estado === 'activo'
      );
      
      console.log('Eventos activos cargados:', eventosActivos);
      setEventos(eventosActivos);
      
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setError('Error al cargar los eventos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no definida';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

const calcularDuracion = (fechaDesde, fechaHasta) => {
  if (!fechaDesde || !fechaHasta) return '';
  // Parsear manualmente los strings
  const [a1, m1, d1] = fechaDesde.split('-').map(Number);
  const [a2, m2, d2] = fechaHasta.split('-').map(Number);
  const date1 = new Date(a1, m1 - 1, d1);
  const date2 = new Date(a2, m2 - 1, d2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays === 1) return '1 día';
  return `${diffDays} días`;
};  const seleccionarEvento = (evento) => {
    onEventoSeleccionado(evento);
  };

  if (loading) {
    return (
      <div className="selector-evento">
        <div className="selector-header">
          <h2>Seleccionar Evento</h2>
          <p>Cargando eventos disponibles...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="selector-evento">
        <div className="selector-header error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={cargarEventosActivos} className="btn-retry">
            🔄 Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="selector-evento">
        <div className="selector-header">
          <h2>Sin Eventos Disponibles</h2>
          <p>No hay eventos planificados o activos para registrar formularios.</p>
          <div className="empty-state">
            <p>📅 Necesita crear un evento con estado "Planificado" o "Activo" antes de registrar formularios.</p>
            <p>Vaya a la sección <strong>Eventos</strong> para crear uno.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="selector-evento">
      <div className="selector-header">
        <h2>Seleccionar Evento</h2>
        <p>Elija el evento para el cual desea registrar el formulario</p>
        {eventoSeleccionado && (
          <div className="evento-actual">
            <span>📌 Evento actual: <strong>{eventoSeleccionado.nombre}</strong></span>
            <button 
              onClick={() => onEventoSeleccionado(null)}
              className="btn-cambiar"
            >
              Cambiar evento
            </button>
          </div>
        )}
      </div>

      {!eventoSeleccionado && (
        <div className="eventos-grid">
          {eventos.map((evento) => (
            <div 
              key={evento.id} 
              className={`evento-card ${evento.estado}`}
              onClick={() => seleccionarEvento(evento)}
            >
              <div className="evento-card-header">
                <h3>{evento.nombre}</h3>
                <span className={`status status-${evento.estado}`}>
                  {evento.estado === 'planificado' ? '📋 Planificado' : '🟢 Activo'}
                </span>
              </div>

              <div className="evento-details">
                <div className="evento-info">
                  <span className="label">📍 Ubicación:</span>
                  <span>{evento.ubicacion}</span>
                </div>

                <div className="evento-fechas">
                  <div className="fecha-info">
                    <span className="label">📅 Desde:</span>
                    <span>
                      {evento.fechaDesde ? evento.fechaDesde.split('-').reverse().join('/') : 'Sin fecha'}
                    </span>
                  </div>
                  <div className="fecha-info">
                    <span className="label">📅 Hasta:</span>
                    <span>
                      {evento.fechaHasta ? evento.fechaHasta.split('-').reverse().join('/') : 'Sin fecha'}
                    </span>
                  </div>
                  {evento.fechaDesde && evento.fechaHasta && (
                    <div className="duracion-info">
                      <span className="duracion-badge">
                        ⏱️ {calcularDuracion(evento.fechaDesde, evento.fechaHasta)}
                      </span>
                    </div>
                  )}
                </div>

                {evento.descripcion && (
                  <div className="evento-descripcion">
                    <span className="label">📝 Descripción:</span>
                    <p>{evento.descripcion}</p>
                  </div>
                )}
              </div>

              <div className="evento-action">
                <span className="select-hint">👆 Clic para seleccionar este evento</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectorEvento;