import React, { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './PersonalizacionFormularios.css';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- Agrega este código antes de tu componente ---
const Link = Quill.import('formats/link');
Link.sanitize = url => {
  // Permite pegar URLs sin protocolo
  if (url && !/^https?:\/\//i.test(url)) {
    return 'http://' + url;
  }
  return url;
};
Quill.register(Link, true);
// -------------------------------------------------

const TIPOS_FORMULARIO = [
  { value: 'socio', label: 'Socio' },
  { value: 'proveedor-con-hotel', label: 'Proveedor con Hotel' },
  { value: 'proveedor-sin-hotel', label: 'Proveedor sin Hotel' }
];

function PersonalizacionFormularios({ user }) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoFondo, setSubiendoFondo] = useState(false);
  const [tab, setTab] = useState('eventos'); // 'eventos' o 'formularios'
  const [formularioSeleccionado, setFormularioSeleccionado] = useState(TIPOS_FORMULARIO[0].value);
  const [editorReady, setEditorReady] = useState(false);

  // Configuración de eventos (como ya tienes)
  const [configuracion, setConfiguracion] = useState({
    logoEmpresa: '',
    logoInfo: null,
    imagenFondo: '',
    fondoInfo: null,
    colorPrimario: '#3498db',
    colorSecundario: '#2c3e50',
    textoEncabezado: 'Red Acero - Registro de Eventos',
    textoDescripcion: 'Complete el formulario con sus datos',
    mostrarLogo: true,
    mostrarImagenFondo: true
  });

  // Configuración de formularios individuales
  const [configFormularios, setConfigFormularios] = useState({
    'socio': { notainicio: '', notafin: '', imageninicio: '' },
    'proveedor-con-hotel': { notainicio: '', notafin: '', imageninicio: '' },
    'proveedor-sin-hotel': { notainicio: '', notafin: '', imageninicio: '' }
  });

  // Configuración de mails
  const [mailConfig, setMailConfig] = useState({
    remitente: user.email,
    asunto: '',
    cuerpo: ''
  });

  // Cargar configuración existente
  useEffect(() => {
    cargarConfiguracion();
    cargarConfigFormularios();
  }, []);

  useEffect(() => {
    setEditorReady(true);
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const config = await FirebaseService.obtenerConfiguracionFormularios();
      if (config) setConfiguracion(config);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarConfigFormularios = async () => {
    try {
      const configs = await FirebaseService.obtenerConfiguracionesFormulariosTipos();
      // Espera un array de objetos con { tipoformulario, notainicio, notafin, imageninicio }
      const nuevo = { ...configFormularios };
      configs.forEach(cfg => {
        if (cfg.tipoformulario) {
          nuevo[cfg.tipoformulario] = {
            notainicio: cfg.notainicio || '',
            notafin: cfg.notafin || '',
            imageninicio: cfg.imageninicio || ''
          };
        }
      });
      setConfigFormularios(nuevo);
    } catch (error) {
      console.error('Error cargando configuración de formularios:', error);
    }
  };

  // Subir imagen de inicio para formulario
  const handleImagenInicioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ La imagen debe ser menor a 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setConfigFormularios(prev => ({
        ...prev,
        [formularioSeleccionado]: {
          ...prev[formularioSeleccionado],
          imageninicio: reader.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Guardar configuración de eventos
  const handleSubmitEventos = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await FirebaseService.guardarConfiguracionFormularios(configuracion);
      alert('✅ Configuración de eventos guardada exitosamente');
    } catch (error) {
      alert('❌ Error al guardar la configuración de eventos');
    } finally {
      setGuardando(false);
    }
  };

  // Guardar configuración de formulario individual
  const handleSubmitFormulario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const datos = {
        tipoformulario: formularioSeleccionado,
        ...configFormularios[formularioSeleccionado]
      };
      await FirebaseService.guardarConfiguracionFormularioTipo(datos);
      alert('✅ Configuración de formulario guardada exitosamente');
    } catch (error) {
      alert('❌ Error al guardar la configuración del formulario');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }
    if (file.size > 1024 * 1024) {
      alert('❌ El logo debe ser menor a 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setConfiguracion(prev => ({
        ...prev,
        logoEmpresa: reader.result,
        logoInfo: {
          originalName: file.name,
          sizeInMB: (file.size / 1024 / 1024).toFixed(2),
          mimeType: file.type
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFondoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ La imagen debe ser menor a 2MB');
      return;
    }
    setSubiendoFondo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setConfiguracion(prev => ({
        ...prev,
        imagenFondo: reader.result,
        fondoInfo: {
          originalName: file.name,
          sizeInMB: (file.size / 1024 / 1024).toFixed(2),
          mimeType: file.type
        }
      }));
      setSubiendoFondo(false);
    };
    reader.readAsDataURL(file);
  };

  const eliminarLogo = () => {
    setConfiguracion(prev => ({
      ...prev,
      logoEmpresa: '',
      logoInfo: null
    }));
  };

  const eliminarFondo = () => {
    setConfiguracion(prev => ({
      ...prev,
      imagenFondo: '',
      fondoInfo: null
    }));
  };

  const guardarMailConfig = async () => {
    try {
      setGuardando(true);
      console.log('mailConfig a guardar:', mailConfig); // <-- Verifica el objeto
      await FirebaseService.guardarConfiguracionMailEvento(mailConfig);
      alert('✅ Configuración de mail guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar la configuración de mail:', error); // <-- Log detallado
      alert('❌ Error al guardar la configuración de mail: ' + (error.message || error));
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando configuraciones...</p>
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['link', 'image'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  return (
    <div className="personalizacion-formularios">
      <div className="page-header">
        <h1>🎨 Personalizar</h1>
        <div className="tabs">
          <button
            className={tab === 'eventos' ? 'active' : ''}
            onClick={() => setTab('eventos')}
          >
            Eventos
          </button>
          <button
            className={tab === 'formularios' ? 'active' : ''}
            onClick={() => setTab('formularios')}
          >
            Formularios
          </button>
        </div>
      </div>

      {tab === 'eventos' && (
        <form onSubmit={handleSubmitEventos} className="config-form">
          {/* Sección de imágenes */}
          <div className="config-section">
            <h2>🖼️ Imágenes</h2>
            
            {/* Logo de empresa */}
            <div className="image-upload-section">
              <div className="section-header">
                <h3>📋 Logo de Empresa</h3>
                <div className="section-badges">
                  <span className="badge info">Base64</span>
                  <span className="badge success">Sin servidor</span>
                </div>
              </div>
              
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={subiendoLogo || guardando}
                  id="logo-upload"
                  className="file-input-hidden"
                />
                
                <label 
                  htmlFor="logo-upload" 
                  className={`btn-upload primary ${subiendoLogo ? 'loading' : ''}`}
                >
                  {subiendoLogo ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">📁</span>
                      <span>Seleccionar Logo</span>
                    </>
                  )}
                </label>

                {configuracion.logoEmpresa && (
                  <button 
                    type="button" 
                    onClick={eliminarLogo}
                    className="btn-delete"
                    disabled={guardando}
                  >
                    <span className="icon">🗑️</span>
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              {/* Preview del logo */}
              {configuracion.logoEmpresa && (
                <div className="image-preview">
                  <div className="preview-container">
                    <img 
                      src={configuracion.logoEmpresa} 
                      alt="Logo de empresa"
                      className="logo-preview"
                    />
                  </div>
                  
                  {configuracion.logoInfo && (
                    <div className="image-info">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">📁 Archivo:</span>
                          <span className="info-value">{configuracion.logoInfo.originalName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">📏 Tamaño:</span>
                          <span className="info-value">{configuracion.logoInfo.sizeInMB} MB</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">🎨 Formato:</span>
                          <span className="info-value">{configuracion.logoInfo.mimeType}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">💾 Almacenamiento:</span>
                          <span className="info-value">Base64 en Firestore</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="upload-info">
                <div className="info-card">
                  <div className="info-icon">💡</div>
                  <div className="info-content">
                    <p><strong>Almacenamiento Base64:</strong> La imagen se convierte a texto y se guarda directamente en Firestore</p>
                    <p><strong>Recomendaciones:</strong> Logo de 200x60px, formato PNG, máximo 500KB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Imagen de fondo */}
            <div className="image-upload-section">
              <div className="section-header">
                <h3>🌄 Imagen de Fondo</h3>
                <div className="section-badges">
                  <span className="badge info">Base64</span>
                  <span className="badge warning">Opcional</span>
                </div>
              </div>
              
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFondoUpload}
                  disabled={subiendoFondo || guardando}
                  id="fondo-upload"
                  className="file-input-hidden"
                />
                
                <label 
                  htmlFor="fondo-upload" 
                  className={`btn-upload secondary ${subiendoFondo ? 'loading' : ''}`}
                >
                  {subiendoFondo ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">🖼️</span>
                      <span>Seleccionar Fondo</span>
                    </>
                  )}
                </label>

                {configuracion.imagenFondo && (
                  <button 
                    type="button" 
                    onClick={eliminarFondo}
                    className="btn-delete"
                    disabled={guardando}
                  >
                    <span className="icon">🗑️</span>
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              {/* Preview de imagen de fondo */}
              {configuracion.imagenFondo && (
                <div className="image-preview">
                  <div className="preview-container fondo">
                    <img 
                      src={configuracion.imagenFondo} 
                      alt="Imagen de fondo"
                      className="fondo-preview"
                    />
                  </div>
                  
                  {configuracion.fondoInfo && (
                    <div className="image-info">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">📁 Archivo:</span>
                          <span className="info-value">{configuracion.fondoInfo.originalName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">📏 Tamaño:</span>
                          <span className="info-value">{configuracion.fondoInfo.sizeInMB} MB</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">🎨 Formato:</span>
                          <span className="info-value">{configuracion.fondoInfo.mimeType}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">💾 Almacenamiento:</span>
                          <span className="info-value">Base64 en Firestore</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="upload-info">
                <div className="info-card warning">
                  <div className="info-icon">⚠️</div>
                  <div className="info-content">
                    <p><strong>Atención:</strong> Las imágenes grandes aumentan el tiempo de carga</p>
                    <p><strong>Recomendación:</strong> Máximo 1MB, formato JPG optimizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resto de configuraciones */}
          <div className="config-section">
            <h2>🎨 Colores y Textos</h2>
--color-azul-oscuro: #453796;  
--color-azul-medio:  #5754a4;  
--color-azul-claro:  #6b66ae;   
--color-naranja:     #f68b2a;  
--color-gris:        #e7e7e8;  

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="colorPrimario">Color Primario</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="colorPrimario"
                    value={configuracion.colorPrimario}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, colorPrimario: e.target.value }))}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={configuracion.colorPrimario}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, colorPrimario: e.target.value }))}
                    className="color-text"
                    placeholder="#3498db"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="colorSecundario">Color Secundario</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="colorSecundario"
                    value={configuracion.colorSecundario}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, colorSecundario: e.target.value }))}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={configuracion.colorSecundario}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, colorSecundario: e.target.value }))}
                    className="color-text"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="textoEncabezado">Texto del Encabezado</label>
              <input
                type="text"
                id="textoEncabezado"
                value={configuracion.textoEncabezado}
                onChange={(e) => setConfiguracion(prev => ({ ...prev, textoEncabezado: e.target.value }))}
                placeholder="Red Acero - Registro de Eventos"
                className="text-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="textoDescripcion">Texto de Descripción</label>
              <input
                type="text"
                id="textoDescripcion"
                value={configuracion.textoDescripcion}
                onChange={(e) => setConfiguracion(prev => ({ ...prev, textoDescripcion: e.target.value }))}
                placeholder="Complete el formulario con sus datos"
                className="text-input"
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={configuracion.mostrarLogo}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, mostrarLogo: e.target.checked }))}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label-text">Mostrar Logo en el Formulario</span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={configuracion.mostrarImagenFondo}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, mostrarImagenFondo: e.target.checked }))}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label-text">Mostrar Imagen de Fondo en el Formulario</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={guardando} 
              className="btn-primary"
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      )}

      {tab === 'formularios' && (
        <form onSubmit={handleSubmitFormulario} className="config-form">
          <div className="config-section">
            <h2>📝 Personalización de Formularios</h2>
            <div className="form-group">
              <label>Tipo de Formulario</label>
              <select
                value={formularioSeleccionado}
                onChange={e => setFormularioSeleccionado(e.target.value)}
                disabled={guardando}
              >
                {TIPOS_FORMULARIO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nota de Inicio</label>
              <textarea
                value={configFormularios[formularioSeleccionado]?.notainicio || ''}
                onChange={e =>
                  setConfigFormularios(prev => ({
                    ...prev,
                    [formularioSeleccionado]: {
                      ...prev[formularioSeleccionado],
                      notainicio: e.target.value
                    }
                  }))
                }
                rows={3}
                disabled={guardando}
              />
            </div>
            <div className="form-group">
              <label>Nota de Fin</label>
              <textarea
                value={configFormularios[formularioSeleccionado]?.notafin || ''}
                onChange={e =>
                  setConfigFormularios(prev => ({
                    ...prev,
                    [formularioSeleccionado]: {
                      ...prev[formularioSeleccionado],
                      notafin: e.target.value
                    }
                  }))
                }
                rows={3}
                disabled={guardando}
              />
            </div>
            <div className="form-group">
              <label>Imagen de Inicio</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenInicioUpload}
                disabled={guardando}
              />
              {configFormularios[formularioSeleccionado]?.imageninicio && (
                <div className="image-preview">
                  <img
                    src={configFormularios[formularioSeleccionado].imageninicio}
                    alt="Imagen de inicio"
                    style={{ maxWidth: 200, maxHeight: 100, marginTop: 8 }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfigFormularios(prev => ({
                        ...prev,
                        [formularioSeleccionado]: {
                          ...prev[formularioSeleccionado],
                          imageninicio: ''
                        }
                      }))
                    }
                    disabled={guardando}
                    style={{ marginLeft: 12 }}
                  >
                    Quitar Imagen
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              disabled={guardando}
              className="btn-primary"
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      )}

      <div className="seccion-formulario" style={{ marginTop: '2rem' }}>
        <h3>✉️ Configuración de Mails para el Evento</h3>
        <div className="campo-grupo">
          <label>Remitente</label>
          <input
            type="email"
            value={mailConfig.remitente || user.email}
            onChange={e => setMailConfig({ ...mailConfig, remitente: e.target.value })}
            placeholder="Remitente"
            required
          />
          <small>Por defecto es tu email de usuario.</small>
        </div>
        <div className="campo-grupo">
          <label>Asunto</label>
          <input
            type="text"
            value={mailConfig.asunto || ''}
            onChange={e => setMailConfig({ ...mailConfig, asunto: e.target.value })}
            placeholder="Asunto del mail"
            required
          />
        </div>
        <div className="campo-grupo">
          <label>Cuerpo del Mail</label>
          {editorReady && (
            <ReactQuill
              value={mailConfig.cuerpo || ''}
              onChange={value => setMailConfig({ ...mailConfig, cuerpo: value })}
              theme="snow"
              modules={modules}
              style={{ background: 'white', minHeight: 180 }}
            />
          )}
          <small>Puedes escribir texto, pegar URLs o insertar imágenes (usa el botón de imagen del editor).</small>
        </div>
        <button
          className="btn-primario"
          onClick={guardarMailConfig}
          type="button"
          style={{ marginTop: '1rem' }}
        >
          Guardar configuración de mail
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>Ocurrió un error al cargar el editor.</div>;
    }
    return this.props.children;
  }
}

export default PersonalizacionFormularios;