import { useState } from 'react';
import FormularioSocio from './formularios/FormularioSocio';
import FormularioProveedorConHotel from './formularios/FormularioProveedorConHotel';
import FormularioProveedorSinHotel from './formularios/FormularioProveedorSinHotel';
import FormulariosGuardados from './FormulariosGuardados';
import DetalleFormulario from './DetalleFormulario';
import './FormularioManagement.css';
import { EventoDestacadoProvider } from '../context/EventoDestacadoContext';

function FormularioManagement({ user }) {
  const [vistaActiva, setVistaActiva] = useState('socio');
  const [formularioSeleccionado, setFormularioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const handleCerrarDetalle = () => {
    setFormularioSeleccionado(null);
    setModoEdicion(false);
  };

  const handleGuardarDetalle = (valores) => {
    // Lógica para guardar los detalles del formulario
    console.log('Guardar detalles del formulario:', valores);
    handleCerrarDetalle();
  };

  const puedeEditar = (user.perfil === 'admin' || user.perfil === 'editor');

  const handleFormularioSubmit = (data) => {
    // Lógica para guardar el formulario de socio
    console.log('Formulario socio enviado:', data);
  };

  const handleFormularioCancel = () => {
    // Lógica para cancelar y volver atrás
    setVistaActiva('guardados');
  };

  const renderVista = () => {
    switch (vistaActiva) {
      case 'socio':
        return (
          <FormularioSocio
            user={user}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );
      case 'proveedor-con-hotel':
        return (
          <FormularioProveedorConHotel
            user={user}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );
      case 'proveedor-sin-hotel':
        return (
          <FormularioProveedorSinHotel
            user={user}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );
      case 'guardados':
        return (
          <FormulariosGuardados 
            userPerfil={user.perfil} 
            userEmail={user.email} 
            onSeleccionar={setFormularioSeleccionado}
          />
        );
      default:
        return (
          <FormularioSocio
            user={user}
            evento={eventoSeleccionado}
            onSubmit={handleFormularioSubmit}
            onCancel={handleFormularioCancel}
          />
        );
    }
  };

  return (
    <EventoDestacadoProvider>
      <div className="formulario-management">
        <div className="header">
          <h2>Gestión de Formularios</h2>
        </div>

        <div className="formulario-tabs">
          <div className="tab-group">
            <span className="tab-group-label">Crear Formulario:</span>
            <button
              className={vistaActiva === 'socio' ? 'active' : ''}
              onClick={() => setVistaActiva('socio')}
            >
              Socio
            </button>
            <button
              className={vistaActiva === 'proveedor-con-hotel' ? 'active' : ''}
              onClick={() => setVistaActiva('proveedor-con-hotel')}
            >
              Proveedor con Hotel
            </button>
            <button
              className={vistaActiva === 'proveedor-sin-hotel' ? 'active' : ''}
              onClick={() => setVistaActiva('proveedor-sin-hotel')}
            >
              Proveedor sin Hotel
            </button>
          </div>
          
          <div className="tab-separator"></div>
          
          <div className="tab-group">
            <button
              className={vistaActiva === 'guardados' ? 'active' : ''}
              onClick={() => setVistaActiva('guardados')}
            >
              📋 Ver Formularios Guardados
            </button>
          </div>
        </div>

        <div className="formulario-content">
          {renderVista()}
        </div>

        {formularioSeleccionado && (
          <DetalleFormulario
            formulario={formularioSeleccionado}
            modoEdicion={modoEdicion}
            onCerrar={handleCerrarDetalle}
            onGuardar={handleGuardarDetalle}
            puedeEditar={puedeEditar}
          />
        )}
      </div>
    </EventoDestacadoProvider>
  );
}

export default FormularioManagement;