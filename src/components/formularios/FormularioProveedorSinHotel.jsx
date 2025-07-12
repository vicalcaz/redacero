/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\formularios\FormularioProveedorSinHotel.jsx */
import { useState } from 'react';
import './FormularioBase.css';

function FormularioProveedorSinHotel() {
  const [datosEmpresa, setDatosEmpresa] = useState({
    direccion: '',
    ciudad: '',
    paginaWeb: '',
    codigoPostal: '',
    rubro: ''
  });

  const [personas, setPersonas] = useState([{
    id: 1,
    nombre: '',
    apellido: '',
    empresa: '',
    cargo: '',
    celular: '',
    telefono: '',
    email: '',
    dni: '',
    fechaLlegada: '',
    horaLlegada: '',
    fechaSalida: '',
    horaSalida: '',
    lunes: false,
    martes: false,
    miercoles: false,
    asisteCena: false,
    menuEspecial: '',
    atendeReuniones: false,
    // Campos específicos para proveedor sin hotel
    transportePropio: true,
    alojamientoExterno: ''
  }]);

  const [comentarios, setComentarios] = useState('');

  const agregarPersona = () => {
    const nuevaPersona = {
      id: personas.length + 1,
      nombre: '',
      apellido: '',
      empresa: '',
      cargo: '',
      celular: '',
      telefono: '',
      email: '',
      dni: '',
      fechaLlegada: '',
      horaLlegada: '',
      fechaSalida: '',
      horaSalida: '',
      lunes: false,
      martes: false,
      miercoles: false,
      asisteCena: false,
      menuEspecial: '',
      atendeReuniones: false,
      transportePropio: true,
      alojamientoExterno: ''
    };
    setPersonas([...personas, nuevaPersona]);
  };

  const eliminarPersona = (id) => {
    if (personas.length > 1) {
      setPersonas(personas.filter(persona => persona.id !== id));
    }
  };

  const actualizarPersona = (id, campo, valor) => {
    setPersonas(personas.map(persona =>
      persona.id === id ? { ...persona, [campo]: valor } : persona
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formularioData = {
      datosEmpresa,
      personas,
      comentarios,
      tipo: 'Proveedor sin hotel'
    };
    console.log('Datos del formulario:', formularioData);
    // Aquí se enviaría a Firebase
  };

  return (
    <div className="formulario-proveedor-sin-hotel">
      <h3>Formulario para Proveedores sin Hotel</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Sección Datos de la Empresa */}
        <div className="seccion datos-empresa">
          <h4>Datos de la Empresa</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Dirección (calle y número):</label>
              <input
                type="text"
                value={datosEmpresa.direccion}
                onChange={(e) => setDatosEmpresa({...datosEmpresa, direccion: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Ciudad:</label>
              <input
                type="text"
                value={datosEmpresa.ciudad}
                onChange={(e) => setDatosEmpresa({...datosEmpresa, ciudad: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Página Web:</label>
              <input
                type="url"
                value={datosEmpresa.paginaWeb}
                onChange={(e) => setDatosEmpresa({...datosEmpresa, paginaWeb: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Código Postal:</label>
              <input
                type="text"
                value={datosEmpresa.codigoPostal}
                onChange={(e) => setDatosEmpresa({...datosEmpresa, codigoPostal: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Rubro:</label>
              <input
                type="text"
                value={datosEmpresa.rubro}
                onChange={(e) => setDatosEmpresa({...datosEmpresa, rubro: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Sección Personas */}
        {personas.map((persona, index) => (
          <div key={persona.id} className="seccion datos-persona">
            <div className="seccion-header">
              <h4>Persona {index + 1}</h4>
              {personas.length > 1 && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => eliminarPersona(persona.id)}
                >
                  Eliminar
                </button>
              )}
            </div>

            {/* Datos personales */}
            <div className="subseccion datos-personales">
              <h5>Datos de la Persona</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={persona.nombre}
                    onChange={(e) => actualizarPersona(persona.id, 'nombre', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Apellido:</label>
                  <input
                    type="text"
                    value={persona.apellido}
                    onChange={(e) => actualizarPersona(persona.id, 'apellido', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Empresa (razón social):</label>
                  <input
                    type="text"
                    value={persona.empresa}
                    onChange={(e) => actualizarPersona(persona.id, 'empresa', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Cargo:</label>
                  <input
                    type="text"
                    value={persona.cargo}
                    onChange={(e) => actualizarPersona(persona.id, 'cargo', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Celular:</label>
                  <input
                    type="tel"
                    value={persona.celular}
                    onChange={(e) => actualizarPersona(persona.id, 'celular', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono (cod área + teléfono):</label>
                  <input
                    type="tel"
                    value={persona.telefono}
                    onChange={(e) => actualizarPersona(persona.id, 'telefono', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>E-mail:</label>
                  <input
                    type="email"
                    value={persona.email}
                    onChange={(e) => actualizarPersona(persona.id, 'email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>DNI (sin puntos ni comas):</label>
                  <input
                    type="text"
                    value={persona.dni}
                    onChange={(e) => actualizarPersona(persona.id, 'dni', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Info Check in-out */}
            <div className="subseccion checkin-checkout">
              <h5>Info Check in-out</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fecha llegada:</label>
                  <input
                    type="date"
                    value={persona.fechaLlegada}
                    onChange={(e) => actualizarPersona(persona.id, 'fechaLlegada', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hora llegada:</label>
                  <input
                    type="time"
                    value={persona.horaLlegada}
                    onChange={(e) => actualizarPersona(persona.id, 'horaLlegada', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha salida:</label>
                  <input
                    type="date"
                    value={persona.fechaSalida}
                    onChange={(e) => actualizarPersona(persona.id, 'fechaSalida', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hora salida:</label>
                  <input
                    type="time"
                    value={persona.horaSalida}
                    onChange={(e) => actualizarPersona(persona.id, 'horaSalida', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Información de Transporte y Alojamiento */}
            <div className="subseccion transporte-alojamiento">
              <h5>Transporte y Alojamiento</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={persona.transportePropio}
                      onChange={(e) => actualizarPersona(persona.id, 'transportePropio', e.target.checked)}
                    />
                    Transporte propio
                  </label>
                </div>
                <div className="form-group">
                  <label>Alojamiento externo:</label>
                  <input
                    type="text"
                    value={persona.alojamientoExterno}
                    onChange={(e) => actualizarPersona(persona.id, 'alojamientoExterno', e.target.value)}
                    placeholder="Hotel, dirección o lugar de alojamiento"
                  />
                </div>
              </div>
            </div>

            {/* Días de acreditaciones */}
            <div className="subseccion acreditaciones">
              <h5>Días de Acreditaciones</h5>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={persona.lunes}
                    onChange={(e) => actualizarPersona(persona.id, 'lunes', e.target.checked)}
                  />
                  Lunes
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={persona.martes}
                    onChange={(e) => actualizarPersona(persona.id, 'martes', e.target.checked)}
                  />
                  Martes
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={persona.miercoles}
                    onChange={(e) => actualizarPersona(persona.id, 'miercoles', e.target.checked)}
                  />
                  Miércoles
                </label>
              </div>
            </div>

            {/* Cena de cierre */}
            <div className="subseccion cena-cierre">
              <h5>Cena de Cierre</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={persona.asisteCena}
                      onChange={(e) => actualizarPersona(persona.id, 'asisteCena', e.target.checked)}
                    />
                    Asiste
                  </label>
                </div>
                <div className="form-group">
                  <label>Menú especial:</label>
                  <input
                    type="text"
                    value={persona.menuEspecial}
                    onChange={(e) => actualizarPersona(persona.id, 'menuEspecial', e.target.value)}
                    placeholder="Especificar si requiere menú especial"
                  />
                </div>
              </div>
            </div>

            {/* Agenda de reuniones */}
            <div className="subseccion agenda-reuniones">
              <h5>Agenda de Reuniones</h5>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={persona.atendeReuniones}
                  onChange={(e) => actualizarPersona(persona.id, 'atendeReuniones', e.target.checked)}
                />
                Atiende agenda de reuniones
              </label>
            </div>
          </div>
        ))}

        <div className="agregar-persona">
          <button type="button" className="btn-secondary" onClick={agregarPersona}>
            Agregar otra persona
          </button>
        </div>

        {/* Comentarios */}
        <div className="seccion comentarios">
          <h4>Comentarios</h4>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Los proveedores sin hotel deben gestionar su propio alojamiento. Especificar cualquier requerimiento especial..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-success">
            Guardar Formulario
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioProveedorSinHotel;