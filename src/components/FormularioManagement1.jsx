import { useState } from 'react';
import FormularioSocio from './formularios/FormularioSocio';
import FormularioProveedorConHotel from './formularios/FormularioProveedorConHotel';
import FormularioProveedorSinHotel from './formularios/FormularioProveedorSinHotel';
import FormulariosGuardados from './FormulariosGuardados';
import './FormularioManagement.css';

function FormularioManagement({ user }) {
  const [vistaActiva, setVistaActiva] = useState('socio');

  const renderVista = () => {
    switch (vistaActiva) {
      case 'socio':
        return <FormularioSocio />;
      case 'proveedor-con-hotel':
        return <FormularioProveedorConHotel />;
      case 'proveedor-sin-hotel':
        return <FormularioProveedorSinHotel />;
      case 'guardados':
        return (
          <FormulariosGuardados 
            userPerfil={user.perfil} 
            userEmail={user.email} 
          />
        );
      default:
        return <FormularioSocio />;
    }
  };

  return (
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
    </div>
  );
}

export default FormularioManagement;