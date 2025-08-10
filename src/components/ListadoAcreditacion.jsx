// Capitaliza solo la primera letra de la cadena
function capitalizarPrimera(str) {
  if (!str) return '';
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Capitaliza cada palabra: primera letra mayúscula, resto minúscula
function capitalizarPalabras(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';

function ListadoAcreditacion({ eventId }) {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  function handleSort(key) {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }
  const [formularios, setFormularios] = useState([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroConComentario, setFiltroConComentario] = useState('');
  const [filtroAsisteCena, setFiltroAsisteCena] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__setAsisteCenaSi) {
      setFiltroAsisteCena('si');
      window.__setAsisteCenaSi = false;
    }
    if (typeof window !== 'undefined' && window.__setAtiendeReunionesSi) {
      setFiltroAtiendeReuniones('si');
      window.__setAtiendeReunionesSi = false;
    }
  }, []);
  const [filtroAtiendeReuniones, setFiltroAtiendeReuniones] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFormularios = async () => {
      setLoading(true);
      try {
        const data = await FirebaseService.obtenerFormulariosPorEvento(eventId);
        setFormularios(data);
      } catch (e) {
        alert('Error al cargar formularios');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) cargarFormularios();
  }, [eventId]);

  // Filtrar personas y agregar contador único y por empresa
  let contadorUnico = 1;
  const contadorPorEmpresa = {};
  let personasDetalladas = [];

  // Controlar que no haya formularios para el evento destacado
  // Si el evento está marcado como destacado y no hay formularios, no mostrar personas
  const eventoDestacado = window?.eventoDestacadoId || null;
  const hayFormulariosEventoDestacado = eventoDestacado && formularios.some(f => f.eventoId === eventoDestacado);

  if (!eventoDestacado || hayFormulariosEventoDestacado || eventId !== eventoDestacado) {
    formularios.forEach(formulario => {
      formulario.personas?.forEach((persona, idx) => {
        const tieneComentarioPersona = persona.comentario && persona.comentario.trim() !== '';
        const tieneComentarioFormulario = formulario.comentarios && formulario.comentarios.trim() !== '';
        const pasaFiltroComentario =
          filtroConComentario === '' ||
          (filtroConComentario === 'si' ? (tieneComentarioPersona || tieneComentarioFormulario) : (!tieneComentarioPersona && !tieneComentarioFormulario));
        if (
          (!filtroEmpresa || (formulario.datosEmpresa?.empresa || '').toLowerCase().includes(filtroEmpresa.toLowerCase())) &&
          (!filtroTipo || formulario.tipo === filtroTipo) &&
          (!filtroNombre || ((persona.nombre + ' ' + persona.apellido).toLowerCase().includes(filtroNombre.toLowerCase()))) &&
          (!filtroCargo || (persona.cargo || '').toLowerCase().includes(filtroCargo.toLowerCase())) &&
          pasaFiltroComentario &&
          (filtroAsisteCena === '' || (filtroAsisteCena === 'si' ? String(persona.asisteCena).toLowerCase() === 'si' : String(persona.asisteCena).toLowerCase() !== 'si')) &&
          (filtroAtiendeReuniones === '' || (filtroAtiendeReuniones === 'si' ? String(persona.atiendeReuniones).toLowerCase() === 'si' : String(persona.atiendeReuniones).toLowerCase() !== 'si'))
        ) {
          const empresa = formulario.datosEmpresa?.empresa || '';
          if (!contadorPorEmpresa[empresa]) contadorPorEmpresa[empresa] = 1;
          else contadorPorEmpresa[empresa]++;
          personasDetalladas.push({
            // idFormulario: formulario.id, // Eliminado
            contadorUnico: contadorUnico++,
            contadorEmpresa: contadorPorEmpresa[empresa],
            tipo: formulario.tipo,
            fechaEnvio: formulario.fechaCreacionString || '',
            usuario: formulario.usuarioCreador || '',
            empresa: empresa,
            direccion: formulario.datosEmpresa?.direccion || '',
            ciudad: formulario.datosEmpresa?.ciudad || '',
            web: formulario.datosEmpresa?.paginaWeb || '',
            codigoPostal: formulario.datosEmpresa?.codigoPostal || '',
            rubro: formulario.datosEmpresa?.rubro || '',
            personaNum: idx + 1,
            nombre: persona.nombre || '',
            apellido: persona.apellido || '',
            email: persona.email || '',
            telefono: persona.telefono || '',
            dni: persona.dni || '',
            empresaPersona: persona.empresa || '',
            cargo: persona.cargo || '',
            fechaLlegada: persona.fechaLlegada || '',
            horaLlegada: persona.horaLlegada || '',
            fechaSalida: persona.fechaSalida || '',
            horaSalida: persona.horaSalida || '',
            lunes: String(persona.lunes).toLowerCase() === 'si' ? 'Sí' : 'No',
            martes: String(persona.martes).toLowerCase() === 'si' ? 'Sí' : 'No',
            miercoles: String(persona.miercoles).toLowerCase() === 'si' ? 'Sí' : 'No',
            asisteCena: String(persona.asisteCena).toLowerCase() === 'si' ? 'Sí' : 'No',
            atiendeReuniones: String(persona.atiendeReuniones).toLowerCase() === 'si' ? 'Sí' : 'No',
            menuEspecial: persona.menuEspecial || '',
            tipoHabitacion: persona.tipoHabitacion || '',
            comparteCon: persona.comparteCon || '',
            comentarioHabitacion: persona.comentario || '',
            noches: persona.noches || '',
            comentarios: formulario.comentarios || ''
          });
        }
      });
    });
  }

  // Ordenar por columna seleccionada
  if (sortConfig.key) {
    personasDetalladas = [...personasDetalladas].sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Exportar a HTML
  function exportarAHtml() {
    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Listado detallado de personas para acreditación</title>
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #bbb; padding: 4px; text-align: left; font-size: 0.85em; }
          th { background: #e3f2fd; }
        </style>
      </head>
      <body>
        <h2>Listado detallado de personas para acreditación</h2>
        <table>
          <thead>
            <tr>
              <th style="min-width:40px">#</th>
              <th style="min-width:40px"># x Empresa</th>
              <th style="min-width:70px">Tipo</th>
              <th style="min-width:70px">Fecha Envío</th>
              <th style="min-width:90px">Usuario</th>
              <th style="min-width:90px">Empresa</th>
              <th style="min-width:70px">Dirección</th>
              <th style="min-width:70px">Ciudad</th>
              <th style="min-width:70px">Web</th>
              <th style="min-width:50px">Cod. Postal</th>
              <th style="min-width:60px">Rubro</th>
              <th style="min-width:40px"># Persona</th>
              <th style="min-width:70px">Nombre</th>
              <th style="min-width:70px">Apellido</th>
              <th style="min-width:90px">Email</th>
              <th style="min-width:70px">Teléfono</th>
              <th style="min-width:50px">DNI</th>
              <th style="min-width:70px">Empresa Persona</th>
              <th style="min-width:70px">Cargo</th>
              <th style="min-width:70px">Fecha Llegada</th>
              <th style="min-width:70px">Hora Llegada</th>
              <th style="min-width:70px">Fecha Salida</th>
              <th style="min-width:70px">Hora Salida</th>
              <th style="min-width:40px">Lunes</th>
              <th style="min-width:40px">Martes</th>
              <th style="min-width:40px">Miércoles</th>
              <th style="min-width:40px">Asiste Cena</th>
              <th style="min-width:40px">Atiende Reuniones</th>
              <th style="min-width:70px">Menú Especial</th>
              <th style="min-width:70px">Tipo Habitación</th>
              <th style="min-width:70px">Comparte con</th>
              <th style="min-width:70px">Comentario habitación</th>
              <th style="min-width:40px">Noches</th>
              <th style="min-width:70px">Comentarios</th>
            </tr>
          </thead>
          <tbody>
            ${personasDetalladas.map(p => `
              <tr>
                <td>${p.contadorUnico}</td>
                <td>${p.contadorEmpresa}</td>
                <td>${p.tipo}</td>
                <td>${p.fechaEnvio}</td>
                <td>${p.usuario}</td>
                <td>${p.empresa}</td>
                <td>${p.direccion}</td>
                <td>${p.ciudad}</td>
                <td>${p.web}</td>
                <td>${p.codigoPostal}</td>
                <td>${p.rubro}</td>
                <td>${p.personaNum}</td>
                <td>${p.nombre}</td>
                <td>${p.apellido}</td>
                <td>${p.email}</td>
                <td>${p.telefono}</td>
                <td>${p.dni}</td>
                <td>${p.empresaPersona}</td>
                <td>${p.cargo}</td>
                <td>${p.fechaLlegada}</td>
                <td>${p.horaLlegada}</td>
                <td>${p.fechaSalida}</td>
                <td>${p.horaSalida}</td>
                <td>${p.lunes}</td>
                <td>${p.martes}</td>
                <td>${p.miercoles}</td>
                <td>${p.asisteCena}</td>
                <td>${p.atiendeReuniones}</td>
                <td>${p.menuEspecial}</td>
                <td>${p.tipoHabitacion}</td>
                <td>${p.comparteCon}</td>
                <td>${p.comentarioHabitacion}</td>
                <td>${p.noches}</td>
                <td>${p.comentarios}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ListadoAcreditacion.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Exportar a Excel (xlsx) usando SheetJS si lo tienes instalado
  async function exportarAExcel() {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(personasDetalladas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Acreditacion');
    XLSX.writeFile(wb, 'ListadoAcreditacion.xlsx');
  }

  return (
    <div style={{padding:'2rem'}}>
      <h2>Listado detallado de personas para acreditación</h2>
      <div style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center', fontSize:'0.82em'}}>
        {/* ...existing filtros y botones... */}
        <input
          type="text"
          placeholder="Empresa"
          value={filtroEmpresa}
          onChange={e => setFiltroEmpresa(e.target.value)}
          style={{minWidth:90, maxWidth:120, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}
        />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{minWidth:90, maxWidth:120, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}>
          <option value="">Tipo</option>
          <option value="socio">Socio</option>
          <option value="proveedor-con-hotel">Proveedor con hotel</option>
          <option value="proveedor-sin-hotel">Proveedor sin hotel</option>
        </select>
        <input
          type="text"
          placeholder="Nombre o Apellido"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          style={{minWidth:180, maxWidth:320, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}
        />
        <input
          type="text"
          placeholder="Cargo"
          value={filtroCargo}
          onChange={e => setFiltroCargo(e.target.value)}
          style={{minWidth:120, maxWidth:180, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}
        />
        <select
          value={filtroConComentario}
          onChange={e => setFiltroConComentario(e.target.value)}
          style={{minWidth:120, maxWidth:160, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}
        >
          <option value="">Con comentario</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        <select
          value={filtroAsisteCena}
          onChange={e => setFiltroAsisteCena(e.target.value)}
          style={{minWidth:120, maxWidth:160, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}
        >
          <option value="">Asiste cena</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        <select
          value={filtroAtiendeReuniones}
          onChange={e => setFiltroAtiendeReuniones(e.target.value)}
          style={{minWidth:120, maxWidth:160, fontSize:'0.82em', padding:'4px 8px', borderRadius:3, border:'1px solid #90caf9'}}
        >
          <option value="">Atiende reuniones</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        <button onClick={exportarAHtml} style={{padding:'4px 10px', background:'#388e3c', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontWeight:500, fontSize:'0.82em'}}>
          <span role="img" aria-label="Exportar HTML" style={{fontSize:'1em'}}>📄</span> HTML
        </button>
        <button onClick={exportarAExcel} style={{padding:'4px 10px', background:'#1976d2', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontWeight:500, fontSize:'0.82em'}}>
          <span role="img" aria-label="Exportar Excel" style={{fontSize:'1em'}}>📊</span> Excel
        </button>
        <button onClick={() => window.location.reload()} style={{padding:'4px 10px', background:'#ffa726', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontWeight:500, fontSize:'0.82em'}}>
          <span role="img" aria-label="Actualizar" style={{fontSize:'1em'}}>🔄</span> Actualizar
        </button>
      </div>
      <div style={{ marginBottom: 8, fontWeight: 500, color: '#2c3e50', fontSize: 15 }}>
          Personas listadas: {personasDetalladas.length}
      </div>
      {loading ? (
        <div style={{margin:'2rem 0', fontSize:'0.82em'}}>Cargando datos...</div>
      ) : (
        <div style={{overflowX:'auto', maxHeight:'70vh', fontSize:'0.78em'}}>
          <table style={{borderCollapse:'collapse', width:'100%', fontSize:'0.78em'}}>
            <thead style={{position:'sticky', top:0, zIndex:2, background:'#e3f2fd'}}>
              <tr>
                <th style={{minWidth:'40px'}}>#</th>
                <th style={{minWidth:'40px'}}># x Empresa</th>
                <th style={{minWidth:'70px', cursor:'pointer'}} onClick={() => handleSort('tipo')}>
                  Tipo {sortConfig.key === 'tipo' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={{minWidth:'70px'}}>Fecha Carga</th>
                <th style={{minWidth:'90px'}}>Usuario</th>
                <th style={{minWidth:'90px', cursor:'pointer'}} onClick={() => handleSort('empresa')}>
                  Empresa {sortConfig.key === 'empresa' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={{minWidth:'70px'}}>Dirección</th>
                <th style={{minWidth:'70px'}}>Ciudad</th>
                <th style={{minWidth:'70px'}}>Web</th>
                <th style={{minWidth:'50px'}}>Cod. Postal</th>
                <th style={{minWidth:'60px'}}>Rubro</th>
                <th style={{minWidth:'40px'}}># Persona</th>
                <th style={{minWidth:'70px'}}>Nombre</th>
                <th style={{minWidth:'70px'}}>Apellido</th>
                <th style={{minWidth:'90px'}}>Email</th>
                <th style={{minWidth:'70px'}}>Teléfono</th>
                <th style={{minWidth:'50px'}}>DNI</th>
                <th style={{minWidth:'70px'}}>Cargo</th>
                <th style={{minWidth:'70px'}}>Fecha Llegada</th>
                <th style={{minWidth:'70px'}}>Hora Llegada</th>
                <th style={{minWidth:'70px'}}>Fecha Salida</th>
                <th style={{minWidth:'70px'}}>Hora Salida</th>
                <th style={{minWidth:'40px'}}>Lunes</th>
                <th style={{minWidth:'40px'}}>Martes</th>
                <th style={{minWidth:'40px'}}>Miércoles</th>
                <th style={{minWidth:'40px'}}>Asiste Cena</th>
                <th style={{minWidth:'40px'}}>Atiende Reuniones</th>
                <th style={{minWidth:'70px'}}>Menú Especial</th>
                <th style={{minWidth:'70px'}}>Tipo Habitación</th>
                <th style={{minWidth:'70px'}}>Comparte con</th>
                <th style={{minWidth:'180px', maxWidth:'320px', whiteSpace:'pre-line', wordBreak:'break-word'}}>Comentario habitación</th>
                <th style={{minWidth:'40px'}}>Noches</th>
                <th style={{minWidth:'180px', maxWidth:'320px', whiteSpace:'pre-line', wordBreak:'break-word'}}>Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Paleta de colores pastel
                const pastelColors = [
                  '#ffe0e0', '#e0ffe0', '#e0e0ff', '#fffbe0', '#e0fff7', '#f0e0ff', '#e0f7ff', '#ffe0f7', '#f7ffe0', '#e0f0ff', '#f0ffe0', '#ffe0f0'
                ];
                // Agrupar por empresa
                const empresasUnicas = Array.from(new Set(personasDetalladas.map(p => (p.empresa || '').trim())));
                const empresaColorMap = {};
                empresasUnicas.forEach((emp, i) => {
                  empresaColorMap[emp] = pastelColors[i % pastelColors.length];
                });
                return personasDetalladas.map((p, i) => (
                  <tr key={i} style={{background: empresaColorMap[(p.empresa || '').trim()] || '#fff'}}>
                    <td>{p.contadorUnico}</td>
                    <td>{p.contadorEmpresa}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.78em',
                        fontWeight: 600,
                        color: '#fff',
                        background: p.tipo === 'socio' ? '#1976d2' : (p.tipo === 'proveedor-con-hotel' ? '#388e3c' : (p.tipo === 'proveedor-sin-hotel' ? '#ffa726' : '#757575')),
                        border: '1px solid #90caf9',
                        minWidth: 80,
                        textAlign: 'center'
                      }}>
                        {p.tipo === 'socio' && <span role="img" aria-label="Socio" style={{fontSize:'1.1em'}}>🧑‍💼</span>}
                        {p.tipo === 'proveedor-con-hotel' && <span role="img" aria-label="Prov. c/hotel" style={{fontSize:'1.1em'}}>🏨</span>}
                        {p.tipo === 'proveedor-sin-hotel' && <span role="img" aria-label="Prov. s/hotel" style={{fontSize:'1.1em'}}>🚗</span>}
                        {p.tipo === 'socio' ? 'Socio' : (p.tipo === 'proveedor-con-hotel' ? 'Prov. c/hotel' : (p.tipo === 'proveedor-sin-hotel' ? 'Prov. s/hotel' : p.tipo))}
                      </span>
                    </td>
                    <td>{p.fechaEnvio}</td>
                    <td style={{textAlign:'left'}}>{p.usuario}</td>
                    <td style={{textAlign:'left'}}>{capitalizarPalabras(p.empresa)}</td>
                    <td>{capitalizarPrimera(p.direccion)}</td>
                    <td>{capitalizarPrimera(p.ciudad)}</td>
                    <td>{p.web}</td>
                    <td>{p.codigoPostal}</td>
                    <td style={{textAlign:'left'}}>{capitalizarPrimera(p.rubro)}</td>
                    <td>{p.personaNum}</td>
                    <td style={{textAlign:'left'}}>{capitalizarPalabras(p.nombre)}</td>
                    <td>{capitalizarPalabras(p.apellido)}</td>
                    <td style={{textAlign:'left'}}>{p.email}</td>
                    <td>{p.telefono}</td>
                    <td>{p.dni}</td>
                    <td style={{textAlign:'left'}}>{capitalizarPrimera(p.cargo)}</td>
                    <td>{p.fechaLlegada}</td>
                    <td>{p.horaLlegada}</td>
                    <td>{p.fechaSalida}</td>
                    <td>{p.horaSalida}</td>
                    <td>{p.lunes}</td>
                    <td>{p.martes}</td>
                    <td>{p.miercoles}</td>
                    <td>{p.asisteCena}</td>
                    <td>{p.atiendeReuniones}</td>
                    <td>{p.menuEspecial}</td>
                    <td>{p.tipoHabitacion}</td>
                    <td>{p.comparteCon}</td>
                    <td style={{minWidth:'180px', maxWidth:'320px', whiteSpace:'pre-line', wordBreak:'break-word', textAlign:'left'}}>{capitalizarPrimera(p.comentarioHabitacion)}</td>
                    <td>{p.noches}</td>
                    <td style={{minWidth:'180px', maxWidth:'320px', whiteSpace:'pre-line', wordBreak:'break-word', textAlign:'left'}}>{capitalizarPrimera(p.comentarios)}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListadoAcreditacion;