
  
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';

class FirebaseServiceClass {
  // ...existing methods...

  // Obtener todos los formularios de un evento
  async obtenerFormulariosPorEvento(eventoId) {
    try {
      if (!eventoId) throw new Error('eventoId es obligatorio');
      const q = query(collection(db, 'formularios'), where('eventoId', '==', eventoId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo formularios por evento:', error);
      throw error;
    }
  }
    // Obtener un evento por su ID
    async obtenerEventoPorId(id) {
      try {
        if (!id) throw new Error('ID de evento requerido');
        const docRef = doc(db, 'eventos', String(id));
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Evento no encontrado');
        return { id: docSnap.id, ...docSnap.data() };
      } catch (error) {
        console.error('❌ FirebaseService: Error obteniendo evento por ID:', error);
        throw error;
      }
    }
    
  // Eliminar todos los usuarios creados hoy
  async eliminarUsuariosCreadosHoy() {
    try {
      const hoy = new Date();
      const hoyISO = hoy.toISOString().slice(0, 10); // yyyy-mm-dd
      const q = query(collection(db, 'usuarios'));
      const snapshot = await getDocs(q);
      let eliminados = 0;
    for (const docSnap of snapshot.docs) {
      const fecha = docSnap.data().fechaCreacion;
      if (fecha && fecha.startsWith(hoyISO)) {
        await deleteDoc(doc(db, 'usuarios', docSnap.id));
        eliminados++;
      }
    }
    console.log(`✅ Usuarios eliminados hoy: ${eliminados}`);
    return eliminados;
  } catch (error) {
    console.error('❌ Error eliminando usuarios creados hoy:', error);
    throw error;
  }
}
  // Eliminar formulario por ID
  async eliminarFormulario(id) {
    try {
      if (!id) throw new Error('ID de formulario requerido');
      await deleteDoc(doc(db, 'formularios', id));
      console.log('✅ Formulario eliminado:', id);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando formulario:', error);
      throw error;
    }
  }

  // Actualizar formulario genérico
  async actualizarFormulario(coleccion, id, data) {
    try {
      const docRef = doc(db, coleccion, String(id));
        await updateDoc(docRef, {
        ...data,
        fechaActualizacion: new Date().toISOString(),
        fechaActualizacionString: new Date().toLocaleString('es-AR')
      });
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error actualizando formulario:', error);
      throw error;
    }
  }
  // --- Newsletter: Asociación y estado mail-usuario-evento ---
  async asociarMailAUsuarioEvento({ usuarioId, mailId, eventoId, usuario, mail }) {
    // Guarda o actualiza la asociación en la colección 'mailUsuarioEvento'
    if (!usuarioId || !mailId || !eventoId) throw new Error('usuarioId, mailId y eventoId son obligatorios');
    const ref = doc(db, 'mailUsuarioEvento', `${usuarioId}_${eventoId}`);
    await setDoc(ref, {
      usuarioId,
      usuario: usuario || '',
      eventoId,
      mailId,
      mail: mail || '',
      mailasociado: true,
      mailenviado: false,
      fechaenvio: null,
      mailleido: false,
      fechaleido: null
    }, { merge: true });
    return true;
  }

  async obtenerAsociacionesMailUsuarioEvento(eventoId) {
    // Devuelve [{usuarioId, mailId, eventoId, ...}]
    const q = eventoId
      ? query(collection(db, 'mailUsuarioEvento'), where('eventoId', '==', eventoId))
      : collection(db, 'mailUsuarioEvento');
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }

  // Marcar mail como enviado
  async marcarMailEnviadoUsuarioEvento({ usuarioId, eventoId }) {
    if (!usuarioId || !eventoId) throw new Error('usuarioId y eventoId son obligatorios');
    const ref = doc(db, 'mailUsuarioEvento', `${usuarioId}_${eventoId}`);
    await updateDoc(ref, {
      mailenviado: true,
      fechaenvio: new Date().toISOString()
    });
    return true;
  }

  // Marcar mail como leído
  async marcarMailLeidoUsuarioEvento({ usuarioId, eventoId }) {
    if (!usuarioId || !eventoId) throw new Error('usuarioId y eventoId son obligatorios');
    const ref = doc(db, 'mailUsuarioEvento', `${usuarioId}_${eventoId}`);
    await updateDoc(ref, {
      mailleido: true,
      fechaleido: new Date().toISOString()
    });
    return true;
  }
  // Inicializar datos por defecto
  async inicializarDatos() {
    try {
      console.log('🔥 FirebaseService: Inicializando datos por defecto...');
      
      // Verificar si ya existe un usuario admin
      const usuarios = await this.obtenerUsuarios();
      
      if (usuarios.length === 0) {
        console.log('👤 No hay usuarios, creando admin por defecto...');
        
        // Crear usuario admin por defecto SOLO si no hay usuarios
await this.crearUsuario({
  rol: 'admin',
  activo: true,
  passwordCambiado: false, // Deberá cambiar en primer login
  fechaCreacion: new Date().toISOString()
});
        
      console.log('✅ Usuario admin por defecto creado: admin@redacero.com / reacero');
    } else {
      console.log('👥 Ya existen usuarios en la base de datos. No se crea admin automático.');
    }
    
    console.log('✅ FirebaseService: Inicialización completada');
  } catch (error) {
    console.error('❌ FirebaseService: Error inicializando datos:', error);
    throw error;
  }
}

  // MÉTODOS DE USUARIOS
  async crearUsuario(userData) {
    try {
      console.log('🔥 FirebaseService: Creando nuevo usuario:', userData.email);
      
      if (!userData.email || !userData.password) {
        throw new Error('Email y contraseña son obligatorios');
      }
      
      // Verificar si el email ya existe
      const usuarioExistente = await this.obtenerUsuarioPorEmail(userData.email);
      if (usuarioExistente) {
        throw new Error('Ya existe un usuario con este email');
      }
      
      const nuevoUsuario = {
        ...userData,
        email: userData.email.toLowerCase().trim(),
        fechaCreacion: new Date().toISOString(),
        fechaCreacionString: new Date().toLocaleString('es-AR'),
        passwordCambiado: false, // Nuevo usuario debe cambiar password
        cantidadLogins: 0,
        activo: userData.activo !== undefined ? userData.activo : true
      };
      
      const docRef = await addDoc(collection(db, 'usuarios'), nuevoUsuario);
      console.log('✅ FirebaseService: Usuario creado con ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error creando usuario:', error);
      throw error;
    }
  }

  async obtenerUsuarios() {
    try {
      console.log('🔥 FirebaseService: Obteniendo usuarios...');
      
      const q = query(collection(db, 'usuarios'), orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      const usuarios = [];
      
      querySnapshot.forEach((doc) => {
        usuarios.push({
          id: doc.id,
          nombre: doc.data().nombre,
          email: doc.data().email,
          empresa: doc.data().empresa || '',
          password: doc.data().password, // ✅ Solo para desarrollo
          rol: doc.data().rol,
          activo: doc.data().activo,
          passwordCambiado: doc.data().passwordCambiado, // ✅ Solo este campo
          fechaCreacion: doc.data().fechaCreacion,
          cantidadLogins: doc.data().cantidadLogins,
          fechaUltimoLogin: doc.data().fechaUltimoLogin
        });
      });
      
      console.log('✅ FirebaseService: Usuarios obtenidos:', usuarios.length);
      return usuarios;
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo usuarios:', error);
      throw error;
    }
  }

  async obtenerUsuarioPorEmail(email) {
    try {
      console.log('🔥 FirebaseService: Buscando usuario por email:', email);
      
      if (!email) {
        throw new Error('Email es obligatorio');
      }
      
      const q = query(
        collection(db, 'usuarios'), 
        where('email', '==', email.toLowerCase().trim()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('⚠️ FirebaseService: Usuario no encontrado');
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      
      const userData = {
        id: userDoc.id,
        nombre: userDoc.data().nombre,
        email: userDoc.data().email,
        empresa: userDoc.data().empresa || '',
        password: userDoc.data().password, // ✅ Solo para desarrollo
        rol: userDoc.data().rol,
        activo: userDoc.data().activo,
        passwordCambiado: userDoc.data().passwordCambiado, // ✅ Solo este campo
        fechaCreacion: userDoc.data().fechaCreacion,
        cantidadLogins: userDoc.data().cantidadLogins,
        fechaUltimoLogin: userDoc.data().fechaUltimoLogin
      };
      console.log('✅ FirebaseService: Usuario encontrado:', userData.email);
      return userData;
      
    } catch (error) {
      console.error('❌ FirebaseService: Error buscando usuario:', error);
      throw error;
    }
  }

  async obtenerUsuarioPorId(id) {
    try {
      console.log('🔍 FirebaseService: Obteniendo usuario por ID:', id);
      
      if (!id) {
        throw new Error('ID de usuario es obligatorio');
      }

      const usuarioRef = doc(db, 'usuarios', id);
      const usuarioDoc = await getDoc(usuarioRef);

      if (!usuarioDoc.exists()) {
        console.log('❌ FirebaseService: Usuario no encontrado');
        return null;
      }

      const userData = {
        id: usuarioDoc.id,
        nombre: usuarioDoc.data().nombre,
        email: usuarioDoc.data().email,
        password: usuarioDoc.data().password,
        rol: usuarioDoc.data().rol,
        activo: usuarioDoc.data().activo,
        passwordCambiado: usuarioDoc.data().passwordCambiado,
        fechaCreacion: usuarioDoc.data().fechaCreacion,
        cantidadLogins: usuarioDoc.data().cantidadLogins,
        fechaUltimoLogin: usuarioDoc.data().fechaUltimoLogin
      };

      console.log('✅ FirebaseService: Usuario encontrado:', {
        id: userData.id,
        email: userData.email,
        passwordCambiado: userData.passwordCambiado
    });

    return userData;
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo usuario por ID:', error);
      throw error;
    }
  }

  async actualizarUsuario(id, userData) {
    try {
      console.log('🔥 FirebaseService: Actualizando usuario:', id);
      
      if (!id) {
        throw new Error('ID del usuario es obligatorio');
      }
      
      const usuarioRef = doc(db, 'usuarios', id);
      await updateDoc(usuarioRef, {
        ...userData,
        fechaActualizacion: new Date().toISOString(),
        fechaActualizacionString: new Date().toLocaleString('es-AR')
      });
      
      console.log('✅ FirebaseService: Usuario actualizado exitosamente');
      return id;
    } catch (error) {
      console.error('❌ FirebaseService: Error actualizando usuario:', error);
      throw error;
    }
  }

  async eliminarUsuario(id) {
    try {
      console.log('🔥 FirebaseService: Eliminando usuario:', id);
      
      if (!id) {
        throw new Error('ID del usuario es obligatorio');
      }
      
      await deleteDoc(doc(db, 'usuarios', id));
      console.log('✅ FirebaseService: Usuario eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error eliminando usuario:', error);
      throw error;
    }
  }

  // MÉTODOS DE EVENTOS
  async crearEvento(eventoData) {
    try {
      console.log('🔥 FirebaseService: Creando evento:', eventoData);

      if (!eventoData.nombre) {
        throw new Error('El nombre del evento es obligatorio');
      }

      const docRef = await addDoc(collection(db, 'eventos'), {
        nombre: eventoData.nombre,
        descripcion: eventoData.descripcion,
        fechaDesde: eventoData.fechaDesde,
        fechaHasta: eventoData.fechaHasta,
        fechaLimiteEdicion: eventoData.fechaLimiteEdicion, // 👈 nueva propiedad
        ubicacion: eventoData.ubicacion,
        estado: eventoData.estado,
        destacado: eventoData.destacado,
        imagenBase64: eventoData.imagenBase64 || null, // 👈 guardar imagen en base64
        fechaCreacion: new Date().toISOString(),
        fechaCreacionString: new Date().toLocaleString('es-AR')
      });

      console.log('✅ FirebaseService: Evento creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error creando evento:', error);
      throw error;
    }
  }

  async actualizarEvento(id, eventoData) {
    try {
      console.log('🔥 FirebaseService: Actualizando evento:', id, eventoData);

      if (!id) {
        throw new Error('ID del evento es obligatorio para actualizar');
      }

      const eventoRef = doc(db, 'eventos', id);
      // Si estado es undefined, asignar 'planificado' por defecto
      const estadoSeguro = eventoData.estado !== undefined ? eventoData.estado : 'planificado';
      await updateDoc(eventoRef, {
        nombre: eventoData.nombre,
        descripcion: eventoData.descripcion,
        fechaDesde: eventoData.fechaDesde,
        fechaHasta: eventoData.fechaHasta,
        fechaLimiteEdicion: eventoData.fechaLimiteEdicion,
        ubicacion: eventoData.ubicacion,
        estado: estadoSeguro,
        destacado: eventoData.destacado,
        imagenBase64: eventoData.imagenBase64 || null, // 👈 actualizar imagen en base64
        fechaActualizacion: new Date().toISOString(),
        fechaActualizacionString: new Date().toLocaleString('es-AR')
      });

      console.log('✅ FirebaseService: Evento actualizado exitosamente');
      return id;
    } catch (error) {
      console.error('❌ FirebaseService: Error actualizando evento:', error);
      throw error;
    }
  }

  async obtenerEventos() {
    try {
      console.log('🔍 FirebaseService: Obteniendo eventos');

      const querySnapshot = await getDocs(collection(db, 'eventos'));
      const eventos = [];

      querySnapshot.forEach((doc) => {
        const eventoData = { 
          id: doc.id, 
          nombre: doc.data().nombre,
          descripcion: doc.data().descripcion,
          fechaDesde: doc.data().fechaDesde,
          fechaHasta: doc.data().fechaHasta,
          fechaLimiteEdicion: doc.data().fechaLimiteEdicion,
          imagenBase64: doc.data().imagenBase64 || null,
          destacado: doc.data().destacado || false, // 👈 AGREGA ESTA LÍNEA
          ubicacion: doc.data().ubicacion || '',
          estado: doc.data().estado || 'planificado',
          fechaCreacion: doc.data().fechaCreacion,
          fechaCreacionString: doc.data().fechaCreacionString,
          fechaActualizacion: doc.data().fechaActualizacion,
          fechaActualizacionString: doc.data().fechaActualizacionString
        };

        eventos.push(eventoData);
        console.log('📅 Evento obtenido:', {
          id: eventoData.id,
          nombre: eventoData.nombre,
          estado: eventoData.estado,
          destacado: eventoData.destacado,
          fechaDesde: eventoData.fechaDesde,
          fechaHasta: eventoData.fechaHasta,
          fechaLimiteEdicion: eventoData.fechaLimiteEdicion,
          fechaCreacion: eventoData.fechaCreacion
        });
      });

      console.log('✅ FirebaseService: Total eventos obtenidos:', eventos.length);
      return eventos;
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo eventos:', error);
      throw error;
    }
  }

  async eliminarEvento(id) {
    try {
      console.log('🔥 FirebaseService: Eliminando evento:', id);
      
      if (!id) {
        throw new Error('ID del evento es obligatorio para eliminar');
      }
      
      await deleteDoc(doc(db, 'eventos', id));
      console.log('✅ FirebaseService: Evento eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error eliminando evento:', error);
      throw error;
    }
  }

  // CONFIGURACIÓN DE FORMULARIOS
  async guardarConfiguracionFormularios(configuracion) {
    try {
      console.log('🔥 FirebaseService: Guardando configuración de formularios');
      
      const docRef = doc(db, 'configuracion', 'eventos');
      await setDoc(docRef, {
        ...configuracion,
        fechaActualizacion: new Date().toISOString(),
        fechaActualizacionString: new Date().toLocaleString('es-AR')
      });
      
      console.log('✅ FirebaseService: Configuración guardada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error guardando configuración:', error);
      throw error;
    }
  }

  async obtenerConfiguracionFormularios() {
    try {
      console.log('🔥 FirebaseService: Obteniendo configuración de formularios');
      
      const docRef = doc(db, 'configuracion', 'eventos');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const config = docSnap.data();
        console.log('✅ FirebaseService: Configuración obtenida exitosamente');
        return config;
      } else {
        console.log('ℹ️ FirebaseService: No existe configuración, usando valores por defecto');
        return null;
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo configuración:', error);
      throw error;
    }
  }

  // FORMULARIOS
  
  async guardarFormularioSocio(formData) {
    try {
      console.log('🔥 FirebaseService: Guardando formulario de socio (unificado)');
      const docRef = await addDoc(collection(db, 'formularios'), {
        ...formData,
        fechaCreacion: new Date().toISOString(),
        fechaCreacionString: new Date().toLocaleString('es-AR'),
        tipo: 'socio'
      });
      console.log('✅ FirebaseService: Formulario de socio guardado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error guardando formulario de socio:', error);
      throw error;
    }
  }

  async guardarFormularioProveedorConHotel(formData) {
    try {
      console.log('🔥 FirebaseService: Guardando formulario de proveedor con hotel (unificado)');
      const docRef = await addDoc(collection(db, 'formularios'), {
        ...formData,
        fechaCreacion: new Date().toISOString(),
        fechaCreacionString: new Date().toLocaleString('es-AR'),
        tipo: 'proveedor-con-hotel'
      });
      console.log('✅ FirebaseService: Formulario de proveedor guardado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error guardando formulario de proveedor:', error);
      throw error;
    }
  }

  async guardarFormularioProveedorSinHotel(formData) {
    try {
      console.log('🔥 FirebaseService: Guardando formulario de proveedor sin hotel (unificado)');
      const docRef = await addDoc(collection(db, 'formularios'), {
        ...formData,
        fechaCreacion: new Date().toISOString(),
        fechaCreacionString: new Date().toLocaleString('es-AR'),
        tipo: 'proveedor-sin-hotel'
      });
      console.log('✅ FirebaseService: Formulario de proveedor guardado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error guardando formulario de proveedor:', error);
      throw error;
    }
  }

  // Método mejorado para validar login con detección de primer ingreso
  async validarLogin(email, password) {
    try {
      console.log('🔐 FirebaseService: Validando login para:', email);
      
      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
      }
      
      const q = query(
        collection(db, 'usuarios'), 
        where('email', '==', email.toLowerCase().trim()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ FirebaseService: Usuario no encontrado');
        throw new Error('Email o contraseña incorrectos');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        nombre: userDoc.data().nombre,
        email: userDoc.data().email,
        rol: userDoc.data().rol,
        activo: userDoc.data().activo,
        passwordCambiado: userDoc.data().passwordCambiado,
        fechaCreacion: userDoc.data().fechaCreacion,
        cantidadLogins: userDoc.data().cantidadLogins,
        fechaUltimoLogin: userDoc.data().fechaUltimoLogin
      };

    if (!userData.activo) {
      console.log('❌ FirebaseService: Usuario inactivo');
      throw new Error('Su cuenta ha sido desactivada. Contacte al administrador para más información.');
    }
    
    if (userDoc.data().password !== password) {
      console.log('❌ FirebaseService: Contraseña incorrecta');
      throw new Error('Email o contraseña incorrectos');
    }
    
    await updateDoc(userDoc.ref, {
      fechaUltimoLogin: new Date().toISOString(),
      fechaUltimoLoginString: new Date().toLocaleString('es-AR'),
      cantidadLogins: (userData.cantidadLogins || 0) + 1
    });
    
    console.log('✅ FirebaseService: Login exitoso para:', userData.email);
    console.log('🔍 passwordCambiado:', userData.passwordCambiado);
    
    // ✅ DEVOLVER SOLO userData sin campos extra
    return userData;
  } catch (error) {
    console.error('❌ FirebaseService: Error en validación de login:', error);
    throw error;
  }
}

  // Método para marcar que el usuario ya cambió su contraseña inicial
  async marcarPasswordCambiado(userId) {
    try {
      console.log('🔐 FirebaseService: Marcando password como cambiado para:', userId);
      
      const usuarioRef = doc(db, 'usuarios', userId);
      await updateDoc(usuarioRef, {
        passwordCambiado: true,
        fechaCambioPassword: new Date().toISOString(),
        fechaCambioPasswordString: new Date().toLocaleString('es-AR')
      });
      
      console.log('✅ FirebaseService: Password marcado como cambiado');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error marcando password como cambiado:', error);
      throw error;
    }
  }

  // Método actualizado para cambiar contraseña
  async cambiarPassword(userId, nuevaPassword, esPrimerCambio = false) {
    try {
      console.log('🔐 FirebaseService: Cambiando contraseña para usuario:', userId);
      
      if (!userId || !nuevaPassword) {
        throw new Error('ID de usuario y nueva contraseña son obligatorios');
      }
      
      if (nuevaPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      const usuarioRef = doc(db, 'usuarios', userId);
      const updateData = {
        password: nuevaPassword,
        passwordCambiado: false, // Ahora debe cambiar la contraseña en el próximo login
        fechaActualizacionPassword: new Date().toISOString(),
        fechaActualizacionPasswordString: new Date().toLocaleString('es-AR'),
        fechaCambioPassword: new Date().toISOString(),
        fechaCambioPasswordString: new Date().toLocaleString('es-AR')
      };

      await updateDoc(usuarioRef, updateData);

      console.log('✅ FirebaseService: Contraseña actualizada y passwordCambiado=false (debe cambiar en próximo login)');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error cambiando contraseña:', error);
      throw error;
    }
  }

  // Método para resetear primer login
  async resetearPrimerLogin(userId) {
    try {
      console.log('🔄 FirebaseService: Reseteando primer login para:', userId);
      
      const usuarioRef = doc(db, 'usuarios', userId);
      await updateDoc(usuarioRef, {
        passwordCambiado: false, // Forzar cambio de contraseña
        fechaResetPrimerLogin: new Date().toISOString(),
        fechaResetPrimerLoginString: new Date().toLocaleString('es-AR')
      });
      
      console.log('✅ FirebaseService: Primer login reseteado - usuario deberá cambiar contraseña');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error reseteando primer login:', error);
      throw error;
    }
  }

  // Método para cambiar estado activo/inactivo
  async cambiarEstadoUsuario(userId, nuevoEstado) {
    try {
      console.log('🔄 FirebaseService: Cambiando estado de usuario:', userId, 'a:', nuevoEstado);
      
      if (!userId) {
        throw new Error('ID de usuario es obligatorio');
      }
      
      const usuarioRef = doc(db, 'usuarios', userId);
      await updateDoc(usuarioRef, {
        activo: nuevoEstado,
        fechaCambioEstado: new Date().toISOString(),
        fechaCambioEstadoString: new Date().toLocaleString('es-AR')
      });
      
      console.log('✅ FirebaseService: Estado de usuario actualizado');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error cambiando estado de usuario:', error);
      throw error;
    }
  }

  // Método unificado para enviar formularios
  async enviarFormulario(datosFormulario) {
    try {
      console.log('📤 FirebaseService: Enviando formulario (unificado):', datosFormulario.tipoFormulario);
      if (!datosFormulario.tipoFormulario) {
        throw new Error('Tipo de formulario es obligatorio');
      }
      const datosCompletos = {
        ...datosFormulario,
        fechaEnvio: new Date().toISOString(),
        fechaEnvioString: new Date().toLocaleString('es-AR'),
        estado: 'pendiente'
      };
      const docRef = await addDoc(collection(db, 'formularios'), datosCompletos);
      console.log('✅ FirebaseService: Formulario enviado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error enviando formulario:', error);
      throw error;
    }
  }

  // Método para obtener todos los formularios
  async obtenerFormularios() {
    try {
      console.log('🔍 FirebaseService: Obteniendo formularios (unificado)');
      let snapshot;
      if (arguments.length > 0 && arguments[0]) {
        // Si se pasa eventoId, filtrar por evento
        const eventoId = arguments[0];
        const q = query(collection(db, 'formularios'), where('eventoId', '==', eventoId));
        snapshot = await getDocs(q);
      } else {
        snapshot = await getDocs(collection(db, 'formularios'));
      }
      const formularios = [];
      snapshot.forEach((doc) => {
        formularios.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ FirebaseService: Total formularios obtenidos:', formularios.length);
      console.log('📝 Formularios obtenidos:', formularios);
      return formularios;
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo formularios:', error);
      throw error;
    }
  }

  // Método para obtener eventos activos
  async obtenerEventosActivos() {
    try {
      console.log('🔍 Obteniendo eventos activos...');
      
      const eventosRef = collection(db, 'eventos');
      const q = query(
        eventosRef, 
        where('estado', 'in', ['activo', 'planificado']),
        orderBy('fechaDesde', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];
      
      querySnapshot.forEach((doc) => {
        const evento = { 
          id: doc.id, 
          nombre: doc.data().nombre,
          descripcion: doc.data().descripcion,
          destacado: doc.data().destacado,
          fechaDesde: doc.data().fechaDesde,
          fechaHasta: doc.data().fechaHasta,
          fechaLimiteEdicion: doc.data().fechaLimiteEdicion,
          ubicacion: doc.data().ubicacion,
          estado: doc.data().estado,
          fechaCreacion: doc.data().fechaCreacion,
      
          // Agregar alias para compatibilidad con el formulario
          fechaInicio: doc.data().fechaDesde,
          fechaFin: doc.data().fechaHasta
        };
        eventos.push(evento);
      });
      
      console.log('✅ Eventos activos obtenidos:', eventos.length);
      return eventos;
      
    } catch (error) {
      console.error('❌ Error obteniendo eventos activos:', error);
      
      // Si hay error con el query compuesto, intentar una consulta más simple
      try {
        console.log('🔄 Intentando consulta simple...');
        const eventosRef = collection(db, 'eventos');
        const querySnapshot = await getDocs(eventosRef);
        const eventos = [];
        
        querySnapshot.forEach((doc) => {
          const evento = { 
            id: doc.id, 
            nombre: doc.data().nombre,
            descripcion: doc.data().descripcion,
            fechaDesde: doc.data().fechaDesde,
            fechaHasta: doc.data().fechaHasta,
            destacado: doc.data().destacado,
            imagenBase64: doc.data().imagenBase64 || null, // Leer imagen en base
            fechaLimiteEdicion: doc.data().fechaLimiteEdicion,
            ubicacion: doc.data().ubicacion,
            estado: doc.data().estado,
            fechaCreacion: doc.data().fechaCreacion,
            // Agregar alias para compatibilidad con el formulario
            fechaInicio: doc.data().fechaDesde,
            fechaFin: doc.data().fechaHasta
          };
          
          // Filtrar manualmente por estado activo o planificado
          if (evento.estado === 'activo' || evento.estado === 'planificado') {
            eventos.push(evento);
          }
        });
        
        // Ordenar manualmente por fecha
        eventos.sort((a, b) => {
          if (!a.fechaDesde) return 1;
          if (!b.fechaHasta) return -1;
          return new Date(a.fechaDesde) - new Date(b.fechaHasta);
        });
        
        console.log('✅ Eventos obtenidos con consulta simple:', eventos.length);
        return eventos;
        
      } catch (simpleError) {
        console.error('❌ Error en consulta simple:', simpleError);
        throw new Error(`Error al obtener eventos: ${simpleError.message}`);
      }
    }
  }

  // --- PERSONALIZACIÓN DE FORMULARIOS INDIVIDUALES ---

  // Obtener todas las configuraciones de formularios individuales
  async obtenerConfiguracionesFormulariosTipos() {
    try {
      console.log('🔥 FirebaseService: Obteniendo configuraciones de formularios individuales');
      const colRef = collection(db, 'configuracionformularios');
      const snap = await getDocs(colRef);
      const configs = snap.docs.map(doc => doc.data());
      configs.forEach(cfg => {
        console.log('Leído de Firestore:', cfg.tipoformulario, 'notainicio:', cfg.notainicio, 'notafin:', cfg.notafin);
      });
      console.log('✅ FirebaseService: Configuraciones obtenidas:', configs.length);
      return configs;
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo configuraciones de formularios individuales:', error);
      throw error;
    }
  }

  // Guardar la configuración de un tipo de formulario
  async guardarConfiguracionFormularioTipo({ tipoformulario, notainicio, notafin, imageninicio }) {
    try {
      if (!tipoformulario) throw new Error('tipoformulario es requerido');
      console.log('🔥 FirebaseService: Guardando configuración para tipo:', tipoformulario);
      console.log('notainicio HTML:', notainicio);
      console.log('notafin HTML:', notafin);
      const docRef = doc(db, 'configuracionformularios', tipoformulario);
      await setDoc(docRef, {
        tipoformulario,
        notainicio: notainicio || '',
        notafin: notafin || '',
        imageninicio: imageninicio || ''
      }, { merge: true });
      console.log('✅ FirebaseService: Configuración guardada para tipo:', tipoformulario);
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error guardando configuración de formulario tipo:', error);
      throw error;
    }
  }
  // Obtener la configuración personalizada para "socio"
  async obtenerConfiguracionFormularioSocio() {
    try {
      const docRef = doc(db, 'configuracionformularios', 'socio');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Si no existe, devuelve valores por defecto
        return { notainicio: '', notafin: '', imageninicio: '' };
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo configuración de proveedor-con-hotel:', error);
      throw error;
    }
  }

// Obtener la configuración personalizada para "proveedor-sin-hotel"
  async obtenerConfiguracionFormularioProveedorSinHotel() {
    try {
      const docRef = doc(db, 'configuracionformularios', 'proveedor-sin-hotel');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Si no existe, devuelve valores por defecto
        return { notainicio: '', notafin: '', imageninicio: '' };
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo configuración de proveedor-con-hotel:', error);
      throw error;
    }
  }
  // Obtener la configuración personalizada para "proveedor-con-hotel"
  async obtenerConfiguracionFormularioProveedorConHotel() {
    try {
      const docRef = doc(db, 'configuracionformularios', 'proveedor-con-hotel');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Si no existe, devuelve valores por defecto
        return { notainicio: '', notafin: '', imageninicio: '' };
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo configuración de proveedor-con-hotel:', error);
      throw error;
    }
  }

  // Método para guardar configuración de correo electrónico para eventos
  async guardarConfiguracionMailEvento(mailConfig) {
    try {
      console.log('🔥 FirebaseService: Guardando configuración de correo para eventos');
      if (mailConfig.id) {
        // Editar mail existente
        const docRef = doc(db, 'configuracionMails', mailConfig.id);
        const { id, ...dataSinId } = mailConfig;
        await setDoc(docRef, {
          ...dataSinId,
          fechaActualizacion: new Date().toISOString(),
          fechaActualizacionString: new Date().toLocaleString('es-AR')
        }, { merge: true });
        console.log('✅ FirebaseService: Mail actualizado:', mailConfig.id);
        return mailConfig.id;
      } else {
        // Crear nuevo mail
        const docRef = await addDoc(collection(db, 'configuracionMails'), {
          ...mailConfig,
          fechaCreacion: new Date().toISOString(),
          fechaCreacionString: new Date().toLocaleString('es-AR')
        });
        console.log('✅ FirebaseService: Nuevo mail creado con ID:', docRef.id);
        return docRef.id;
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error guardando configuración de correo:', error);
      throw error;
    }
  }

  // Método para obtener todos los mails configurados
  async obtenerMailsConfigurados() {
    try {
      console.log('🔥 FirebaseService: Obteniendo mails configurados...');
      const querySnapshot = await getDocs(collection(db, 'configuracionMails'));
      const mails = [];
      querySnapshot.forEach((doc) => {
        mails.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ FirebaseService: Mails configurados obtenidos:', mails.length);
      return mails;
    } catch (error) {
      console.error('❌ FirebaseService: Error obteniendo mails configurados:', error);
      throw error;
    }
  }


 async obtenerFormularioSocioPorUsuarioYEvento(email, eventoId) {
    try {
      console.log('ℹ️ +email:', email, 'eventoId:', eventoId);
      if (!email || !eventoId) throw new Error('Email y eventoId son obligatorios');
      console.log('🔍 Buscando formulario socio en colección unificada para:', email, eventoId);

      const q = query(
        collection(db, 'formularios'),
        where('usuarioCreador', '==', email.toLowerCase().trim()),
        where('eventoId', '==', eventoId),
        where('tipo', '==', 'socio'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      console.log('ℹ️ Query snapshot:', db, email.toLowerCase().trim(), querySnapshot);
      console.log('ℹ️ Cantidad de documentos encontrados:', querySnapshot.size);
      if (querySnapshot.empty) {
        console.log('ℹ️ No existe formulario socio para este usuario/evento');
        return null;
      }
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('❌ Error buscando formulario socio:', error);
      throw error;
    }
  }
    // Ejemplo típico de filtro en FirebaseService.js
a
  
  async obtenerFormularioProveedorConHotelPorUsuarioYEvento(email, eventoId) {
    try {
      console.log('ℹ️ +email:', email, 'eventoId:', eventoId);
      if (!email || !eventoId) throw new Error('Email y eventoId son obligatorios');
      console.log('🔍 Buscando formulario proveedor con hotel en colección unificada para:', email, eventoId);

      const q = query(
        collection(db, 'formularios'),
        where('usuarioCreador', '==', email.toLowerCase().trim()),
        where('eventoId', '==', eventoId),
        where('tipo', '==', 'proveedor-con-hotel'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      console.log('ℹ️ Query snapshot:', db, email.toLowerCase().trim(), querySnapshot);
      console.log('ℹ️ Cantidad de documentos encontrados:', querySnapshot.size);
      if (querySnapshot.empty) {
        console.log('ℹ️ No existe formulario proveedor con hotel para este usuario/evento');
        return null;
      }
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('❌ Error buscando formulario proveedor con hotel:', error);
      throw error;
    }
  }
  async obtenerFormularioProveedorSinHotelPorUsuarioYEvento(email, eventoId) {
    try {
      console.log('ℹ️ +email:', email, 'eventoId:', eventoId);
      if (!email || !eventoId) throw new Error('Email y eventoId son obligatorios');
      console.log('🔍 Buscando formulario proveedor sin hotel en colección unificada para:', email, eventoId);

      const q = query(
        collection(db, 'formularios'),
        where('usuarioCreador', '==', email.toLowerCase().trim()),
        where('eventoId', '==', eventoId),
        where('tipo', '==', 'proveedor-sin-hotel'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      console.log('ℹ️ Query snapshot:', db, email.toLowerCase().trim(), querySnapshot);
      console.log('ℹ️ Cantidad de documentos encontrados:', querySnapshot.size);
      if (querySnapshot.empty) {
        console.log('ℹ️ No existe formulario proveedor sin hotel para este usuario/evento');
        return null;
      }
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('❌ Error buscando formulario proveedor sin hotel:', error);
      throw error;
    }
  }

  // --- NEWSLETTER FIRESTORE REAL ---

  // Obtener todos los usuarios para newsletter (ya existe, pero aquí versión real)
  async obtenerUsuariosParaNewsletter() {
    try {
      const q = query(collection(db, 'usuarios'), orderBy('nombre', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error obteniendo usuarios para newsletter:', error);
      throw error;
    }
  }

  // Obtener todos los mails configurados (ya existe, pero aquí versión real)
  async obtenerMailsConfigurados() {
    try {
      const querySnapshot = await getDocs(collection(db, 'configuracionMails'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error obteniendo mails configurados:', error);
      throw error;
    }
  }

  // (Las funciones de mailsEnviados y marcarMailLeido quedan obsoletas con la nueva colección unificada)

}

export const FirebaseService = new FirebaseServiceClass();