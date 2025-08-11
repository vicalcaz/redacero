import { useState, useEffect } from 'react';

// ...existing code...
import AdminNavBar from './AdminNavBar';
import UserManagement from './UserManagement';
import EventManagement from './EventManagement';
import FormularioManagement from './FormularioManagement';
import FormulariosGuardados from './FormulariosGuardados';
import PersonalizacionFormularios from './PersonalizacionFormularios';
import EventosDestacados from './EventosDestacados';
import { FirebaseService } from '../services/FirebaseService';
import Newsletter from './Newsletter';
import './Dashboard.css';
import RoomingList from './RoomingList.jsx';
import ListadoReferentes from './ListadoReferentes.jsx';
import ListadoAcreditacion from './ListadoAcreditacion.jsx';
// Utilidad para obtener rango de fechas entre dos strings YYYY-MM-DD (inclusive)
// Recibe opcionalmente horaSalida. Si horaSalida <= '10:00', no incluye el día de salida.
function getRangoFechas(desde, hasta, horaSalida) {
  const fechas = [];
  let d = new Date(desde + 'T00:00:00Z');
  let h = new Date(hasta + 'T00:00:00Z');
  // Si la hora de salida es <= 10:00, no incluir el día de salida
  if (!horaSalida || horaSalida <= '10:00') {
    h.setUTCDate(h.getUTCDate() - 1);
  }
  while (d <= h) {
    fechas.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return fechas;
}

function ResumenHabitaciones({ formularios }) {
  // Map: { fecha: { dobles: count, matrimoniales: count } }
  // Nuevo algoritmo: para cada día, contar habitaciones únicas (dobles y matrimoniales) sin doble conteo
  const habitacionesPorDia = {};
  formularios.forEach(f => {
    if (!f.personas || !Array.isArray(f.personas)) return;
    // Agrupar personas por habitación (doble: pareja o individual, matrimonial)
    const grupos = {};
    f.personas.forEach(p => {
      if (!p.fechaLlegada || !p.fechaSalida) return;
      if (p.tipoHabitacion === 'doble' || p.tipoHabitacion === 'matrimonial') {
        let key;
        if (p.comparteHabitacion && p.comparteCon) {
          const ids = [String(p.id), String(p.comparteCon)].sort();
          key = ids.join('_');
        } else {
          key = String(p.id);
        }
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(p);
      }
    });
    // Para cada grupo, asignar fechas ocupadas y tipo
    Object.values(grupos).forEach(grupo => {
      const tipos = grupo.map(p => p.tipoHabitacion).filter(t => t);
      let tipo = tipos.length > 0 ? tipos[0] : '';
      if (tipos.length > 1 && !tipos.every(t => t === tipo)) tipo = 'varios';
      // Obtener mínima fecha de llegada y máxima fecha de salida
      let minLlegada = null, maxSalida = null;
      grupo.forEach(p => {
        if (p.fechaLlegada) {
          const llegada = new Date(p.fechaLlegada);
          if (!minLlegada || llegada < minLlegada) minLlegada = llegada;
        }
        if (p.fechaSalida) {
          const salida = new Date(p.fechaSalida);
          if (!maxSalida || salida > maxSalida) maxSalida = salida;
        }
      });
      // Rango de fechas ocupadas por este grupo
      const fechas = (minLlegada && maxSalida) ? getRangoFechas(minLlegada.toISOString().slice(0,10), maxSalida.toISOString().slice(0,10), grupo[0].horaSalida) : [];
      fechas.forEach(fecha => {
        if (!habitacionesPorDia[fecha]) habitacionesPorDia[fecha] = { dobles: 0, matrimoniales: 0 };
        if (tipo === 'doble') {
          habitacionesPorDia[fecha].dobles += 1;
        } else if (tipo === 'matrimonial') {
          habitacionesPorDia[fecha].matrimoniales += 1;
        }
      });
    });
  });
  // Copiar a ocupacion para mantener el resto del código igual
  const ocupacion = habitacionesPorDia;
  // Mostrar tabla por día
  const fechas = Object.keys(ocupacion).sort();
  if (fechas.length === 0) return <p>No hay habitaciones ocupadas registradas.</p>;
  // Calcular totales
  let totalDobles = 0, totalMatrimoniales = 0, totalHabitaciones = 0;
  const filas = fechas.map(fecha => {
    const dobles = ocupacion[fecha].dobles;
    const matrimoniales = ocupacion[fecha].matrimoniales;
    const total = dobles + matrimoniales;
    totalDobles += dobles;
    totalMatrimoniales += matrimoniales;
    totalHabitaciones += total;
    return { fecha, dobles, matrimoniales, total };
  });
  return (
    <table className="tabla-habitaciones" style={{width: '100%', borderCollapse: 'collapse', marginTop: 12}}>
      <thead>
        <tr>
          <th style={{borderBottom: '1px solid #90caf9'}}>Fecha</th>
          <th style={{borderBottom: '1px solid #90caf9'}}>Dobles</th>
          <th style={{borderBottom: '1px solid #90caf9'}}>Matrimoniales</th>
          <th style={{borderBottom: '1px solid #90caf9'}}>Total habitaciones</th>
        </tr>
      </thead>
      <tbody>
        {filas.map(({ fecha, dobles, matrimoniales, total }) => (
          <tr key={fecha}>
            <td style={{padding: 4}}>{fecha.split('-').reverse().join('/')}</td>
            <td style={{padding: 4, textAlign: 'center'}}>{dobles}</td>
            <td style={{padding: 4, textAlign: 'center'}}>{matrimoniales}</td>
            <td style={{padding: 4, textAlign: 'center', fontWeight: 600}}>{total}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{background:'#bbdefb', fontWeight:'bold'}}>
          <td style={{padding: 4}}>Totales</td>
          <td style={{padding: 4, textAlign: 'center'}}>{totalDobles}</td>
          <td style={{padding: 4, textAlign: 'center'}}>{totalMatrimoniales}</td>
          <td style={{padding: 4, textAlign: 'center', fontWeight: 600}}>{totalHabitaciones}</td>
        </tr>
      </tfoot>
    </table>
  );
}

function DashboardInicio({ usuario, loading, estadisticas, handleViewChange, onNavigateToEventos, usuariosSinFormulario, formularios }) {
  // Exportar detalle a Excel
  function exportarDetalleHabitacionesExcel() {
    const filas = [];
    Object.entries(detallePorFormulario).forEach(([tipoForm, grupos]) => {
      grupos.forEach(g => {
        filas.push({
          'Tipo de formulario': tipoForm,
          'Empresa': g.empresa || '',
          'Personas': g.personas,
          'Tipo de habitación': g.tipo,
          'Fecha llegada': g.fechaLlegada || '',
          'Hora llegada': g.horaLlegada || '',
          'Fecha salida': g.fechaSalida || '',
          'Hora salida': g.horaSalida || '',
          'Noches': g.noches
        });
      });
    });
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(filas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Detalle Habitaciones');
      XLSX.writeFile(wb, 'detalle_habitaciones.xlsx');
    });
  }

  // Exportar detalle a HTML
  function exportarDetalleHabitacionesHTML() {
    let html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Detalle Habitaciones</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 2em; }
      table { border-collapse: collapse; width: 100%; background: #fff; font-size: 0.92em; }
      th, td { border: 1px solid #90caf9; padding: 6px; text-align: left; }
      thead tr { background: #e3f2fd; }
      tfoot tr { background: #bbdefb; font-weight: bold; }
      .alt-row { background: #e3f2fd; }
    </style>
    </head><body>
    <h2>Detalle de habitaciones por grupo</h2>
    <table>
      <thead>
        <tr>
          <th>Tipo de formulario</th>
          <th>Empresa</th>
          <th>Personas</th>
          <th>Tipo de habitación</th>
          <th>Fecha llegada</th>
          <th>Hora llegada</th>
          <th>Fecha salida</th>
          <th>Hora salida</th>
          <th>Noches</th>
        </tr>
      </thead>
      <tbody>
    `;
    let lastEmpresa = null;
    let colorToggle = false;
    detalleFilas.forEach((g, idx) => {
      if (g.empresa !== lastEmpresa) {
        colorToggle = !colorToggle;
        lastEmpresa = g.empresa;
      }
      html += `<tr class='${colorToggle ? "alt-row" : ""}'>` +
        `<td>${g.tipoFormulario}</td>` +
        `<td>${g.empresa || ''}</td>` +
        `<td>${g.personas}</td>` +
        `<td>${g.tipo}</td>` +
        `<td>${g.fechaLlegada || ''}</td>` +
        `<td>${g.horaLlegada || ''}</td>` +
        `<td>${g.fechaSalida || ''}</td>` +
        `<td>${g.horaSalida || ''}</td>` +
        `<td>${g.noches}</td>` +
        `</tr>`;
    });
    // Totales
    html += `</tbody><tfoot>`;
    html += `<tr><td>Totales</td>` +
      `<td>Empresas: ${Array.from(new Set(detalleFilas.map(f => f.empresa && f.empresa.trim()).filter(e => e))).length}</td>` +
      `<td></td>` +
      `<td>Dobles: ${detalleFilas.filter(f => f.tipo === 'doble').length} | Matrimoniales: ${detalleFilas.filter(f => f.tipo === 'matrimonial').length}</td>` +
      `<td colspan='5'>Total habitaciones: ${detalleFilas.length}</td></tr>`;
    html += `<tr style='background:#e3f2fd;'><td>Por tipo de formulario</td>` +
      `<td colspan='4'>` +
      Object.entries(detallePorFormulario).map(([tipo, grupos], i) => (
        `<span style='margin-right:16px;'>${tipo}: <b>${grupos.length}</b></span>`
      )).join(' ') +
      `</td></tr>`;
    html += `</tfoot></table></body></html>`;
    // Descargar archivo
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'detalle_habitaciones.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  // Función para capitalizar la primera letra y poner el resto en minúsculas
  function capitalizar(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/(^|\s|\.|-|_)([a-záéíóúüñ])/g, (m, sep, c) => sep + c.toUpperCase());
  }

  // Agrupar habitaciones por tipo de formulario y preparar lista ordenada para la tabla
  const detallePorFormulario = {};
  let detalleFilas = [];
  formularios.forEach(f => {
    if (!f.personas || !Array.isArray(f.personas)) return;
    const gruposForm = {};
    f.personas.forEach(p => {
      if (p.tipoHabitacion === 'doble' || p.tipoHabitacion === 'matrimonial') {
        let key;
        if (p.comparteHabitacion && p.comparteCon) {
          const ids = [String(p.id), String(p.comparteCon)].sort();
          key = ids.join('_');
        } else {
          key = String(p.id);
        }
        if (!gruposForm[key]) gruposForm[key] = [];
        gruposForm[key].push(p);
      }
    });
    // Calcular noches y tipo por grupo en este formulario
    const gruposDetalle = [];
    Object.entries(gruposForm).forEach(([key, grupo]) => {
      const tipos = grupo.map(p => p.tipoHabitacion).filter(t => t);
      let tipo = tipos.length > 0 ? tipos[0] : '';
      if (tipos.length > 1 && !tipos.every(t => t === tipo)) tipo = 'varios';

      // Obtener mínima fecha de llegada y máxima fecha de salida entre todos los que comparten
      let minLlegada = null, maxSalida = null;
      let horaLlegada = '', horaSalida = '';
      grupo.forEach(p => {
        if (p.fechaLlegada) {
          const llegada = new Date(p.fechaLlegada);
          if (!minLlegada || llegada < minLlegada) {
            minLlegada = llegada;
            horaLlegada = p.horaLlegada || '';
          }
        }
        if (p.fechaSalida) {
          const salida = new Date(p.fechaSalida);
          if (!maxSalida || salida > maxSalida) {
            maxSalida = salida;
            horaSalida = p.horaSalida || '';
          }
        }
      });
      // Formatear fechas para mostrar en la tabla
      const fechaLlegada = minLlegada ? minLlegada.toISOString().slice(0, 10) : '';
      const fechaSalida = maxSalida ? maxSalida.toISOString().slice(0, 10) : '';

      let noches = 0;
      if (minLlegada && maxSalida) {
        noches = Math.max(1, Math.round((maxSalida - minLlegada) / (1000 * 60 * 60 * 24)));
      } else {
        grupo.forEach(p => {
          if (typeof p.noches === 'number') noches += p.noches;
        });
      }
      // Buscar empresa del grupo (puede estar en p.empresa, f.empresa o f.datosEmpresa.empresa)
      let empresa = '';
      if (grupo.length > 0 && grupo[0].empresa) {
        empresa = grupo[0].empresa;
      } else if (f.empresa) {
        empresa = f.empresa;
      } else if (f.datosEmpresa && f.datosEmpresa.empresa) {
        empresa = f.datosEmpresa.empresa;
      }
      const fila = {
        tipoFormulario: f.tipo,
        empresa: capitalizar(empresa),
        personas: grupo.map(p => capitalizar(`${p.nombre} ${p.apellido}`)).join(' y '),
        tipo,
        noches,
        fechaLlegada,
        horaLlegada,
        fechaSalida,
        horaSalida
      };
      gruposDetalle.push(fila);
      detalleFilas.push(fila);
    });
    detallePorFormulario[f.tipo] = detallePorFormulario[f.tipo] || [];
    detallePorFormulario[f.tipo].push(...gruposDetalle);
  });
  // Ordenar por empresa y tipo de habitación
  detalleFilas.sort((a, b) => {
    if (a.empresa < b.empresa) return -1;
    if (a.empresa > b.empresa) return 1;
    if (a.tipo < b.tipo) return -1;
    if (a.tipo > b.tipo) return 1;
    return 0;
  });

  const [showHabitacionesDetalle, setShowHabitacionesDetalle] = useState(false);
  const [showUsuariosSinFormDetalle, setShowUsuariosSinFormDetalle] = useState(false);

  // Calcular noches y habitaciones tomadas sin doble conteo, igual que en FormularioSocio.jsx
  let totalHabitaciones = 0;
  let totalNoches = 0;
  // Agrupar personas por habitación (pareja o individual)
  const grupos = {};
  formularios.forEach(f => {
    if (!f.personas || !Array.isArray(f.personas)) return;
    f.personas.forEach(p => {
      if (p.tipoHabitacion === 'doble' || p.tipoHabitacion === 'matrimonial') {
        let key;
        if (p.comparteHabitacion && p.comparteCon) {
          // Clave única para la pareja
          const ids = [String(p.id), String(p.comparteCon)].sort();
          key = ids.join('_');
        } else {
          key = String(p.id);
        }
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(p);
      }
    });
  });
  // Calcular noches y tipo por grupo
  const habitaciones = new Map(); // key -> { noches, tipo }
  Object.entries(grupos).forEach(([key, grupo]) => {
    // Tipo de habitación: si todos igual, ese tipo; si no, "varios"
    const tipos = grupo.map(p => p.tipoHabitacion).filter(t => t);
    let tipo = tipos.length > 0 ? tipos[0] : '';
    if (tipos.length > 1 && !tipos.every(t => t === tipo)) tipo = 'varios';
    // Calcular noches: desde la mínima llegada hasta la máxima salida
    let minLlegada = null, maxSalida = null;
    grupo.forEach(p => {
      if (p.fechaLlegada) {
        const llegada = new Date(p.fechaLlegada);
        if (!minLlegada || llegada < minLlegada) minLlegada = llegada;
      }
      if (p.fechaSalida) {
        const salida = new Date(p.fechaSalida);
        if (!maxSalida || salida > maxSalida) maxSalida = salida;
      }
    });
    let noches = 0;
    if (minLlegada && maxSalida) {
      noches = Math.max(1, Math.round((maxSalida - minLlegada) / (1000 * 60 * 60 * 24)));
    } else {
      grupo.forEach(p => {
        if (typeof p.noches === 'number') noches += p.noches;
      });
    }
    habitaciones.set(key, { noches, tipo });
  });
  totalHabitaciones = detalleFilas.length;
  totalNoches = 0;
  const nochesPorTipo = { doble: 0, matrimonial: 0 };
  const habitacionesPorTipo = {
    doble: detalleFilas.filter(f => f.tipo === 'doble').length,
    matrimonial: detalleFilas.filter(f => f.tipo === 'matrimonial').length
  };
  habitaciones.forEach(({ noches, tipo }) => {
    totalNoches += noches;
    if (tipo === 'doble') {
      nochesPorTipo.doble += noches;
    }
    if (tipo === 'matrimonial') {
      nochesPorTipo.matrimonial += noches;
    }
  });

  return (
    <div className="dashboard-inicio" style={{padding:'1rem'}}>
      <style>{`
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .stat-card {
            min-width: 0 !important;
            width: 100% !important;
            margin: 0 0 1rem 0 !important;
          }
        }
        @media (max-width: 600px) {
          .dashboard-inicio {
            padding: 0.5rem !important;
          }
          .welcome-header h1 {
            font-size: 1.2rem !important;
          }
          .stat-card {
            font-size: 0.95em !important;
            padding: 0.7rem 0.5rem !important;
          }
        }
      `}</style>
      <div className="welcome-section">
        <div className="welcome-header">
          <h1 style={{fontSize:'2rem', marginBottom:8}}>¡Bienvenido al Panel de Administración!</h1>
          <p style={{fontSize:'1rem'}}>Gestiona eventos, usuarios y formularios de Red Acero</p>
        </div>
        <div className="user-info-card" style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div className="user-avatar" style={{fontSize:'2.2rem'}}>👤</div>
          <div className="user-details">
            <h3 style={{margin:0, fontSize:'1.1rem'}}>{usuario.email}</h3>
            <span className="user-role" style={{fontSize:'0.95em'}}>{usuario.perfil}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.5rem', marginTop:'1.5rem'}}>
          {/* Usuarios */}
          <div className="stat-card usuarios">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Usuarios</h3>
              <span className="stat-number">{estadisticas.totalUsuarios}</span>
              <p>Usuarios registrados</p>
            </div>
            <button 
              onClick={() => handleViewChange('usuarios')}
              className="stat-action"
            >
              Gestionar →
            </button>
          </div>
          {/* Eventos */}
          <div className="stat-card eventos">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Eventos</h3>
              <span className="stat-number">{estadisticas.totalEventos}</span>
              <p>Eventos creados</p>
            </div>
            <button 
              onClick={() => handleViewChange('eventos')}
              className="stat-action"
            >
              Gestionar →
            </button>
          </div>
          {/* Formularios cargados */}
          <div className="stat-card formularios">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Formularios cargados</h3>
              <span className="stat-number">{estadisticas.totalFormularios}</span>
              <p>Formularios cargados</p>
            </div>
            <button 
              onClick={() => handleViewChange('formulariosGuardados')}
              className="stat-action"
            >
              Ver →
            </button>
          </div>
          {/* Card de personas registradas */}
          <div className="stat-card personas-registradas" style={{background:'#f8fafc', border:'1px solid #90caf9', position: 'relative', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem'}}>
            {/* ...contenido igual... */}
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>👥</div>
              <div>
                <h3 style={{margin: 0}}>Personas registradas</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>{(() => {
                  let total = 0;
                  formularios.forEach(f => {
                    if (Array.isArray(f.personas)) total += f.personas.length;
                  });
                  return total;
                })()}</span>
              </div>
            </div>
            {/* ...resto igual... */}
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 32, marginTop: 0, width: '100%'}}>
              {/* ...columnas de tipos... */}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70}}>
                <span style={{fontSize: '1.1rem'}}>🧑‍💼</span>
                <span style={{fontSize: '0.98rem', color: '#1976d2', fontWeight: 500, marginTop: 2}}>Socios</span>
                <span style={{fontSize: '1.15rem', fontWeight: 600, marginTop: 2}}>{(() => {
                  let socios = 0;
                  formularios.forEach(f => {
                    if (f.tipo === 'socio' && Array.isArray(f.personas)) socios += f.personas.length;
                  });
                  return socios;
                })()}</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70}}>
                <span style={{fontSize: '1.1rem'}}>🏨</span>
                <span style={{fontSize: '0.98rem', color: '#1976d2', fontWeight: 500, marginTop: 2}}>Prov. c/hotel</span>
                <span style={{fontSize: '1.15rem', fontWeight: 600, marginTop: 2}}>{(() => {
                  let provCon = 0;
                  formularios.forEach(f => {
                    if (f.tipo === 'proveedor-con-hotel' && Array.isArray(f.personas)) provCon += f.personas.length;
                  });
                  return provCon;
                })()}</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70}}>
                <span style={{fontSize: '1.1rem'}}>🚗</span>
                <span style={{fontSize: '0.98rem', color: '#1976d2', fontWeight: 500, marginTop: 2}}>Prov. s/hotel</span>
                <span style={{fontSize: '1.15rem', fontWeight: 600, marginTop: 2}}>{(() => {
                  let provSin = 0;
                  formularios.forEach(f => {
                    if (f.tipo === 'proveedor-sin-hotel' && Array.isArray(f.personas)) provSin += f.personas.length;
                  });
                  return provSin;
                })()}</span>
              </div>
            </div>
            <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:16}}>
              <button 
                onClick={() => {
                  if (window.__setAsisteCenaSi) {
                    window.__setAsisteCenaSi = true;
                  }
                  handleViewChange('listadoAcreditacion');
                }}
                className="stat-action"
              >
                Ver detalle →
              </button>
            </div>
          </div>
          {/* Card de personas que asisten a la cena */}
          <div className="stat-card cena" style={{background:'#e3f2fd', border:'1px solid #90caf9', position: 'relative', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>🍽️</div>
              <div>
                <h3 style={{margin: 0}}>Personas que asisten a la cena</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>
                  {(() => {
                    let totalCena = 0;
                    formularios.forEach(f => {
                      if (Array.isArray(f.personas)) {
                        totalCena += f.personas.filter(p => String(p.asisteCena).toLowerCase() === 'si').length;
                      }
                    });
                    return totalCena;
                  })()}
                </span>
                {/* Totales por tipo de formulario en columnas verticales y más chico */}
                <div style={{marginTop: 8, display: 'flex', flexDirection: 'row', gap: 18, fontSize: '0.98em', justifyContent: 'center'}}>
                  {(() => {
                    const tipos = [
                      { key: 'socio', label: 'Socios', icon: '🧑‍💼' },
                      { key: 'proveedor-con-hotel', label: 'Prov. c/hotel', icon: '🏨' },
                      { key: 'proveedor-sin-hotel', label: 'Prov. s/hotel', icon: '🚗' }
                    ];
                    const totalesPorTipo = {};
                    tipos.forEach(t => { totalesPorTipo[t.key] = 0; });
                    formularios.forEach(f => {
                      if (Array.isArray(f.personas) && tipos.some(t => t.key === f.tipo)) {
                        const tipo = f.tipo;
                        totalesPorTipo[tipo] += f.personas.filter(p => String(p.asisteCena).toLowerCase() === 'si').length;
                      }
                    });
                    return tipos.map(t => (
                      <div key={t.key} style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:60}}>
                        <span style={{fontSize:'1.3em'}}>{t.icon}</span>
                        <span style={{fontSize:'0.92em', color:'#1976d2', fontWeight:500, marginTop:2}}>{t.label}</span>
                        <span style={{fontWeight:600, fontSize:'1.08em', marginTop:2}}>{totalesPorTipo[t.key]}</span>
                      </div>
                    ));
                  })()}
                </div>
                <div style={{fontSize: '0.98em', color: '#388e3c', marginTop: 2}}>
                  <b>Nota:</b> <span style={{fontSize: '0.78em'}}>Se cuentan todas las personas que indicaron "Sí" en asiste a la cena.</span>
                </div>
                <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:16}}>
                  <button 
                    onClick={() => {
                      window.__setAsisteCenaSi = true;
                      handleViewChange('listadoAcreditacion');
                    }}
                    className="stat-action"
                  >
                    Ver detalle →
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Card de personas que atienden agenda */}
          <div className="stat-card agenda" style={{background:'#e3f2fd', border:'1px solid #90caf9', position: 'relative', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>🗓️</div>
              <div>
                <h3 style={{margin: 0}}>Personas que atienden agenda</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>
                  {(() => {
                    let totalAgenda = 0;
                    formularios.forEach(f => {
                      if (Array.isArray(f.personas)) {
                        totalAgenda += f.personas.filter(p => String(p.atiendeReuniones).toLowerCase() === 'si').length;
                      }
                    });
                    return totalAgenda;
                  })()}
                </span>
                {/* Totales por tipo de formulario en columnas verticales y más chico */}
                <div style={{marginTop: 8, display: 'flex', gap: 18, fontSize: '0.98em', justifyContent: 'center'}}>
                  {(() => {
                    const tipos = [
                      { key: 'socio', label: 'Socios', icon: '🧑‍💼' },
                      { key: 'proveedor-con-hotel', label: 'Prov. c/hotel', icon: '🏨' },
                      { key: 'proveedor-sin-hotel', label: 'Prov. s/hotel', icon: '🚗' }
                    ];
                    const totalesPorTipo = {};
                    tipos.forEach(t => { totalesPorTipo[t.key] = 0; });
                    formularios.forEach(f => {
                      if (Array.isArray(f.personas) && tipos.some(t => t.key === f.tipo)) {
                        const tipo = f.tipo;
                        totalesPorTipo[tipo] += f.personas.filter(p => String(p.atiendeReuniones).toLowerCase() === 'si').length;
                      }
                    });
                    return tipos.map(t => (
                      <div key={t.key} style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:60}}>
                        <span style={{fontSize:'1.3em'}}>{t.icon}</span>
                        <span style={{fontSize:'0.92em', color:'#1976d2', fontWeight:500, marginTop:2}}>{t.label}</span>
                        <span style={{fontWeight:600, fontSize:'1.08em', marginTop:2}}>{totalesPorTipo[t.key]}</span>
                      </div>
                    ));
                  })()}
                </div>
                <div style={{fontSize: '0.98em', color: '#388e3c', marginTop: 2}}>
                  <b>Nota:</b> <span style={{fontSize: '0.78em'}}>Se cuentan todas las personas que indicaron "Sí" en atiende agenda.</span>
                </div>
                <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:16}}>
                  <button 
                    onClick={() => {
                      window.__setAtiendeReunionesSi = true;
                      handleViewChange('listadoAcreditacion');
                    }}
                    className="stat-action"
                  >
                    Ver detalle →
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Destacados */}
          <div className="stat-card destacados">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Destacados</h3>
              <span className="stat-number">{estadisticas.eventosDestacados}</span>
              <p>Eventos destacados</p>
            </div>
            <button 
              onClick={onNavigateToEventos}
              className="stat-action"
            >
              Ver sitio →
            </button>
          </div>
          {/* Card de habitaciones tomadas */}
          <div className="stat-card habitaciones" style={{background:'#e3f2fd', border:'1px solid #90caf9', position: 'relative', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div className="stat-icon" style={{fontSize: '2.2rem'}}>🏨</div>
              <div>
                <h3 style={{margin: 0}}>Habitaciones tomadas</h3>
                <span className="stat-number" style={{fontSize: '2rem'}}>{totalHabitaciones}</span>
                <div style={{fontSize: '0.98em', color: '#1976d2', marginTop: 2, display:'flex', gap:32}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <span style={{fontSize:'1.1em'}}>Dobles</span>
                    <span style={{fontWeight:600}}>{habitacionesPorTipo.doble}</span>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <span style={{fontSize:'1.1em'}}>Matrimoniales</span>
                    <span style={{fontWeight:600}}>{habitacionesPorTipo.matrimonial}</span>
                  </div>
                </div>
                <div style={{fontSize: '0.98em', color: '#1976d2', marginTop: 2}}>
                  <b>Nota:</b> <span style={{fontSize: '0.78em'}}>Si una habitación doble es compartida por varias noches, se cuenta solo una vez en el total.</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowHabitacionesDetalle(v => !v)}
              className="stat-action"
              style={{marginTop: 16}}
            >
              {showHabitacionesDetalle ? 'Ocultar detalle' : 'Ver detalle →'}
            </button>
          </div>
          {/* Usuarios sin formulario */}
          <div className="stat-card sin-formulario" style={{background:'#fff3cd', border:'1px solid #ffeeba'}}>
            <div className="stat-icon">❗</div>
            <div className="stat-content">
              <h3>Usuarios sin formulario</h3>
              <span className="stat-number">{usuariosSinFormulario.length}</span>
              <p>No han completado el formulario</p>
            </div>
            <button 
              onClick={() => handleViewChange('referentes', { filtroFormularioCargado: 'no' })}
              className="stat-action"
            >
              Ver listado →
            </button>
          </div>
        </div>
      )}

      {/* Detalle habitaciones tomadas solo al hacer click en la card */}
      {showHabitacionesDetalle && (
        <div className="habitaciones-resumen" style={{margin: '2rem 0', padding: '1rem', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 8}}>
          <h4>Habitaciones ocupadas por día</h4>
          <ResumenHabitaciones formularios={formularios} />
          <hr />
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem'}}>
            <h4 style={{marginBottom:0}}>Detalle de habitaciones por grupo</h4>
            <div style={{display:'flex', gap:12}}>
              <button 
                onClick={exportarDetalleHabitacionesExcel} 
                style={{padding:'0.4em 1em', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>
                Exportar a Excel
              </button>
              <button 
                onClick={exportarDetalleHabitacionesHTML} 
                style={{padding:'0.4em 1em', background:'#388e3c', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}
                title="Al exportar a HTML y luego abrirlo con Excel, mantiene el formato visto en pantalla."
              >
                Exportar a HTML
              </button>
            </div>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'0.82em'}}>
              <thead>
                <tr style={{background:'#e3f2fd'}}>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Tipo de formulario</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Empresa</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Personas</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'60px'}}>Tipo de habitación</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'80px'}}>Fecha llegada</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Hora llegada</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'100px', maxWidth:'140px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Fecha salida</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Hora salida</th>
                  <th style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Noches</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                    // Paleta pastel
                    const pastelColors = [
                      '#ffe0e0', '#e0ffe0', '#e0e0ff', '#fffbe0', '#e0fff7', '#f0e0ff', '#e0f7ff', '#ffe0f7', '#f7ffe0', '#e0f0ff', '#f0ffe0', '#ffe0f0'
                    ];
                    // Asignar color por empresa
                    const empresasUnicas = Array.from(new Set(detalleFilas.map(f => (f.empresa || '').trim())));
                    const empresaColorMap = {};
                    empresasUnicas.forEach((emp, i) => {
                      empresaColorMap[emp] = pastelColors[i % pastelColors.length];
                    });
                    return detalleFilas.map((g, idx) => {
                      const colorFondo = empresaColorMap[(g.empresa || '').trim()] || '#fff';
                      return (
                        <tr key={idx} style={{background: colorFondo}}>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.tipoFormulario}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.empresa || ''}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.personas}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'60px'}}>{g.tipo}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'80px'}}>{g.fechaLlegada || ''}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.horaLlegada || ''}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'100px', maxWidth:'140px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{g.fechaSalida || ''}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.horaSalida || ''}</td>
                          <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.noches}</td>
                        </tr>
                      );
                    });
                  })()}
              </tbody>
              <tfoot>
                <tr style={{background:'#bbdefb', fontWeight:'bold'}}>
                  <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Totales</td>
                  <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                    Empresas: {Array.from(new Set(detalleFilas.map(f => f.empresa && f.empresa.trim()).filter(e => e))).length}
                  </td>
                  <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}></td>
                  <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                    Dobles: {detalleFilas.filter(f => f.tipo === 'doble').length} | Matrimoniales: {detalleFilas.filter(f => f.tipo === 'matrimonial').length}
                  </td>
                  <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                    Total habitaciones: {detalleFilas.length}
                  </td>
                </tr>
                <tr style={{background:'#e3f2fd', fontWeight:'bold'}}>
                  <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Por tipo de formulario</td>
                  <td colSpan={4} style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                    <div>
                      {Object.entries(detallePorFormulario).map(([tipo, grupos], i) => (
                        <span key={tipo} style={{marginRight:16}}>
                          {tipo}: <b>{grupos.length}</b>
                        </span>
                      ))}
                    </div>
                    <div style={{textAlign:'center', marginTop:'10px'}}>
                      <button 
                        onClick={() => handleViewChange('listadoAcreditacion')}
                        className="stat-action"
                        style={{marginTop: 8}}
                      >
                        Ver detalle →
                      </button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Detalle usuarios sin formulario solo al hacer click en la card */}
      {showUsuariosSinFormDetalle && (
        <div className="usuarios-sin-formulario" style={{margin: '2rem 0', padding: '1rem', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8}}>
          <h4>Usuarios que no completaron el formulario</h4>
          {usuariosSinFormulario.length === 0 ? (
            <p>Todos los usuarios han completado el formulario.</p>
          ) : (
            <table style={{borderCollapse:'collapse', width:'100%', fontSize:'0.9em', background:'#fff'}}>
              <thead>
                <tr style={{background:'#ffeeba'}}>
                  <th style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>Rol</th>
                  <th style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>Email</th>
                  <th style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>Empresa</th>
                </tr>
              </thead>
              <tbody>
                {usuariosSinFormulario.map(u => (
                  <tr key={u.id || u.email}>
                    <td style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>{u.rol || ''}</td>
                    <td style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>{u.email}</td>
                    <td style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>{u.empresa || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <button 
            onClick={() => handleViewChange('eventos')}
            className="quick-action-btn primary"
          >
            <span className="action-icon">➕</span>
            <span>Crear Evento</span>
          </button>
          <button 
            onClick={() => handleViewChange('usuarios')}
            className="quick-action-btn secondary"
          >
            <span className="action-icon">👤</span>
            <span>Nuevo Usuario</span>
          </button>
          <button 
            onClick={() => handleViewChange('formularios')}
            className="quick-action-btn tertiary"
          >
            <span className="action-icon">📊</span>
            <span>Ver Formularios</span>
          </button>
          <button 
            onClick={() => handleViewChange('roomingList')}
            className="quick-action-btn quinary"
          >
            <span className="action-icon">🏨</span>
            <span>Rooming List</span>
          </button>
          <button 
            onClick={() => handleViewChange('personalizacion')}
            className="quick-action-btn quaternary"
          >
            <span className="action-icon">🎨</span>
            <span>Personalizar</span>
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Actividad Reciente</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📅</div>
            <div className="activity-content">
              <p><strong>Sistema iniciado</strong></p>
              <small>Panel de administración cargado exitosamente</small>
            </div>
            <div className="activity-time">Ahora</div>
          </div>
        </div>
      </div>

      {!loading && (
      <div className="usuarios-sin-formulario" style={{margin: '2rem 0', padding: '1rem', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8}}>
          <h4>Usuarios que no completaron el formulario</h4>
          {usuariosSinFormulario.length === 0 ? (
            <p>Todos los usuarios han completado el formulario.</p>
          ) : (
            <table style={{borderCollapse:'collapse', width:'100%', fontSize:'0.9em', background:'#fff'}}>
              <thead>
                <tr style={{background:'#ffeeba'}}>
                  <th style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>Rol</th>
                  <th style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>Email</th>
                  <th style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>Empresa</th>
                </tr>
              </thead>
              <tbody>
                {usuariosSinFormulario.map(u => (
                  <tr key={u.id || u.email}>
                    <td style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>{u.rol || ''}</td>
                    <td style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>{u.email}</td>
                    <td style={{border:'1px solid #ffeeba', padding:'6px', textAlign:'left'}}>{u.empresa || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}

function Dashboard({ usuario, onLogout, onNavigateToEventos, onNavigateToDashboard, onNavigateToInicio, eventoId }) {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalEventos: 0,
    totalFormularios: 0,
    eventosDestacados: 0
  });
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [usuariosSinFormulario, setUsuariosSinFormulario] = useState([]);


  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      // Cargar datos reales desde FirebaseService
      const [usuariosData, eventosData, formulariosData] = await Promise.all([
        FirebaseService.obtenerUsuarios ? FirebaseService.obtenerUsuarios() : [],
        FirebaseService.obtenerEventos ? FirebaseService.obtenerEventos() : [],
        FirebaseService.obtenerFormularios ? FirebaseService.obtenerFormularios(eventoId) : []
      ]);
      setUsuarios(usuariosData);
      setFormularios(formulariosData);
      setEstadisticas({
        totalUsuarios: usuariosData.length,
        totalEventos: eventosData.length,
        totalFormularios: formulariosData.length,
        eventosDestacados: eventosData.filter(e => e.destacado).length
      });
      // Usuarios sin formulario (no admin)
      const sinFormulario = usuariosData.filter(u =>
        u.rol !== 'admin' &&
        !formulariosData.some(f => f.usuarioCreador === u.email && f.eventoId === eventoId)
      );
      setUsuariosSinFormulario(sinFormulario);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const [filtroReferentes, setFiltroReferentes] = useState('');
  const handleViewChange = (vista, options = {}) => {
    setVistaActual(vista);
    if (vista === 'inicio') {
      cargarEstadisticas();
    }
    if (vista === 'referentes' && options.filtroFormularioCargado) {
      setFiltroReferentes(options.filtroFormularioCargado);
    }
  };

  const renderVistaActual = () => {
    switch (vistaActual) {
      case 'usuarios':
        return <UserManagement />;
      case 'eventos':
        return <EventManagement />;
      case 'formularios':
        return <FormularioManagement user={usuario} />;
      case 'formulariosGuardados':
        return <FormulariosGuardados userPerfil={usuario?.perfil} userEmail={usuario?.email} />;
      case 'personalizacion':
        return <PersonalizacionFormularios user={usuario} />;
      case 'newsletter':
        return <Newsletter />;
      case 'roomingList':
        return <RoomingList formularios={formularios} />;
      case 'referentes':  
        return <ListadoReferentes readOnly={true} eventId={eventoId} filtroFormularioCargado={filtroReferentes} />;
      case 'listadoAcreditacion':  
        return <ListadoAcreditacion eventId={eventoId} />;
      case 'inicio':
      default:
        return (
          <DashboardInicio
            usuario={usuario}
            loading={loading}
            estadisticas={estadisticas}
            handleViewChange={handleViewChange}
            onNavigateToEventos={onNavigateToEventos}
            usuariosSinFormulario={usuariosSinFormulario}
            formularios={formularios}
          />
        );
    }
  };

  return (
    <div className="dashboard">
      <AdminNavBar 
        currentView={vistaActual}
        onViewChange={handleViewChange}
        user={usuario}
        onLogout={onLogout}
      />
      <main className="dashboard-content">
        {renderVistaActual()}
      </main>
    </div>
  );
}

export default Dashboard;

