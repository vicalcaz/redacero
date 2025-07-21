import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './FormulariosGuardados.css';

function DetalleUsuariosSinFormulario({ usuarios, onClose }) {
  const [filtroRol, setFiltroRol] = useState('todos');
  const [seleccionados, setSeleccionados] = useState([]);

  const usuariosFiltrados = usuarios.filter(u =>
    filtroRol === 'todos' ? true : (u.rol || u.perfil) === filtroRol
  );

  const toggleSeleccion = (email) => {
    setSeleccionados(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const seleccionarTodos = () => {
    setSeleccionados(usuariosFiltrados.map(u => u.email));
  };

  const deseleccionarTodos = () => {
    setSeleccionados([]);
  };

  const exportarUsuarios = () => {
    const datos = usuariosFiltrados.map(u => ({
      Nombre: u.nombre,
      Email: u.email,
      Rol: u.rol || u.perfil
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UsuariosSinFormulario');
    XLSX.writeFile(wb, 'usuarios_sin_formulario.xlsx');
  };

  const enviarRecordatorio = () => {
    const mailto = `mailto:${seleccionados.join(',')}` +
      '?subject=Recordatorio%20de%20completar%20formulario&body=Por%20favor%20complete%20el%20formulario%20pendiente%20en%20RedAcero%20Eventos.';
    window.location.href = mailto;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{
        maxWidth: '90vw',
        width: '800px',
        minWidth: '320px',
        minHeight: '350px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box',
        borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        background: '#fff',
        margin: '2vh auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        <button className="modal-close" onClick={onClose}>✖️</button>
        <h2>Usuarios sin formulario cargado</h2>
        <div style={{marginBottom: 8}}>
          <label>Filtrar por tipo:&nbsp;</label>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
            <option value="todos">Todos</option>
            {[...new Set(usuarios.map(u => u.rol || u.perfil))].map(rol => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
          <button onClick={exportarUsuarios} style={{marginLeft: 12}}>📥 Exportar a Excel</button>
          <button onClick={seleccionarTodos} style={{marginLeft: 12}}>Seleccionar todos</button>
          <button onClick={deseleccionarTodos} style={{marginLeft: 8}}>Deseleccionar</button>
          <button onClick={enviarRecordatorio} disabled={seleccionados.length === 0} style={{marginLeft: 12}}>✉️ Enviar recordatorio</button>
        </div>
        {usuariosFiltrados.length === 0 ? (
          <p>Todos los usuarios han completado el formulario.</p>
        ) : (
          <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => (
                <tr key={u.id || u.email}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(u.email)}
                      onChange={() => toggleSeleccion(u.email)}
                    />
                  </td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol || u.perfil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DetalleUsuariosSinFormulario;
