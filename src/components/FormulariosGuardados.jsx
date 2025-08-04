import { useEffect, useState } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import DetalleFormulario from './DetalleFormulario';
import DetalleUsuariosSinFormulario from './DetalleUsuariosSinFormulario';
import './FormulariosGuardados.css';
import * as XLSX from 'xlsx';

function FormulariosGuardados({ userPerfil, userEmail }) {
  // Filtro por nombre para usuarios sin formulario
  const [filtroNombre, setFiltroNombre] = useState('');
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [formularioSeleccionado, setFormularioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [seleccionados, setSeleccionados] = useState([]);
  const [mostrarDetalleSinFormulario, setMostrarDetalleSinFormulario] = useState(false);

  const tiposFormulario = ['todos', 'socio', 'proveedor-con-hotel', 'proveedor-sin-hotel'];

  useEffect(() => {
    cargarFormularios();
    
    // Cargar usuarios
    const cargarUsuarios = async () => {
    const lista = await FirebaseService.obtenerUsuarios(); // ✅ Correcto
    setUsuarios(lista);
};
    cargarUsuarios();
  }, []);

  const cargarFormularios = async () => {
    try {
      setLoading(true);
      const data = await FirebaseService.obtenerFormularios();
      
      // Mostrar todos los formularios, sin filtrar por usuario ni rol
      console.log('Formularios cargados:', data.length);
      setFormularios(data);
    } catch (error) {
      console.error('Error cargando formularios:', error);
      alert('Error al cargar formularios');
    } finally {
      setLoading(false);
    }
  };

  // Función para capitalizar la primera letra de cada palabra
function capitalizarPalabras(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}
  const exportarAExcel = async () => {
    const formulariosFiltrados = filtroTipo === 'todos' 
      ? formularios 
      : formularios.filter(f => f.tipo === filtroTipo);

    if (formulariosFiltrados.length === 0) {
      alert('No hay formularios para exportar');
      return;
    }

    try {
      // Importar dinámicamente XLSX para que no afecte el bundle
      const XLSX = await import('xlsx');
      
      // Preparar datos para Excel
      const datosExcel = [];
      
      formulariosFiltrados.forEach(formulario => {
        formulario.personas?.forEach((persona, index) => {
          datosExcel.push({
            'ID Formulario': formulario.id,
            'Tipo': formulario.tipo,
            'Fecha Envío': formulario.fechaCreacionString || 'N/A',
            'Usuario': formulario.usuarioCreador || 'N/A',
            
            // Datos empresa
            'Empresa - Nombre': capitalizarPalabras(formulario.datosEmpresa?.empresa) || '',
            'Empresa - Dirección': capitalizarPalabras(formulario.datosEmpresa?.direccion) || '',
            'Empresa - Ciudad': capitalizarPalabras(formulario.datosEmpresa?.ciudad) || '',
            'Empresa - Web': capitalizarPalabras(formulario.datosEmpresa?.paginaWeb) || '',
            'Empresa - Código Postal': formulario.datosEmpresa?.codigoPostal || '',
            'Empresa - Rubro': capitalizarPalabras(formulario.datosEmpresa?.rubro) || '',
            
            // Datos persona
            'Persona #': index + 1,
            'Nombre': capitalizarPalabras(persona.nombre) || '',
            'Apellido': capitalizarPalabras(persona.apellido) || '',
            'Email': persona.email || '',
            'Teléfono': persona.telefono || '',
            'DNI': persona.dni || '',
            'Empresa Persona': persona.empresa || '',
            'Cargo': capitalizarPalabras(persona.cargo) || '',
            
            // Fechas
            'Fecha Llegada': persona.fechaLlegada || '',
            'Hora Llegada': persona.horaLlegada || '',
            'Fecha Salida': persona.fechaSalida || '',
            'Hora Salida': persona.horaSalida || '',
            
            // Días de evento
            'Lunes': persona.lunes ? 'Sí' : 'No',
            'Martes': persona.martes ? 'Sí' : 'No',
            'Miércoles': persona.miercoles ? 'Sí' : 'No',
            'Asiste Cena': persona.asisteCena ? 'Sí' : 'No',
            'Atiende Reuniones': persona.atendeReuniones ? 'Sí' : 'No',
            'Menú Especial': persona.menuEspecial || '',
            
            // Campos específicos por tipo
            'Tipo Habitación': persona.tipoHabitacion || 'N/A',
            'Noches': persona.noches || 'N/A',
            'Acompañantes': persona.acompanantes || 'N/A',
            'Transporte Propio': persona.transportePropio ? 'Sí' : 'No',
            'Alojamiento Externo': persona.alojamientoExterno || 'N/A',
            
            'Comentarios': formulario.comentarios || ''
          });
        });
      });

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      
      // Ajustar ancho de columnas
      const colWidths = Object.keys(datosExcel[0] || {}).map(() => ({ width: 20 }));
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Formularios');
      
      // Descargar archivo
      const nombreArchivo = `formularios_${filtroTipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);
      
      alert('Excel exportado exitosamente');
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('Error al exportar a Excel. Asegúrate de tener la librería xlsx instalada.');
    }
  };

  const eliminarFormulario = async (id) => {
    const formulario = formularios.find(f => f.id === id);
    if (!formulario) {
      alert('No se encontró el formulario.');
      return;
    }
    // Datos básicos para mostrar
    const empresa = formulario.datosEmpresa?.empresa || 'N/A';
    const usuarioCreador = formulario.usuarioCreador || 'N/A';
    const personas = Array.isArray(formulario.personas) && formulario.personas.length > 0
      ? formulario.personas.map(p => `${p.nombre} ${p.apellido}`).join(', ')
      : 'N/A';
    const fechaCreacion = formulario.fechaCreacionString || formulario.fechaCreacion || 'N/A';
    const tipoFormulario = formulario.tipo || 'N/A';
    const mensaje = `¿Estás seguro de eliminar este formulario?\n\n` +
      `Usuario creador: ${usuarioCreador}\n` +
      `Empresa: ${empresa}\n` +
      `Personas asociadas: ${personas}\n` +
      `Fecha creación: ${fechaCreacion}\n` +
      `Tipo de formulario: ${tipoFormulario}`;
    if (window.confirm(mensaje)) {
      try {
        await FirebaseService.eliminarFormulario(id);
        cargarFormularios();
        alert('Formulario eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando formulario:', error);
        alert('Error al eliminar el formulario');
      }
    }
  };

  const verDetalles = (formulario) => {
    setFormularioSeleccionado(formulario);
    setModoEdicion(false);
  };

  const editarFormulario = (formulario) => {
    setFormularioSeleccionado(formulario);
    setModoEdicion(true);
  };

  const guardarEdicion = async (formularioEditado) => {
    try {
      await FirebaseService.actualizarFormulario(formularioEditado.id, formularioEditado);
      setFormularioSeleccionado(null);
      setModoEdicion(false);
      cargarFormularios();
      alert('Formulario actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando formulario:', error);
      alert('Error al actualizar el formulario');
    }
  };

  const formulariosFiltrados = formularios.filter(f => {
    const tipoOk = filtroTipo === 'todos' ? true : f.tipo === filtroTipo;
    const empresaOk = !filtroEmpresa ? true : (f.datosEmpresa?.empresa || '').toLowerCase().includes(filtroEmpresa.toLowerCase());
    return tipoOk && empresaOk;
  });
  // Exportar a HTML con formato
  function exportarAHtml() {
    const style = `
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
        table { width: 100%; border-collapse: collapse; background: #fff; font-size: 0.95em; }
        th, td { border: 1px solid #90caf9; padding: 8px; text-align: left; }
        thead tr { background: #e3f2fd; }
        tfoot tr { background: #bbdefb; font-weight: bold; }
        tbody tr.alt { background: #e3f2fd; }
      </style>
    `;
    let html = `<html><head><meta charset='utf-8'>${style}</head><body>`;
    html += '<table><thead><tr>';
    html += '<th>Fecha</th><th>Tipo</th><th>Empresa</th><th>Personas</th><th>Usuario Creador</th>';
    html += '</tr></thead><tbody>';
    let lastEmpresa = null;
    let colorToggle = false;
    function toTitleCase(str) {
      return String(str).toLowerCase().replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
    }
    formulariosFiltrados.forEach((f, idx) => {
      const empresa = toTitleCase(f.datosEmpresa?.empresa || '');
      const personas = f.personas?.length || 0;
      if (empresa !== lastEmpresa) {
        colorToggle = !colorToggle;
        lastEmpresa = empresa;
      }
      html += `<tr${colorToggle ? ' class="alt"' : ''}>` +
        `<td>${f.fechaCreacionString || 'N/A'}</td><td>${f.tipo}</td><td>${empresa}</td><td>${personas}</td><td>${f.usuarioCreador || 'N/A'}</td>` +
        '</tr>';
    });
    html += '</tbody>';
    html += `<tfoot><tr><td colspan="5">Total formularios: ${formulariosFiltrados.length}</td></tr></tfoot>`;
    html += '</table></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formularios_guardados.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Usuarios no admin que no completaron formulario
  const usuariosSinFormulario = usuarios.filter(u =>
    u.perfil !== 'admin' &&
    !formularios.some(f => f.usuarioCreador === u.email)
  );

  // Filtrado por tipo de usuario y nombre
  const usuariosFiltrados = usuariosSinFormulario.filter(u => {
    const coincideRol = filtroRol === 'todos' ? true : (u.rol || u.perfil) === filtroRol;
    const coincideNombre = filtroNombre.trim() === '' ? true : (`${u.apellido || ''} ${u.nombre || ''}`.toLowerCase().includes(filtroNombre.trim().toLowerCase()));
    return coincideRol && coincideNombre;
  });

  // Manejo de selección
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

  // Exportar a Excel
  const exportarUsuarios = () => {
    const datos = usuariosFiltrados.map(u => ({
      Nombre: u.nombre,
      Email: u.email,
      Empresa: u.empresa || '',
      Rol: u.rol || u.perfil
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UsuariosSinFormulario');
    XLSX.writeFile(wb, 'usuarios_sin_formulario.xlsx');
  };

  // Enviar mail (ejemplo simple, deberías integrar un backend real para envío masivo)
  const enviarRecordatorio = () => {
    const mailto = `mailto:${seleccionados.join(',')}` +
      '?subject=Recordatorio%20de%20completar%20formulario&body=Por%20favor%20complete%20el%20formulario%20pendiente%20en%20RedAcero%20Eventos.';
    window.location.href = mailto;
  };

  if (loading) {
    return <div className="loading">Cargando formularios...</div>;
  }

  return (
    <div className="formularios-guardados">
      <div className="header">
        <h2>Formularios Guardados</h2>
        <div className="controles" style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-tipo"
          >
            {tiposFormulario.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo === 'todos' ? 'Todos los tipos' : tipo}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            placeholder="Filtrar por empresa"
            style={{minWidth:180}}
          />
          {userPerfil === 'admin' && (
            <button
              className="btn-export"
              onClick={exportarAExcel}
              disabled={formulariosFiltrados.length === 0}
            >
              📊 Exportar a Excel
            </button>
          )}
          <button className="btn-export" onClick={exportarAHtml} disabled={formulariosFiltrados.length === 0}>
            🖨️ Exportar a HTML
          </button>
          <button className="btn-refresh" onClick={cargarFormularios}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card" onClick={() => setFiltroTipo('todos')} style={{ cursor: 'pointer' }}>
          <h4>Total Formularios</h4>
          <span className="stat-number">{formulariosFiltrados.length}</span>
        </div>
        <div className="stat-card" onClick={() => setFiltroTipo('socio')} style={{ cursor: 'pointer' }}>
          <h4>Socios</h4>
          <span className="stat-number">
            {formulariosFiltrados.filter(f => f.tipo === 'socio').length}
          </span>
        </div>
        <div className="stat-card" onClick={() => setFiltroTipo('proveedor-con-hotel')} style={{ cursor: 'pointer' }}>
          <h4>Prov. con Hotel</h4>
          <span className="stat-number">
            {formulariosFiltrados.filter(f => f.tipo === 'proveedor-con-hotel').length}
          </span>
        </div>
        <div className="stat-card" onClick={() => setFiltroTipo('proveedor-sin-hotel')} style={{ cursor: 'pointer' }}>
          <h4>Prov. sin Hotel</h4>
          <span className="stat-number">
            {formulariosFiltrados.filter(f => f.tipo === 'proveedor-sin-hotel').length}
          </span>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', background: '#fff3cd', border: '1px solid #ffeeba' }} onClick={() => setMostrarDetalleSinFormulario(true)}>
          <h4>Usuarios sin formulario</h4>
          <span className="stat-number">{usuariosSinFormulario.length}</span>
          <div style={{ fontSize: '0.9rem', color: '#856404', marginTop: 4 }}>Ver listado</div>
        </div>
      </div>

      <div className="tabla-formularios">
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
          <button className="btn-exportar" onClick={exportarAExcel} style={{padding:'6px 16px', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>
            Exportar a Excel
          </button>
        </div>
        {formulariosFiltrados.length === 0 ? (
          <div className="no-data">
            <p>No hay formularios guardados</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Empresa</th>
                <th>Personas</th>
                <th>Usuario Creador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {formulariosFiltrados.map(formulario => (
                <tr key={formulario.id}>
                  <td>{formulario.fechaCreacionString || 'N/A'}</td>
                  <td>
                    <span className={`tipo-badge ${formulario.tipo?.replace(/\s+/g, '-').toLowerCase()}`}>
                      {formulario.tipo}
                    </span>
                  </td>
                  <td>{capitalizarPalabras(formulario.datosEmpresa?.empresa) || 'N/A'}</td>
                  <td>{formulario.personas?.length || 0}</td>
                  <td>{formulario.usuarioCreador || 'N/A'}</td>
                  <td>
                    <div className="acciones">
                      <button 
                        className="btn-ver" 
                        onClick={() => verDetalles(formulario)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-editar" 
                        onClick={() => editarFormulario(formulario)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                          className="btn-eliminar" 
                          onClick={() => eliminarFormulario(formulario.id)}
                          title="Eliminar"
                      >
                        🗑️
                        </button>
                        
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para ver/editar detalles */}
      {formularioSeleccionado && (
        <DetalleFormulario
          formulario={formularioSeleccionado}
          modoEdicion={modoEdicion}
          onCerrar={() => {
            setFormularioSeleccionado(null);
            setModoEdicion(false);
          }}
          onGuardar={guardarEdicion}
          puedeEditar={true}
        />
      )}

      <div className="usuarios-sin-formulario" style={{margin: '2rem 0', padding: '1rem', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8}}>
        <h4>Usuarios que no completaron el formulario</h4>
        <div style={{marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8}}>
          <label>Filtrar por tipo:&nbsp;</label>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
            <option value="todos">Todos</option>
            {[...new Set(usuariosSinFormulario.map(u => u.rol || u.perfil))].map(rol => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Apellido + nombre"
            style={{marginLeft: 8, minWidth: 180}}
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
          />
          <button onClick={exportarUsuarios} style={{marginLeft: 12}}>📥 Exportar a Excel</button>
          <button onClick={seleccionarTodos} style={{marginLeft: 12}}>Seleccionar todos</button>
          <button onClick={deseleccionarTodos} style={{marginLeft: 8}}>Deseleccionar</button>
          <button onClick={enviarRecordatorio} disabled={seleccionados.length === 0} style={{marginLeft: 12}}>✉️ Enviar recordatorio</button>
        </div>
        {/* Tabla de usuarios sin formulario eliminada. Ahora solo se muestra la tabla principal de formularios guardados. */}
      </div>
    {/* Modal para usuarios sin formulario */}
    {mostrarDetalleSinFormulario && (
      <DetalleUsuariosSinFormulario
        usuarios={usuariosSinFormulario}
        onClose={() => setMostrarDetalleSinFormulario(false)}
      />
    )}
  </div>
  );
}

export default FormulariosGuardados;