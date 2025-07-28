import { FirebaseService } from '../../services/FirebaseService';

/**
 * Función utilitaria para actualizar el campo passwordCambiado=true cuando el email cambia por primera vez.
 * @param {string} userId
 * @param {string} emailAnterior
 * @param {string} emailNuevo
 */
export async function actualizarPasswordCambiadoSiEmailCambio(userId, emailAnterior, emailNuevo) {
  if (!userId || !emailAnterior || !emailNuevo) return;
  if (emailAnterior.trim().toLowerCase() !== emailNuevo.trim().toLowerCase()) {
    // Buscar usuario actual para ver si ya tiene passwordCambiado
    const usuario = await FirebaseService.obtenerUsuarioPorEmail(emailAnterior);
    console.log('[DEBUG] userId:', userId, 'usuario:', usuario, 'emailAnterior:', emailAnterior, 'emailNuevo:', emailNuevo);
    if (usuario && usuario.id === userId) {
      // Siempre intentar actualizar el campo
      await FirebaseService.actualizarUsuario(userId, { passwordCambiado: true });
      console.log('[DEBUG] Se actualizó passwordCambiado a true para', userId);
    } else {
      console.warn('[DEBUG] Usuario no encontrado o id no coincide, no se actualiza passwordCambiado');
    }
  }
}
