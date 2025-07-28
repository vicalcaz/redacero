import { useState } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './CambiarPasswordModal.css';

function CambiarPasswordModal({ usuario, esPrimerLogin, onPasswordCambiado, onCancelar }) {
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.password.trim()) {
      newErrors.password = 'La nueva contraseña es obligatoria';
    } else if (passwordData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (passwordData.password !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Cambiar contraseña
      await FirebaseService.cambiarPassword(usuario.id, passwordData.password, esPrimerLogin);
      // Actualizar passwordCambiado a true explícitamente
      await FirebaseService.actualizarUsuario(usuario.id, { passwordCambiado: true });
      console.log('✅ Contraseña cambiada exitosamente');
      onPasswordCambiado();
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-modal-overlay">
      <div className="password-modal-container">
        <div className="password-modal-header">
          <div className="modal-icon">
            {esPrimerLogin ? '🔐' : '🔄'}
          </div>
          <h1>
            {esPrimerLogin ? 'Cambio de Contraseña Obligatorio' : 'Cambiar Contraseña'}
          </h1>
          <p className="modal-subtitle">
            {esPrimerLogin 
              ? 'Por seguridad, debe cambiar su contraseña antes de continuar'
              : 'Actualice su contraseña'
            }
          </p>
        </div>

        <div className="user-info">
          <p><strong>Usuario:</strong> {usuario.nombre}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
        </div>

        {esPrimerLogin && (
          <div className="primer-login-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h3>Primer ingreso detectado</h3>
              <p>Es la primera vez que accede al sistema. Por su seguridad, debe establecer una nueva contraseña.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña *</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={passwordData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita la nueva contraseña"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="password-requirements">
            <h4>📋 Requisitos de la contraseña:</h4>
            <ul>
              <li className={passwordData.password.length >= 6 ? 'valid' : ''}>
                ✓ Mínimo 6 caracteres
              </li>
              <li className={passwordData.password && passwordData.confirmPassword && passwordData.password === passwordData.confirmPassword ? 'valid' : ''}>
                ✓ Las contraseñas deben coincidir
              </li>
            </ul>
          </div>

          {errors.general && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          <div className="form-actions">
            {!esPrimerLogin && (
              <button 
                type="button" 
                onClick={onCancelar} 
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Cambiando...
                </>
              ) : (
                esPrimerLogin ? 'Establecer Contraseña' : 'Cambiar Contraseña'
              )}
            </button>
          </div>
        </form>

        {esPrimerLogin && (
          <div className="security-note">
            <p>🔒 <strong>Nota de seguridad:</strong> Guarde su nueva contraseña en un lugar seguro. Será necesaria para futuros ingresos al sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CambiarPasswordModal;