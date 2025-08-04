
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './ListadoReferentesModal.css';

function ListadoReferentes({ readOnly, eventId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formulariosPorUsuario, setFormulariosPorUsuario] = useState({});
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroPrimeraVez, setFiltroPrimeraVez] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const cargarUsuariosYFormularios = async () => {
      try {
        setLoading(true);
        const usuariosData = await FirebaseService.obtenerUsuarios();
        setUsuarios(usuariosData);
        // Consultar formularios para el eventId
        const formulariosData = await FirebaseService.obtenerFormulariosPorEvento(eventId);
        // Mapear si cada usuario tiene formulario cargado
        const map = {};
        usuariosData.forEach(u => {
          map[u.id] = formulariosData.some(f => f.usuarioCreador === u.id && f.eventoId === eventId && f.rol === u.rol);
        });
        setFormulariosPorUsuario(map);
      } catch (error) {
        alert('Error al cargar usuarios o formularios');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) cargarUsuariosYFormularios();
  }, [eventId]);

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
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2>Listado de Usuarios Referentes</h2>
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
          <option value="proveedor-con-hotel">Proveedor CH</option>
          <option value="proveedor-sin-hotel">Proveedor SH</option>
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
              <th>Formulario Cargado</th>
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
                  <span className={`status-toggle ${usuario.activo ? 'activo' : 'inactivo'}`}
                        title={usuario.activo ? 'Usuario activo' : 'Usuario inactivo'}>
                    {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </td>
                <td>
                  <span className={`primer-login-badge ${!usuario.passwordCambiado ? 'si' : 'no'}`}>
                    {!usuario.passwordCambiado ? '🔐 Sí' : '✅ No'}
                  </span>
                </td>
                <td>
                  {usuario.fechaCreacionString || 
                   (usuario.fechaCreacion ? new Date(usuario.fechaCreacion).toLocaleDateString('es-AR') : '')}
                </td>
                <td>
                  {formulariosPorUsuario[usuario.id] ? 'Sí' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay usuarios registrados</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListadoReferentes;