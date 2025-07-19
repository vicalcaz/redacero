# 🔴 Eventos Red Acero

Sistema de gestión de eventos para Red Acero, desarrollado con React y Firebase.

## 📋 Descripción

Aplicación web para administrar eventos, usuarios y formularios de inscripción de Red Acero. Permite gestionar diferentes tipos de participantes (Socios, Proveedores con hotel, Proveedores sin hotel) con formularios específicos para cada categoría.

## 🚀 Características

- **Gestión de Usuarios**: Crear, editar y eliminar usuarios con diferentes perfiles
- **Administración de Eventos**: Crear y gestionar eventos con fechas y tipos de formulario
- **Eventos Destacados**: Sistema de marcado de eventos importantes con visualización preferente
- **Formularios Dinámicos**: Tres tipos de formularios personalizados:
  - Formulario para Socios
  - Formulario para Proveedores con Hotel
  - Formulario para Proveedores sin Hotel
- **Autenticación**: Sistema de login seguro
- **Base de datos en tiempo real**: Sincronización automática con Firebase
- **Gestión de Imágenes**: Sistema simplificado exclusivamente con URLs externas

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Imágenes**: URLs externas únicamente (ImgBB, Cloudinary, Unsplash)
- **Styling**: CSS personalizado
- **Hosting**: Firebase Hosting

## 📦 Instalación

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase
- *(No requiere Firebase Storage)*

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/redacero-eventos.git
cd redacero-eventos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar **Firestore Database** únicamente
   - Habilitar **Authentication**
   - **NO es necesario habilitar Storage**
   - Obtener credenciales de configuración

4. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz del proyecto:
```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

5. **Configurar reglas de Firestore**
   
   En Firebase Console > Firestore Database > Reglas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Para desarrollo
    }
  }
}
```

6. **Ejecutar la aplicación**
```bash
npm run dev
```

## 🔑 Acceso por defecto

- **Email**: `marvicalcazar@yahoo.com.ar`
- **Contraseña**: `redacero`

El usuario administrador se crea automáticamente la primera vez que se ejecuta la aplicación.

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── formularios/
│   │   ├── FormularioBase.css
│   │   ├── FormularioSocio.jsx
│   │   ├── FormularioProveedorConHotel.jsx
│   │   └── FormularioProveedorSinHotel.jsx
│   ├── AdminNavbar.jsx
│   ├── AdminNavbar.css
│   ├── EventosDestacados.jsx
│   ├── Login.jsx
│   ├── Login.css
│   ├── UserManagement.jsx
│   ├── UserManagement.css
│   ├── EventManagement.jsx
│   ├── EventManagement.css
│   ├── FormularioManagement.jsx
│   ├── FormularioManagement.css
│   └── PersonalizacionFormularios.jsx
├── firebase/
│   └── config.js
├── services/
│   └── FirebaseService.js
├── models/
│   └── Usuario.js
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## 👥 Tipos de Usuario

### Administrador
- Gestión completa de usuarios
- Administración de eventos y eventos destacados
- Acceso a todos los formularios
- Personalización de formularios

### Socios
- Acceso al formulario específico para socios
- Información básica de empresa y personas

### Proveedores con Hotel
- Formulario con campos de alojamiento
- Gestión de habitaciones y noches
- Información de acompañantes

### Proveedores sin Hotel
- Formulario sin campos de alojamiento
- Campos de transporte propio
- Información de alojamiento externo

## 🖼️ Gestión de Imágenes con ImgBB Integrado

La aplicación incluye **integración directa con ImgBB** para subir imágenes de forma automática y obtener URLs instantáneas.

### 🚀 Funcionalidad de subida automática:

#### **Subir imagen directamente a ImgBB:**
1. **Hacer clic en "Subir imagen a ImgBB"**
2. **Seleccionar archivo** desde tu dispositivo
3. **Subida automática** - La imagen se sube a ImgBB
4. **URL automática** - El campo se llena automáticamente
5. **Preview instantáneo** - Ver la imagen inmediatamente

