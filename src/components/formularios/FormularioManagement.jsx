/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\FormularioManagement.jsx */
import { useState } from 'react';
import FormularioSocio from './FormularioSocio';
import FormularioProveedorConHotel from './FormularioProveedorConHotel';
import FormularioProveedorSinHotel from './FormularioProveedorSinHotel';
import './FormularioManagement.css';

function FormularioManagement() {
  const [formularioActivo, setFormularioActivo] = useState('socio');

  const renderFormulario = () => {
    switch (formularioActivo) {
      case 'socio':
        return <FormularioSocio />;
      case 'proveedor-con-hotel':
        return <FormularioProveedorConHotel />;
      case 'proveedor-sin-hotel':
        return <FormularioProveedorSinHotel />;
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
        <button
          className={formularioActivo === 'socio' ? 'active' : ''}
          onClick={() => setFormularioActivo('socio')}
        >
          Formulario Socio
        </button>
        <button
          className={formularioActivo === 'proveedor-con-hotel' ? 'active' : ''}
          onClick={() => setFormularioActivo('proveedor-con-hotel')}
        >
          Proveedor con Hotel
        </button>
        <button
          className={formularioActivo === 'proveedor-sin-hotel' ? 'active' : ''}
          onClick={() => setFormularioActivo('proveedor-sin-hotel')}
        >
          Proveedor sin Hotel
        </button>
      </div>

      <div className="formulario-content">
        {renderFormulario()}
      </div>
    </div>
  );
}

export default FormularioManagement;