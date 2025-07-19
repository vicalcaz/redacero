import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar multer para guardar en public/images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'formularios';
    const uploadPath = path.join(process.cwd(), 'public', 'images', folder);
    
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = req.body.fileName || `${Date.now()}_${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Endpoint para subir imagen
export const uploadImage = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Error subiendo imagen:', err);
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se subió ningún archivo' 
      });
    }

    const folder = req.body.folder || 'formularios';
    const publicUrl = `/images/${folder}/${req.file.filename}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
  });
};

// Endpoint para eliminar imagen
export const deleteImage = (req, res) => {
  try {
    const { filename, folder = 'formularios' } = req.body;
    
    if (!filename) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre de archivo requerido' 
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'images', folder, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Imagen eliminada exitosamente' });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Archivo no encontrado' 
      });
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};