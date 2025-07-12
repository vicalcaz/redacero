/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\EventManagement.jsx */
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './EventManagement.css';

function EventManagement() {
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '',
    fecha: '',
    formularioTipo: 'Socio'
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const tiposFormulario = ['Socio', 'Proveedor con hotel', 'Proveedor sin hotel'];

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const eventosData = await FirebaseService.obtenerEventos();
      setEventos(eventosData);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    try {
      await FirebaseService.crearEvento(nuevoEvento);
      setNuevoEvento({ nombre: '', fecha: '', formularioTipo: 'Socio' });
      setMostrarFormulario(false);
      cargarEventos();
    } catch (error) {
      console.error('Error creando evento:', error);
    }
  };

  const handleEliminarEvento = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await FirebaseService.eliminarEvento(id);
        cargarEventos();
      } catch (error) {
        console.error('Error eliminando evento:', error);
      }
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="event-management">
      <div className="header">
        <h2>Administración de Eventos</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Evento'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-evento">
          <h3>Crear Nuevo Evento</h3>
          <form onSubmit={handleCrearEvento}>
            <div className="form-group">
              <label>Nombre del Evento:</label>
              <input
                type="text"
                value={nuevoEvento.nombre}
                onChange={(e) => setNuevoEvento({...nuevoEvento, nombre: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha del Evento:</label>
              <input
                type="date"
                value={nuevoEvento.fecha}
                onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Tipo de Formulario:</label>
              <select
                value={nuevoEvento.formularioTipo}
                onChange={(e) => setNuevoEvento({...nuevoEvento, formularioTipo: e.target.value})}
              >
                {tiposFormulario.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">Crear Evento</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabla-eventos">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Formulario Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map(evento => (
              <tr key={evento.id}>
                <td>{evento.nombre}</td>
                <td>{formatearFecha(evento.fecha)}</td>
                <td>
                  <span className={`badge ${evento.formularioTipo.replace(/\s+/g, '-').toLowerCase()}`}>
                    {evento.formularioTipo}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-danger"
                    onClick={() => handleEliminarEvento(evento.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventManagement;