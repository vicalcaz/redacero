# 🔴 Eventos Red Acero

Sistema de gestión de eventos para Red Acero, desarrollado con React y Firebase.

## 📋 Descripción

Aplicación web para administrar eventos, usuarios y formularios de inscripción de Red Acero. Permite gestionar diferentes tipos de participantes (Socios, Proveedores con hotel, Proveedores sin hotel) con formularios específicos para cada categoría.

## 🚀 Características

- **Gestión de Usuarios**: Crear, editar y eliminar usuarios con diferentes perfiles
- **Administración de Eventos**: Crear y gestionar eventos con fechas y tipos de formulario
- **Formularios Dinámicos**: Tres tipos de formularios personalizados:
  - Formulario para Socios
  - Formulario para Proveedores con Hotel
  - Formulario para Proveedores sin Hotel
- **Autenticación**: Sistema de login seguro
- **Base de datos en tiempo real**: Sincronización automática con Firebase

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Styling**: CSS personalizado
- **Hosting**: Firebase Hosting

## 📦 Instalación

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

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
   - Habilitar Firestore Database
   - Habilitar Authentication
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
│   ├── Login.jsx
│   ├── Login.css
│   ├── UserManagement.jsx
│   ├── UserManagement.css
│   ├── EventManagement.jsx
│   ├── EventManagement.css
│   ├── FormularioManagement.jsx
│   └── FormularioManagement.css
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
- Administración de eventos
- Acceso a todos los formularios

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

## 🚀 Despliegue

### Firebase Hosting

1. **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Iniciar sesión**
```bash
firebase login
```

3. **Inicializar proyecto**
```bash
firebase init hosting
```

4. **Construir y desplegar**
```bash
npm run build
firebase deploy
```

## 🧪 Scripts disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar linter

## 📊 Formularios

### Campos comunes
- Datos de empresa (dirección, ciudad, web, código postal, rubro)
- Datos personales (nombre, apellido, cargo, contacto, DNI)
- Check-in/out (fechas y horas de llegada/salida)
- Acreditaciones (días de evento)
- Cena de cierre
- Agenda de reuniones

### Campos específicos

**Proveedores con Hotel:**
- Tipo de habitación
- Cantidad de noches
- Número de acompañantes

**Proveedores sin Hotel:**
- Transporte propio
- Alojamiento externo

## 🔧 Configuración de desarrollo

### Variables de entorno requeridas
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Reglas de Firestore para producción
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      allow read, write: if request.auth != null;
    }
    match /eventos/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.perfil == 'Administrador';
    }
    match /formularios/{formularioId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🐛 Solución de problemas

### Error: Firebase not initialized
- Verificar que las variables de entorno estén configuradas
- Comprobar que el archivo `.env` esté en la raíz del proyecto
- Reiniciar el servidor de desarrollo

### Error: Firestore rules
- Verificar que las reglas de Firestore permitan acceso
- Comprobar que la base de datos esté creada

### Error: Invalid API key
- Verificar que la API key sea correcta
- Comprobar que el proyecto Firebase esté activo

## 📝 Licencia

Este proyecto es privado y pertenece a Red Acero.

## 👨‍💻 Desarrollador

Desarrollado para Red Acero - Sistema de gestión de eventos.

---

Para soporte técnico o consultas, contactar al administrador del sistema.
