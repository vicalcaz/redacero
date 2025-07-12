import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword 
} from 'firebase/auth';
import { db, auth } from '../firebase/config';

export class FirebaseService {
  // Autenticación
  static async loginUsuario(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  static async logoutUsuario() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  static async cambiarPassword(nuevaPassword) {
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, nuevaPassword);
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  // Usuarios
  static async crearUsuario(usuario) {
    try {
      const docRef = await addDoc(collection(db, 'usuarios'), usuario);
      return docRef.id;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  static async obtenerUsuarios() {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  static async obtenerUsuarioPorEmail(email) {
    try {
      const q = query(collection(db, 'usuarios'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario por email:', error);
      throw error;
    }
  }

  static async actualizarUsuario(id, datosActualizados) {
    try {
      const userRef = doc(db, 'usuarios', id);
      await updateDoc(userRef, datosActualizados);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  static async eliminarUsuario(id) {
    try {
      await deleteDoc(doc(db, 'usuarios', id));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Eventos
  static async crearEvento(evento) {
    try {
      const docRef = await addDoc(collection(db, 'eventos'), evento);
      return docRef.id;
    } catch (error) {
      console.error('Error creando evento:', error);
      throw error;
    }
  }

  static async obtenerEventos() {
    try {
      const querySnapshot = await getDocs(collection(db, 'eventos'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      throw error;
    }
  }

  static async eliminarEvento(id) {
    try {
      await deleteDoc(doc(db, 'eventos', id));
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  }

  // Formularios
  static async guardarFormulario(formulario) {
    try {
      const docRef = await addDoc(collection(db, 'formularios'), formulario);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando formulario:', error);
      throw error;
    }
  }

  static async obtenerFormularios() {
    try {
      const querySnapshot = await getDocs(collection(db, 'formularios'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo formularios:', error);
      throw error;
    }
  }

  // Inicializar datos por defecto
  static async inicializarDatos() {
    try {
      // Verificar si ya existe el administrador
      const adminExiste = await this.obtenerUsuarioPorEmail('marvicalcazar@yahoo.com.ar');
      
      if (!adminExiste) {
        // Crear usuario administrador por defecto
        await this.crearUsuario({
          email: 'marvicalcazar@yahoo.com.ar',
          password: 'redacero',
          perfil: 'Administrador',
          primerIngreso: false
        });
        console.log('Usuario administrador creado');
      }
    } catch (error) {
      console.error('Error inicializando datos:', error);
    }
  }
}