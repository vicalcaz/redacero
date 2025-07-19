// Crear archivo: src/components/common/SubirImagen.jsx

import { useState } from 'react';
import './SubirImagen.css';

function SubirImagen({ onImagenSeleccionada, imagenActual = null }) {
  const [previsualizacion, setPrevisualizacion] = useState(imagenActual);
  const [procesando, setProcesando] = useState(false);

  const convertirABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const manejarSeleccionArchivo = async (event) => {
    const archivo = event.target.files[0];
    
    if (!archivo) return;

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      alert('❌ Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG)');
      return;
    }

    // Validar tamaño (máximo 2MB para mejor rendimiento)
    if (archivo.size > 2 * 1024 * 1024) {
      alert('❌ La imagen es muy grande. Máximo 2MB permitido');
      return;
    }

    try {
      setProcesando(true);
      console.log('📷 Convirtiendo imagen a base64...');
      
      const imagenBase64 = await convertirABase64(archivo);
      
      console.log('✅ Imagen convertida a base64, tamaño:', imagenBase64.length);
      setPrevisualizacion(imagenBase64);
      
      // Notificar al componente padre
      if (onImagenSeleccionada) {
        onImagenSeleccionada(imagenBase64);
      }
      
    } catch (error) {
      console.error('❌ Error convirtiendo imagen:', error);
      alert('❌ Error procesando la imagen');
    } finally {
      setProcesando(false);
    }
  };

  const eliminarImagen = () => {
    setPrevisualizacion(null);
    if (onImagenSeleccionada) {
      onImagenSeleccionada(null);
    }
    // Limpiar el input
    const input = document.getElementById('imagen-evento');
    if (input) input.value = '';
  };

  return (
    <div className="subir-imagen">
      <label className="subir-imagen-label">📷 Imagen del Evento</label>
      
      {!previsualizacion ? (
        <div className="upload-area">
          <input
            type="file"
            id="imagen-evento"
            accept="image/*"
            onChange={manejarSeleccionArchivo}
            disabled={procesando}
            style={{ display: 'none' }}
          />
          
          <label htmlFor="imagen-evento" className="upload-label">
            {procesando ? (
              <div className="processing">
                <span className="spinner">⏳</span>
                <span>Procesando imagen...</span>
              </div>
            ) : (
              <div className="upload-content">
                <span className="upload-icon">📷</span>
                <span className="upload-text">Haz clic para seleccionar imagen</span>
                <span className="upload-hint">PNG, JPG, JPEG (máx. 2MB)</span>
              </div>
            )}
          </label>
        </div>
      ) : (
        <div className="previsualizacion">
          <div className="imagen-container">
            <img 
              src={previsualizacion} 
              alt="Vista previa del evento" 
              className="imagen-preview"
            />
            <button 
              onClick={eliminarImagen}
              className="btn-eliminar-imagen"
              type="button"
            >
              🗑️
            </button>
          </div>
          <p className="preview-info">✅ Imagen seleccionada correctamente</p>
        </div>
      )}
    </div>
  );
}

export default SubirImagen;