### 🎯 Ventajas de la integración ImgBB:
- ✅ **Un solo clic** - Proceso completamente automatizado
- ✅ **Sin registro** - No necesitas cuenta en ImgBB
- ✅ **URLs permanentes** - Las imágenes no se borran
- ✅ **Hasta 32MB** - Límite generoso de tamaño
- ✅ **CDN rápido** - Carga optimizada globalmente
- ✅ **Gratuito ilimitado** - Sin restricciones de uso

### 🔧 Características técnicas:
- **API directa**: Integración con ImgBB API
- **Subida asíncrona**: No bloquea la interfaz
- **Validación automática**: Verifica tipos de archivo
- **Gestión de errores**: Mensajes claros si hay problemas
- **Indicador de progreso**: Muestra estado de subida
- **Fallback manual**: Opción de URL manual siempre disponible

### 📱 Opciones disponibles:

1. **🚀 Subida automática a ImgBB** (Recomendado)
   - Seleccionar archivo → Subida automática
   - URL se genera automáticamente
   - Preview instantáneo

2. **✏️ URL manual**
   - Pegar cualquier URL de imagen
   - Funciona con cualquier servicio
   - Validación automática

3. **🌐 Servicios externos**
   - Cloudinary para uso profesional
   - Unsplash para imágenes stock
   - Acceso directo desde la interfaz

4. **🖼️ Galería de ejemplos**
   - Imágenes temáticas pre-seleccionadas
   - Un clic para usar
   - Perfecto para testing

### 📏 Especificaciones de ImgBB:
- **Formatos soportados**: JPG, PNG, GIF, WebP, BMP
- **Tamaño máximo**: 32MB por imagen
- **URLs generadas**: Permanentes y sin caducidad
- **CDN**: Distribución global para carga rápida
- **Tiempo de subida**: Típicamente 2-5 segundos

## ⭐ Sistema de Eventos Destacados

### Funcionalidades:
- **Marcado simple** con checkbox o botón estrella
- **Visualización especial** con efectos dorados
- **Filtrado automático** en página de inicio
- **Toggle instantáneo** desde la lista
- **Indicadores visuales** elegantes

## 🚀 Despliegue

### Firebase Hosting (Solo Firestore)

1. **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Inicializar (solo Hosting)**
```bash
firebase init hosting
# Seleccionar solo "Hosting"
# NO seleccionar "Storage"
```

3. **Desplegar**
```bash
npm run build
firebase deploy
```

## 🔧 Configuración mínima

### Variables de entorno (Storage no requerido)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET= # Opcional, no usado
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 🐛 Solución de problemas

### Problemas con imágenes (Solo URLs)
- **Imagen no se muestra**: 
  - ✅ Usar ImgBB para URLs directas
  - ✅ Verificar que la URL sea accesible públicamente
  - ✅ Probar con las URLs de ejemplo incluidas
  
- **Error de CORS**: 
  - ✅ ImgBB no tiene restricciones CORS
  - ✅ Evitar Google Drive o servicios privados
  
- **URL no válida**: 
  - ✅ Usar los servicios recomendados (detección automática)
  - ✅ Verificar que la URL funcione en el navegador

### Servicios recomendados por problema:
- **Para desarrollo**: URLs de ejemplo incluidas
- **Para producción**: ImgBB (gratuito) o Cloudinary (profesional)
- **Para stock**: Unsplash con términos "construction", "architecture"
- **Para máxima velocidad**: Cloudinary con CDN

## 📝 Notas importantes

### ❌ Lo que NO se incluye:
- Firebase Storage (eliminado completamente)
- Subida de archivos locales
- Gestión de permisos de Storage
- Configuración de Storage

### ✅ Lo que SÍ incluye:
- URLs externas exclusivamente
- Herramientas integradas de hosting
- Validación automática de URLs
- Preview en tiempo real
- Ejemplos temáticos listos

## 👨‍💻 Desarrollador

Desarrollado para Red Acero - Sistema de gestión de eventos.

**Versión actual**: Sistema simplificado sin Firebase Storage, usando exclusivamente URLs externas para máxima compatibilidad.

---

Para soporte técnico o consultas, contactar al administrador del sistema.
