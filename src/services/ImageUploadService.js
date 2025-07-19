export const ImageUploadService = {
  // Subir imagen a la carpeta public/images
  subirImagenLocal: async (file, carpeta = 'formularios') => {
    try {
      if (!file) {
        throw new Error('No se seleccionó ningún archivo');
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Generar nombre único para la imagen
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop().toLowerCase();
      const nombreArchivo = `${carpeta}_${timestamp}_${randomString}.${extension}`;

      // Crear FormData para enviar al servidor
      const formData = new FormData();
      formData.append('image', file);
      formData.append('fileName', nombreArchivo);
      formData.append('folder', carpeta);

      // Enviar al endpoint local (necesitaremos crear este endpoint)
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Retornar la URL pública de la imagen
      return {
        success: true,
        url: `/images/${carpeta}/${nombreArchivo}`,
        filename: nombreArchivo,
        path: result.path
      };

    } catch (error) {
      console.error('Error subiendo imagen local:', error);
      throw error;
    }
  },

  // Eliminar imagen local
  eliminarImagenLocal: async (filename, carpeta = 'formularios') => {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filename, 
          folder: carpeta 
        })
      });

      if (!response.ok) {
        throw new Error(`Error eliminando imagen: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      throw error;
    }
  },

  // Validar imagen existente
  validarImagenExistente: async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};