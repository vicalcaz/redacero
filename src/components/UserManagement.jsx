/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\UserManagement.jsx */
import { useState, useEffect, useRef } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './UserManagement.css';

function UserManagement() {
  // Estado para el formulario de usuario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    password: '',
    rol: 'socio',
    activo: true,
    passwordCambiado: false
  });
  const [errors, setErrors] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  // Estado para el formulario de cambio de contraseña
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordUser, setPasswordUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroPrimeraVez, setFiltroPrimeraVez] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // ...otros hooks...
  const eliminandoRef = useRef(false);

  // Botón temporal para eliminar usuarios creados hoy
  // Eliminar usuarios filtrados (excepto admin)
  const handleEliminarUsuariosHoy = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar TODOS los usuarios listados (excepto admin)?')) return;
    eliminandoRef.current = true;
    setLoading(true);
    try {
      // Filtrar usuarios actualmente visibles y que no sean admin
      const usuariosAEliminar = sortedUsuarios.filter(u => u.rol !== 'admin');
      let eliminados = 0, fallidos = 0;
      for (const usuario of usuariosAEliminar) {
        try {
          await FirebaseService.eliminarUsuario(usuario.id);
          eliminados++;
        } catch (err) {
          fallidos++;
        }
      }
      alert(`Usuarios eliminados: ${eliminados}. Fallidos: ${fallidos}`);
      // Actualizar el listado localmente sin recargar todos los usuarios
      setUsuarios(prev => prev.filter(u => !usuariosAEliminar.some(e => e.id === u.id)));
    } catch (err) {
      alert('Error eliminando usuarios: ' + err.message);
    }
    eliminandoRef.current = false;
    setLoading(false);
};

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
      empresa: '',
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

    if (!formData.empresa.trim()) {
      newErrors.empresa = 'La empresa es obligatoria';
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
        // Asegurar que empresa es string
        updateData.empresa = typeof updateData.empresa === 'string' ? updateData.empresa : (updateData.empresa ? String(updateData.empresa) : '');
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
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      empresa: (typeof usuario.empresa === 'string' && usuario.empresa !== undefined && usuario.empresa !== null) ? usuario.empresa : (usuario.empresa ? capitalizarPalabras(String(usuario.empresa)) : ''),
      password: '', // No mostrar password actual
      rol: usuario.rol || 'socio',
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

  // Función para capitalizar la primera letra de cada palabra
function capitalizarPalabras(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}
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

  const handleImportarUsuarios = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Espera encabezado: nombre, empresa, email, rol
        const header = rows[0].map(h => h.toLowerCase().trim());
        const idxNombre = header.indexOf('nombre');
        const idxEmpresa = header.indexOf('empresa');
        const idxEmail = header.indexOf('email');
        const idxRol = header.indexOf('rol');
        if (idxNombre === -1 || idxEmpresa === -1 || idxEmail === -1 || idxRol === -1) {
          alert('El archivo debe tener las columnas: nombre, empresa, email, rol');
          setLoading(false);
          return;
        }
        const hoy = new Date();
        const hoyStr = hoy.toLocaleDateString('es-AR');
        const hoyISO = hoy.toISOString();
        const nuevosUsuarios = rows.slice(1).filter(r => r[idxEmail]).map(r => ({
          nombre: r[idxNombre] || '',
          empresa: r[idxEmpresa] || '',
          email: r[idxEmail] || '',
          rol: r[idxRol] || 'socio',
          password: 'redacero',
          passwordCambiado: false,
          activo: true,
          fechaCreacion: hoyISO,
          fechaCreacionString: hoyStr
        }));
        if (nuevosUsuarios.length === 0) {
          alert('No se encontraron usuarios válidos para importar.');
          setLoading(false);
          return;
        }
        let ok = 0, fail = 0;
        for (const usuario of nuevosUsuarios) {
          try {
            await FirebaseService.crearUsuario(usuario);
            ok++;
          } catch (err) {
            fail++;
          }
        }
        alert(`Importación finalizada. Usuarios creados: ${ok}. Fallidos: ${fail}`);
        await cargarUsuarios();
        setLoading(false);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      alert('Error importando usuarios: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    let mensaje = 'Cargando usuarios...';
    if (eliminandoRef.current) {
      mensaje = 'Eliminando usuarios...';
    } else if (usuarios.length === 0) {
      mensaje = 'Cargando usuarios...';
    } else if (usuarios.length > 0) {
      mensaje = 'Importando usuarios...';
    }
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{mensaje}</p>
        </div>
      </div>
    );
  }

  // Filtrar usuarios
  let filteredUsuarios = usuarios.filter(u =>
    (!filtroNombre || (u.nombre && u.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))) &&
    (!filtroEmpresa || (u.empresa && u.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase()))) &&
    (!filtroRol || (u.rol && u.rol === filtroRol)) &&
    (filtroPrimeraVez === '' ||
      (filtroPrimeraVez === 'si' ? !u.passwordCambiado : u.passwordCambiado))
  );

  // Ordenar usuarios según sortConfig
  const sortedUsuarios = [...filteredUsuarios];
  if (sortConfig.key) {
    sortedUsuarios.sort((a, b) => {
      const aValue = (a[sortConfig.key] || '').toLowerCase();
      const bValue = (b[sortConfig.key] || '').toLowerCase();
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Manejar click en cabecera para ordenar
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Alternar dirección
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  return (
    <div className="user-management">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>👥 Gestión de Usuarios</h1>
        <button onClick={openCreateModal} className="btn-primary">
          ➕ Nuevo Usuario
        </button>
        <label htmlFor="importar-usuarios" className="btn-secondary" style={{ cursor: 'pointer', marginLeft: 8 }}>
          📥 Importar
          <input
            id="importar-usuarios"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImportarUsuarios}
          />
        </label>
        {/* BOTÓN TEMPORAL: Eliminar usuarios creados hoy SIEMPRE VISIBLE */}
        <button onClick={handleEliminarUsuariosHoy} className="btn-danger" style={{ marginLeft: 8 }}>
          🗑️ Eliminar usuarios listados
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Filtrar por nombre"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <input
          type="text"
          placeholder="Filtrar por empresa"
          value={filtroEmpresa}
          onChange={e => setFiltroEmpresa(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="">Filtrar por rol</option>
          <option value="admin">Administrador</option>
          <option value="socio">Socio</option>
          <option value="proveedor-con-hotel">Proveedor con hotel</option>
          <option value="proveedor-sin-hotel">Proveedor sin hotel</option>
        </select>
        <select
          value={filtroPrimeraVez}
          onChange={e => setFiltroPrimeraVez(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="">¿Primera vez?</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>

      <div style={{ marginBottom: 8, fontWeight: 500, color: '#2c3e50', fontSize: 15 }}>
        Usuarios listados: {sortedUsuarios.length}
      </div>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer', textAlign: 'left', paddingLeft: 12 }} onClick={() => handleSort('nombre')}>
                Nombre {sortConfig.key === 'nombre' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer', textAlign: 'left', paddingLeft: 12 }} onClick={() => handleSort('email')}>
                Usuario/Email {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('empresa')}>
                Empresa {sortConfig.key === 'empresa' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Primera vez</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td style={{ textAlign: 'left', paddingLeft: 12,minWidth: 220, maxWidth: 250, wordBreak: 'break-all'  }}>{usuario.nombre}</td>
                <td style={{ textAlign: 'left', paddingLeft: 12, minWidth: 220, maxWidth: 250, wordBreak: 'break-all' }}>{usuario.email}</td>
                <td style={{ textAlign: 'left', paddingLeft: 12, minWidth: 200, maxWidth: 200, wordBreak: 'break-all' }}>{(usuario.empresa && String(usuario.empresa).trim()) ? usuario.empresa : <span style={{color:'#bbb'}}>-</span>}</td>
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
                    placeholder="Apellido + nombre"
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
                  <label htmlFor="empresa">Empresa *</label>
                  <input
                    type="text"
                    id="empresa"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    placeholder="Razón social"
                    className={errors.empresa ? 'error' : ''}
                  />
                  {errors.empresa && <span className="error-text">{errors.empresa}</span>}
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
                      Ya cambió su contraseña inicial?
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