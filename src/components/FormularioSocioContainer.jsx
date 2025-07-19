import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormularioSocio from './formularios/FormularioSocio';
import { FirebaseService } from '../services/FirebaseService';

function FormularioSocioContainer() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEvento();
  }, [eventoId]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando evento con ID:', eventoId);
      
      if (!eventoId) {
        throw new Error('ID de evento no proporcionado');
      }

      // Obtener todos los eventos y buscar el específico
      const eventos = await FirebaseService.obtenerEventos();
      const eventoEncontrado = eventos.find(e => e.id === eventoId);
      
      if (!eventoEncontrado) {
        throw new Error('Evento no encontrado');
      }

      console.log('✅ Evento cargado:', eventoEncontrado);
      setEvento(eventoEncontrado);
      
    } catch (error) {
      console.error('❌ Error cargando evento:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('📤 Enviando formulario de socio:', formData);
      
      // Aquí puedes agregar la lógica para guardar el formulario
      // Por ejemplo, enviar por email o guardar en Firestore
      await FirebaseService.guardarFormularioSocio(formData);
      
      alert('✅ Formulario enviado exitosamente');
      navigate('/eventos'); // Redirigir a la lista de eventos
      
    } catch (error) {
      console.error('❌ Error enviando formulario:', error);
      alert('❌ Error al enviar el formulario. Intente nuevamente.');
    }
  };

  const handleCancel = () => {
    navigate('/eventos');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Error al cargar el evento</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/eventos')} className="btn-secundario">
          Volver a Eventos
        </button>
      </div>
    );
  }

  return (
    <FormularioSocio 
      evento={evento}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}

export default FormularioSocioContainer;