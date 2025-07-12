/* filepath: c:\Users\Public\RedAcero\redacero-eventos\src\components\UserManagement.jsx */
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './UserManagement.css';

function UserManagement() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    perfil: 'Socio',
    password: 'redacero'
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);

  const perfiles = ['Administrador', 'Proveedor con hotel', 'Proveedor sin hotel', 'Socio'];

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await FirebaseService.obtenerUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await FirebaseService.crearUsuario({
        ...nuevoUsuario,
        primerIngreso: true
      });
      setNuevoUsuario({ email: '', perfil: 'Socio', password: 'redacero' });
      setMostrarFormulario(false);
      cargarUsuarios();
    } catch (error) {
      console.error('Error creando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        setLoading(true);
        await FirebaseService.eliminarUsuario(id);
        cargarUsuarios();
      } catch (error) {
        console.error('Error eliminando usuario:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="user-management">
      <div className="header">
        <h2>Administración de Usuarios</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          disabled={loading}
        >
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-usuario">
          <h3>Crear Nuevo Usuario</h3>
          <form onSubmit={handleCrearUsuario}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Perfil:</label>
              <select
                value={nuevoUsuario.perfil}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, perfil: e.target.value})}
                disabled={loading}
              >
                {perfiles.map(perfil => (
                  <option key={perfil} value={perfil}>{perfil}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setMostrarFormulario(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabla-usuarios">
        {loading ? (
          <div>Cargando usuarios...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Perfil</th>
                <th>Primer Ingreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>{usuario.email}</td>
                  <td>{usuario.perfil}</td>
                  <td>{usuario.primerIngreso ? 'Sí' : 'No'}</td>
                  <td>
                    <button 
                      className="btn-danger"
                      onClick={() => handleEliminarUsuario(usuario.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;