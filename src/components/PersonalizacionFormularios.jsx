import { useState, useEffect } from 'react';
// import { ImageUploadService } from '../services/ImageUploadService'; // ❌ ELIMINAR ESTA LÍNEA
import { FirebaseService } from '../services/FirebaseService';
import './PersonalizacionFormularios.css';

function PersonalizacionFormularios({ user }) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoFondo, setSubiendoFondo] = useState(false);

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
  
  // Cargar configuración existente
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const config = await FirebaseService.obtenerConfiguracionFormularios();
      if (config) {
        setConfiguracion(config);
        console.log('✅ Configuración cargada:', config);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Obtener información de imagen
  const getImageInfo = (file, base64) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      originalName: file.name,
      size: file.size,
      sizeInMB: sizeInMB,
      type: file.type,
      base64Length: base64.length
    };
  };

  // Subir logo de empresa
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB máximo
      alert('❌ La imagen debe ser menor a 2MB');
      return;
    }

    setSubiendoLogo(true);
    try {
      console.log('📤 Procesando logo...', file.name);
      
      const base64 = await fileToBase64(file);
      const logoInfo = getImageInfo(file, base64);
      
      setConfiguracion(prev => ({
        ...prev,
        logoEmpresa: base64, // Guardar base64 directamente
        logoInfo: logoInfo
      }));

      console.log('✅ Logo procesado exitosamente');
      alert('✅ Logo cargado exitosamente');
    } catch (error) {
      console.error('❌ Error procesando logo:', error);
      alert(`❌ Error cargando logo: ${error.message}`);
    } finally {
      setSubiendoLogo(false);
      event.target.value = ''; // Limpiar input
    }
  };

  // Subir imagen de fondo
  const handleFondoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }

    if (file.size > 3 * 1024 * 1024) { // 3MB máximo
      alert('❌ La imagen debe ser menor a 3MB');
      return;
    }

    setSubiendoFondo(true);
    try {
      console.log('📤 Procesando imagen de fondo...', file.name);
      
      const base64 = await fileToBase64(file);
      const fondoInfo = getImageInfo(file, base64);
      
      setConfiguracion(prev => ({
        ...prev,
        imagenFondo: base64, // Guardar base64 directamente
        fondoInfo: fondoInfo
      }));

      console.log('✅ Imagen de fondo procesada exitosamente');
      alert('✅ Imagen de fondo cargada exitosamente');
    } catch (error) {
      console.error('❌ Error procesando imagen de fondo:', error);
      alert(`❌ Error cargando imagen: ${error.message}`);
    } finally {
      setSubiendoFondo(false);
      event.target.value = ''; // Limpiar input
    }
  };

  // Eliminar logo
  const eliminarLogo = () => {
    if (window.confirm('¿Está seguro de que desea eliminar el logo?')) {
      setConfiguracion(prev => ({
        ...prev,
        logoEmpresa: '',
        logoInfo: null
      }));
      alert('✅ Logo eliminado exitosamente');
    }
  };

  // Eliminar imagen de fondo
  const eliminarFondo = () => {
    if (window.confirm('¿Está seguro de que desea eliminar la imagen de fondo?')) {
      setConfiguracion(prev => ({
        ...prev,
        imagenFondo: '',
        fondoInfo: null
      }));
      alert('✅ Imagen de fondo eliminada exitosamente');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      console.log('💾 Guardando configuración...', configuracion);
      await FirebaseService.guardarConfiguracionFormularios(configuracion);
      console.log('✅ Configuración guardada exitosamente');
      alert('✅ Configuración guardada exitosamente');
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      alert('❌ Error al guardar la configuración');
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

  return (
    <div className="personalizacion-formularios">
      <div className="page-header">
        <h1>🎨 Personalización de Formularios</h1>
        <p>Configure la apariencia visual de los formularios de eventos</p>
      </div>

      <form onSubmit={handleSubmit} className="config-form">
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

      {/* Vista previa */}
      <div className="config-preview">
        <h2>👀 Vista Previa</h2>
        <div 
          className="formulario-preview"
          style={{
            backgroundImage: configuracion.imagenFondo ? `url(${configuracion.imagenFondo})` : 'none',
            backgroundColor: configuracion.colorSecundario
          }}
        >
          {configuracion.mostrarLogo && configuracion.logoEmpresa && (
            <img 
              src={configuracion.logoEmpresa} 
              alt="Logo"
              className="preview-logo"
            />
          )}
          
          <div 
            className="preview-header"
            style={{ color: configuracion.colorPrimario }}
          >
            <h3>{configuracion.textoEncabezado}</h3>
            <p>{configuracion.textoDescripcion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalizacionFormularios;