/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\UserManagement.jsx */
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './UserManagement.css';

function UserManagement() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'admin',
    activo: true
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await FirebaseService.obtenerUsuarios();
      setUsuarios(usuariosData);
      console.log('✅ Usuarios cargados:', usuariosData.length);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'socio',
      activo: true,
      passwordCambiado: false
    });
    setErrors({});
    setEditingUser(null);
  };

  const resetPasswordForm = () => {
    setPasswordData({
      password: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setPasswordUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña solo si es usuario nuevo o si se está cambiando
    if (!editingUser && !formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria para usuarios nuevos';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
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

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo al escribir
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingUser) {
        // Actualizar usuario existente (sin cambiar password aquí)
        const updateData = { ...formData };
        delete updateData.password; // No actualizar password desde aquí
        
        await FirebaseService.actualizarUsuario(editingUser.id, updateData);
        console.log('✅ Usuario actualizado');
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await FirebaseService.crearUsuario(formData);
        console.log('✅ Usuario creado');
        alert('Usuario creado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      cargarUsuarios();
    } catch (error) {
      console.error('❌ Error guardando usuario:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    try {
      // Cambiar contraseña (automáticamente marca passwordCambiado = true)
      await FirebaseService.cambiarPassword(passwordUser.id, passwordData.password);
      console.log('✅ Contraseña actualizada');
      console.log('✅ Campo "Primera vez" automáticamente marcado como "No"');
      alert('Contraseña actualizada exitosamente.\nEl usuario ya no necesitará cambiar su contraseña en el próximo login.');
      
      setShowPasswordModal(false);
      resetPasswordForm();
      cargarUsuarios(); // Recargar para mostrar el cambio en la tabla
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // No mostrar password actual
      rol: usuario.rol,
      activo: usuario.activo !== undefined ? usuario.activo : true,
      passwordCambiado: usuario.passwordCambiado || false
    });
    setEditingUser(usuario);
    setShowModal(true);
  };

  const openPasswordModal = (usuario) => {
    setPasswordUser(usuario);
    setShowPasswordModal(true);
  };

  const handleDelete = async (usuario) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario "${usuario.nombre}"?`)) {
      try {
        await FirebaseService.eliminarUsuario(usuario.id);
        console.log('✅ Usuario eliminado');
        alert('Usuario eliminado exitosamente');
        cargarUsuarios();
      } catch (error) {
        console.error('❌ Error eliminando usuario:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    resetPasswordForm();
  };

  // Función para marcar que el usuario ya cambió su contraseña (solo para casos especiales)
  const marcarPasswordCambiado = async (usuario) => {
    if (window.confirm(`¿Marcar que "${usuario.nombre}" ya cambió su contraseña inicial?\n\nEsto se hace automáticamente cuando cambian la contraseña.`)) {
      try {
        await FirebaseService.marcarPasswordCambiado(usuario.id);
        console.log('✅ Usuario marcado como password cambiado');
        alert('Usuario marcado como contraseña cambiada exitosamente');
        cargarUsuarios();
      } catch (error) {
        console.error('❌ Error marcando password como cambiado:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Función para resetear el estado de primer login
  const resetearPrimerLogin = async (usuario) => {
    if (window.confirm(`¿Resetear el estado de primer login para "${usuario.nombre}"?`)) {
      try {
        await FirebaseService.resetearPrimerLogin(usuario.id);
        console.log('✅ Primer login reseteado');
        alert('Estado de primer login reseteado exitosamente');
        cargarUsuarios();
      } catch (error) {
        console.error('❌ Error reseteando primer login:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Función mejorada para cambiar estado activo/inactivo
  const toggleEstadoUsuario = async (usuario) => {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    const mensajeConfirmacion = nuevoEstado 
      ? `¿Activar al usuario "${usuario.nombre}"?\n\nEl usuario podrá acceder al sistema nuevamente.`
      : `¿Desactivar al usuario "${usuario.nombre}"?\n\nEl usuario no podrá acceder al sistema hasta ser reactivado.`;
    
    if (window.confirm(mensajeConfirmacion)) {
      try {
        // Mostrar estado de carga (opcional)
        const botonEstado = document.querySelector(`[data-user-id="${usuario.id}"]`);
        if (botonEstado) {
          botonEstado.disabled = true;
          botonEstado.textContent = `${nuevoEstado ? '🔄 Activando...' : '🔄 Desactivando...'}`;
        }

        await FirebaseService.cambiarEstadoUsuario(usuario.id, nuevoEstado);
        console.log(`✅ Usuario ${accion}do exitosamente`);
        
        // Mostrar notificación de éxito
        const mensaje = nuevoEstado 
          ? `✅ Usuario "${usuario.nombre}" activado exitosamente`
          : `❌ Usuario "${usuario.nombre}" desactivado exitosamente`;
        alert(mensaje);
        
        cargarUsuarios();
      } catch (error) {
        console.error(`❌ Error ${accion}ndo usuario:`, error);
        alert(`Error ${accion}ndo usuario: ${error.message}`);
        cargarUsuarios(); // Recargar para resetear el estado visual
      }
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>👥 Gestión de Usuarios</h1>
        <button onClick={openCreateModal} className="btn-primary">
          ➕ Nuevo Usuario
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Primera vez</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`rol-badge ${usuario.rol}`}>
                    {usuario.rol === 'admin' ? '🔧 Administrador' : 
                     usuario.rol === 'socio' ? '🏪 Socio' :
                     usuario.rol === 'proveedor-con-hotel' ? '🏨 Proveedor con hotel' :
                     usuario.rol === 'proveedor-sin-hotel' ? '🚗 Proveedor sin hotel' :
                     '👤 Usuario'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleEstadoUsuario(usuario)}
                    className={`status-toggle ${usuario.activo ? 'activo' : 'inactivo'}`}
                    title={`Clic para ${usuario.activo ? 'desactivar' : 'activar'} usuario`}
                    data-user-id={usuario.id}
                  >
                    {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                  </button>
                </td>
                <td>
                  <span className={`primer-login-badge ${!usuario.passwordCambiado ? 'si' : 'no'}`}>
                    {!usuario.passwordCambiado ? '🔐 Sí' : '✅ No'}
                  </span>
                </td>
                <td>
                  {usuario.fechaCreacionString || 
                   new Date(usuario.fechaCreacion).toLocaleDateString('es-AR')}
                </td>
                <td>
                  <div className="actions-buttons">
                    <button
                      onClick={() => openEditModal(usuario)}
                      className="btn-edit"
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openPasswordModal(usuario)}
                      className="btn-password"
                      title="Cambiar contraseña"
                    >
                      🔐
                    </button>
                    {!usuario.passwordCambiado && (
                      <button
                        onClick={() => marcarPasswordCambiado(usuario)}
                        className="btn-reset-password"
                        title="Marcar como contraseña cambiada"
                      >
                        🔓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(usuario)}
                      className="btn-delete"
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay usuarios registrados</h3>
            <p>Cree el primer usuario haciendo clic en "Nuevo Usuario"</p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
              <button onClick={closeModal} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Información básica */}
              <div className="form-section">
                <h3 className="section-title">📝 Información Básica</h3>
                
                <div className="campo-grupo">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                    className={errors.nombre ? 'error' : ''}
                  />
                  {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                </div>

                <div className="campo-grupo">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="usuario@email.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="campo-grupo">
                  <label htmlFor="rol">Rol</label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                  >
                    <option value="admin">Administrador</option>
                    <option value="socio">Socio</option>
                    <option value="proveedor-con-hotel">Proveedor con hotel</option>
                    <option value="proveedor-sin-hotel">Proveedor sin hotel</option>
                  </select>
                </div>
              </div>

              {/* Solo mostrar campo de contraseña para usuarios nuevos */}
              {!editingUser && (
                <div className="form-section">
                  <h3 className="section-title">🔒 Contraseña</h3>
                  
                  <div className="campo-grupo">
                    <label htmlFor="password">Contraseña *</label>
                    <div className="password-input-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        className={errors.password ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.password && <span className="error-text">{errors.password}</span>}
                    <small className="field-help">Mínimo 6 caracteres</small>
                  </div>
                </div>
              )}

              {/* Configuración de acceso */}
              <div className="form-section">
                <h3 className="section-title">⚙️ Configuración de Acceso</h3>
                
                <div className="campo-grupo">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-custom"></span>
                    Usuario activo
                  </label>
                  <small className="field-help">
                    {formData.activo ? '✅ El usuario puede acceder al sistema' : '❌ El usuario no puede acceder al sistema'}
                  </small>
                </div>

                {editingUser && (
                  <div className="campo-grupo">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="passwordCambiado"
                        checked={formData.passwordCambiado || false}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-custom"></span>
                      Ya cambió su contraseña inicial
                    </label>
                    <small className="field-help">
                      {formData.passwordCambiado ? '✅ No necesita cambiar contraseña' : '🔐 Deberá cambiar contraseña en el próximo login'}
                    </small>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🔐 Cambiar Contraseña</h2>
              <button onClick={closePasswordModal} className="modal-close">✕</button>
            </div>

            <div className="password-modal-info">
              <p><strong>Usuario:</strong> {passwordUser?.nombre}</p>
              <p><strong>Email:</strong> {passwordUser?.email}</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="campo-grupo">
                <label htmlFor="password">Nueva Contraseña *</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 6 caracteres"
                    className={passwordErrors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordErrors.password && <span className="error-text">{passwordErrors.password}</span>}
              </div>

              <div className="campo-grupo">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repita la nueva contraseña"
                    className={passwordErrors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
              </div>

              <div className="password-help">
                <p>💡 La nueva contraseña debe tener al menos 6 caracteres</p>
                <p>🔒 El usuario deberá usar esta nueva contraseña en su próximo login</p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closePasswordModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;