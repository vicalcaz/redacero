import React, { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';

// Enviar mail real usando la API de Vercel 
async function sendMailViaApi({ to, subject, html }) {
  const res = await fetch('/api/sendMail.mjs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
  console.log('Enviando mail a:', to, 'Asunto:', subject, 'Contenido:', html);
  let data = null;
  let text = '';
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    text = await res.text();
  }
  if (!res.ok) {
    if (data && data.error) throw new Error(data.error);
    if (text) throw new Error(text);
    throw new Error('Error enviando mail');
  }
  if (data && !data.success) throw new Error(data.message || 'Error enviando mail');
  return data || text;
}
import * as XLSX from 'xlsx';
import './Newsletter.css';

function Newsletter() {
  const [zoomPreview, setZoomPreview] = useState(50); // porcentaje de zoom para previsualización
  const [usuarios, setUsuarios] = useState([]);
  const [mails, setMails] = useState([]);
  const [asociaciones, setAsociaciones] = useState({});
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [mailSeleccionado, setMailSeleccionado] = useState('');
  const [previewMail, setPreviewMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formularios, setFormularios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  useEffect(() => {
    cargarEventos();
    // Obtener usuario logueado (ajusta según tu auth)
    FirebaseService.obtenerUsuarioActual?.().then(user => {
      console.log('Usuario logueado:', user);
      setUsuarioLogueado(user);
    });
  }, []);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarDatos(eventoSeleccionado);
    }
  }, [eventoSeleccionado]);

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const eventosDB = await FirebaseService.obtenerEventos?.();
      setEventos(eventosDB || []);
      if ((eventosDB || []).length > 0) {
        setEventoSeleccionado(eventosDB[0].id);
      }
    } catch (e) {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatos = async (eventoId) => {
    setLoading(true);
    try {
      const [usuariosDB, mailsDB, asociacionesDB, formulariosDB] = await Promise.all([
        FirebaseService.obtenerUsuariosParaNewsletter?.(),
        FirebaseService.obtenerMailsConfigurados?.(),
        FirebaseService.obtenerAsociacionesMailUsuarioEvento?.(eventoId),
        FirebaseService.obtenerFormulariosPorEvento?.(eventoId)
      ]);
      setUsuarios(usuariosDB || []);
      setMails(mailsDB || []);
      // Mapear por usuarioId para acceso rápido
      const map = {};
      (asociacionesDB || []).forEach(a => {
        map[a.usuarioId] = a;
      });
      setAsociaciones(map);
      setFormularios(formulariosDB || []);
    } catch (e) {
      alert('Error cargando datos de newsletter');
    } finally {
      setLoading(false);
    }
  };

  const handleAsociarMail = async (usuarioId) => {
    if (!mailSeleccionado) {
      alert('Selecciona un mail para asociar');
      return;
    }
    setGuardando(true);
    try {
      const usuario = usuarios.find(u => u.id === usuarioId);
      await FirebaseService.asociarMailAUsuarioEvento?.({
        usuarioId,
        mailId: mailSeleccionado,
        eventoId: eventoSeleccionado,
        usuario: usuario?.nombre || '',
        mail: usuario?.email || '',
        mailasociado: true,
        mailenviado: false,
        fechaenvio: null,
        mailleido: false,
        fechaleido: null
      });
      await cargarDatos(eventoSeleccionado);
    } catch (e) {
      alert('Error asociando mail');
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviarMail = async (usuarioId) => {
    const asociacion = asociaciones[usuarioId];
    if (!asociacion || !asociacion.mailId) {
      alert('No hay mail asociado para este usuario.');
      return;
    }
    const usuario = usuarios.find(u => u.id === usuarioId);
    const mail = mails.find(m => m.id === asociacion.mailId);
    if (!usuario || !mail) {
      alert('No se encontró el usuario o el mail.');
      return;
    }
    setGuardando(true);
    try {
      // Generar link de login con email y password (espacio)
      const loginUrl = `https://redacero.vercel.app/login?email=${encodeURIComponent(usuario.email)}&password=%20`;
      let cuerpoMail = mail.cuerpo || '';
      // Botón centrado al final
      const linkHtml = `<div style="text-align:center;margin:2em 0 1.5em 0"><a href="${loginUrl}" style="background:#1976d2;color:#fff;padding:0.7em 1.5em;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Acceder al sistema</a></div>`;
      // Tracking pixel para mail leído (ID de Firestore: usuarioId_eventoId)
      const pixelUrl = `https://redacero.vercel.app/api/readMail?id=${usuarioId}_${eventoSeleccionado}`;
      const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" />`;
      // El HTML del mail es: cuerpo original + botón + tracking pixel
      const htmlConPixel = cuerpoMail + linkHtml + trackingPixel;
      await sendMailViaApi({
        to: usuario.email,
        subject: mail.asunto || mail.nombre || 'Newsletter',
        html: htmlConPixel
      });
      // Marcar como enviado usando la función correcta
      await FirebaseService.marcarMailEnviadoUsuarioEvento?.({
        usuarioId,
        eventoId: eventoSeleccionado
      });
      await cargarDatos(eventoSeleccionado);
    } catch (e) {
      alert('Error enviando mail: ' + (e.message || e));
    } finally {
      setGuardando(false);
    }
  };

  // (Eliminado: ahora se calcula con los nuevos filtros más abajo)
  let usuariosFiltrados = usuarios;
  if (filtroRol !== 'todos') {
    usuariosFiltrados = usuariosFiltrados.filter(u => (u.rol || u.perfil) === filtroRol);
  }
  if (filtroEmpresa.trim()) {
    usuariosFiltrados = usuariosFiltrados.filter(u => (u.empresa || '').toLowerCase().includes(filtroEmpresa.trim().toLowerCase()));
  }
  if (filtroNombre.trim()) {
    const nombreBuscado = filtroNombre.trim().toLowerCase();
    usuariosFiltrados = usuariosFiltrados.filter(u =>
      (u.nombre || '').toLowerCase().includes(nombreBuscado) ||
      (u.apellido || '').toLowerCase().includes(nombreBuscado)
    );
  }

  const exportarAExcel = () => {
    if (!usuariosFiltrados.length) {
      alert('No hay usuarios para exportar.');
      return;
    }
    const datos = usuariosFiltrados.map(u => ({
      Nombre: u.nombre,
      Email: u.email,
      Rol: u.rol || u.perfil,
      'Mail asociado': mails.find(m => m.id === asociaciones[u.id])?.nombre || '',
      'Mail enviado': getMailEnviadoYLeido(u).enviado ? 'Sí' : 'No',
      'Mail leído': getMailEnviadoYLeido(u).leido ? 'Sí' : 'No',
      'Formulario completado': getFormularioCompletado(u) ? 'Sí' : 'No',
      Evento: eventoSeleccionado
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UsuariosNewsletter');
    XLSX.writeFile(wb, 'usuarios_newsletter.xlsx');
  };

  // Helpers para estado de mail y formulario
  function getMailEnviadoYLeido(usuario) {
    const asociacion = asociaciones[usuario.id];
    if (!asociacion) return { enviado: false, leido: false };
    return {
      enviado: !!asociacion.mailenviado,
      leido: !!asociacion.mailleido
    };
  }

  function getFormularioCompletado(usuario) {
    return formularios.some(f => f.usuarioCreador === usuario.email);
  }

  return (
    <div className="newsletter-container">
      <h2>📧 Newsletter</h2>
      <div className="newsletter-controls">
        <label>Evento:&nbsp;</label>
        <select value={eventoSeleccionado} onChange={e => setEventoSeleccionado(e.target.value)}>
          {eventos.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.nombre || ev.id}</option>
          ))}
        </select>
        <label style={{marginLeft: 16}}>Mail a asociar:&nbsp;</label>
        <select value={mailSeleccionado} onChange={e => setMailSeleccionado(e.target.value)}>
          <option value="">-- Selecciona mail --</option>
          {mails.map(m => (
            <option key={m.id} value={m.id}>{m.nombre || m.asunto || m.id}</option>
          ))}
        </select>
        <button className="btn-exportar" onClick={exportarAExcel} style={{marginLeft: 16}}>📤 Exportar a Excel</button>
        <button className="btn-recargar" onClick={() => cargarDatos(eventoSeleccionado)} style={{marginLeft: 8}}>🔄 Recargar</button>
        {usuarioLogueado?.rol === 'admin' && (
          <button className="btn-admin" style={{marginLeft:16}}>Administración</button>
        )}
        {/* Filtros avanzados */}
        <div style={{marginTop:16, display:'flex', gap:'1rem', flexWrap:'wrap'}}>
          <div>
            <label>Filtrar por rol:&nbsp;</label>
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="admin">Admin</option>
              <option value="socio">Socio</option>
              <option value="proveedor-con-hotel">Proveedor con hotel</option>
              <option value="proveedor-sin-hotel">Proveedor sin hotel</option>
            </select>
          </div>
          <div>
            <label>Filtrar por empresa:&nbsp;</label>
            <input type="text" value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} placeholder="Empresa..." />
          </div>
          <div>
            <label>Filtrar por nombre/apellido:&nbsp;</label>
            <input type="text" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} placeholder="Nombre o apellido..." />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="loading-container"><div className="loading-spinner"></div> Cargando...</div>
      ) : (
        <div className="newsletter-table-container">
          <table className="newsletter-table newsletter-table-sm" style={{fontSize:'1.05em'}}>
            <thead>
              <tr>
                <th className="th-sm">Nombre</th>
                <th className="th-sm">Email</th>
                <th className="th-sm">Rol</th>
                <th className="th-sm">Mail asociado</th>
                <th className="th-sm">Mail enviado</th>
                <th className="th-sm">Mail leído</th>
                <th className="th-sm">Formulario</th>
                <th className="th-sm">Fecha envío</th>
                <th className="th-sm">Fecha lectura</th>
                <th className="th-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="tbody-sm">
              {usuariosFiltrados.map(u => {
                const estadoMail = getMailEnviadoYLeido(u);
                const formularioCompletado = getFormularioCompletado(u);
                return (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{u.rol || u.perfil}</td>
                    <td style={{textAlign:'center'}}>
                      {asociaciones[u.id]?.mailasociado ? (
                        <span title={mails.find(m => m.id === asociaciones[u.id]?.mailId)?.nombre || ''} style={{color:'green',fontWeight:'bold',fontSize:'1.15em'}}>✔️</span>
                      ) : (
                        <span style={{color:'#bbb',fontSize:'1.15em'}}>—</span>
                      )}
                    </td>
                    <td style={{textAlign:'center'}}>
                      {estadoMail.enviado ? <span style={{color:'green',fontSize:'1.15em'}}>📤</span> : <span style={{color:'#bbb',fontSize:'1.15em'}}>—</span>}
                    </td>
                    <td style={{textAlign:'center'}}>
                      {estadoMail.leido ? <span style={{color:'green',fontSize:'1.15em'}}>👁️</span> : <span style={{color:'#bbb',fontSize:'1.15em'}}>—</span>}
                    </td>
                    <td style={{textAlign:'center'}}>
                      {formularioCompletado ? <span style={{color:'green',fontSize:'1.15em'}}>✔️</span> : <span style={{color:'#bbb',fontSize:'1.15em'}}>—</span>}
                    </td>
                    <td style={{textAlign:'center'}}>
                      {asociaciones[u.id]?.fechaenvio ? (
                        <div style={{fontSize:'0.84em',color:'#555'}}>{new Date(asociaciones[u.id].fechaenvio).toLocaleString()}</div>
                      ) : <span style={{color:'#bbb',fontSize:'1.15em'}}>—</span>}
                    </td>
                    <td style={{textAlign:'center'}}>
                      {asociaciones[u.id]?.fechaleido ? (
                        <div style={{fontSize:'0.84em',color:'#555'}}>{new Date(asociaciones[u.id].fechaleido).toLocaleString()}</div>
                      ) : <span style={{color:'#bbb',fontSize:'1.15em'}}>—</span>}
                    </td>
                    <td>
                      <button
                        className="btn-asociar btn-sm"
                        disabled={guardando || !mailSeleccionado}
                        onClick={() => handleAsociarMail(u.id)}
                        style={{fontSize:'1.05em'}}
                      >
                        Asociar
                      </button>
                      {asociaciones[u.id]?.mailId && (
                        <>
                          <button
                            className="btn-preview btn-sm"
                            onClick={() => setPreviewMail(mails.find(m => m.id === asociaciones[u.id]?.mailId))}
                            style={{fontSize:'1.05em'}}
                          >
                            👁️
                          </button>
                          <button
                            className="btn-enviar btn-sm"
                            disabled={guardando}
                            onClick={() => handleEnviarMail(u.id)}
                            style={{fontSize:'1.05em'}}
                          >
                            📤
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal de previsualización */}
      {previewMail && (
        <div className="modal-overlay" onClick={() => setPreviewMail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:600}}>
            <button className="modal-close" onClick={() => setPreviewMail(null)}>✖️</button>
            <h3>Previsualización de mail</h3>
            <div style={{marginBottom:8}}>
              <strong>Zoom:</strong> 
              <input
                type="number"
                min={1}
                max={200}
                value={zoomPreview}
                onChange={e => setZoomPreview(Number(e.target.value))}
                style={{width:50,marginLeft:8,marginRight:4}}
              />%
            </div>
            <div><strong>Asunto:</strong> {previewMail.asunto}</div>
            <div style={{margin:'1rem 0',border:'1px solid #eee',padding:12,background:'#fafafa',overflow:'auto'}}>
              <div
                style={{transform:`scale(${zoomPreview/100})`,transformOrigin:'top left',width:'100%',minHeight:50}}
                dangerouslySetInnerHTML={{__html: previewMail.cuerpo}} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Newsletter;

