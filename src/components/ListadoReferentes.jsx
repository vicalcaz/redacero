
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './ListadoReferentes.css';

function ListadoReferentes({ readOnly, eventId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formulariosPorUsuario, setFormulariosPorUsuario] = useState({});
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroPrimeraVez, setFiltroPrimeraVez] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filtroFormularioCargado, setFiltroFormularioCargado] = useState('');
    function exportarReferentesHTML() {
      // Construye el HTML de la tabla
      let html = `
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Listado de Referentes</title>
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #bbb; padding: 8px; text-align: center; }
            th { background: #e3f2fd; }
            .formulario-cargado-badge.si { background: #43a047; color: #fff; border-radius: 8px; padding: 2px 8px; }
            .formulario-cargado-badge.no { background: #e53935; color: #fff; border-radius: 8px; padding: 2px 8px; }
          </style>
        </head>
        <body>
          <h2>Listado de Usuarios Referentes</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario/Email</th>
                <th>Empresa</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Primera vez</th>
                <th>Fecha Creación</th>
                <th>Formulario Cargado</th>
              </tr>
            </thead>
            <tbody>
              ${sortedUsuarios.map(usuario => `
                <tr>
                  <td>${usuario.nombre || ''}</td>
                  <td>${usuario.email || ''}</td>
                  <td>${usuario.empresa || ''}</td>
                  <td>${usuario.rol || ''}</td>
                  <td>${usuario.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                  <td>${!usuario.passwordCambiado ? '🔐 Sí' : '✅ No'}</td>
                  <td>${usuario.fechaCreacionString || (usuario.fechaCreacion ? new Date(usuario.fechaCreacion).toLocaleDateString('es-AR') : '')}</td>
                  <td>
                    <span class="formulario-cargado-badge ${formulariosPorUsuario[usuario.id] ? 'si' : 'no'}">
                      ${formulariosPorUsuario[usuario.id] ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Crea y descarga el archivo HTML
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ListadoReferentes.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
        console.log('Usuarios cargados:', usuariosData);
        console.log('Formularios cargados:', formulariosData);
        usuariosData.forEach(u => {
          map[u.id] = formulariosData.some(f => {
            const match =
              String(f.usuarioCreador).toLowerCase() === String(u.email).toLowerCase() &&
              String(f.eventoId) === String(eventId) &&
              f.tipo === u.rol;
            
            return match;
          });
          
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
      (filtroPrimeraVez === 'si' ? !u.passwordCambiado : u.passwordCambiado)) &&
    (filtroFormularioCargado === '' ||
      (filtroFormularioCargado === 'si' ? formulariosPorUsuario[u.id] : !formulariosPorUsuario[u.id]))
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
      <button
        onClick={exportarReferentesHTML}
        className="export-btn"
        style={{ marginBottom: 16 }}
>
        Exportar a Excel (vía HTML)
      </button>
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
        <select
          value={filtroFormularioCargado}
          onChange={e => setFiltroFormularioCargado(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="">¿Formulario cargado?</option>
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
                  <span className={`formulario-cargado-badge ${formulariosPorUsuario[usuario.id] ? 'si' : 'no'}`}>
                    {formulariosPorUsuario[usuario.id] ? 'Sí' : 'No'}
                  </span>
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