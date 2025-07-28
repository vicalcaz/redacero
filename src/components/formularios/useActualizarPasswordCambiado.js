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
    // Cambió el email, marcar passwordCambiado=true
    await FirebaseService.actualizarUsuario(userId, { passwordCambiado: true });
  }
}
