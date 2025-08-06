import React, { useMemo } from 'react';
import './RoomingList.css';
// ...existing code...
// Reutilizamos la lógica de agrupación y detalle de habitaciones
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


function RoomingList({ formularios }) {

  
  // Días del evento (ajustar según fechas reales)
  const diasEvento = useMemo(() => {
    // Puedes ajustar las fechas del evento aquí
    // Ejemplo: 2024-08-25 a 2024-08-27
    const inicio = new Date('2024-08-25');
    const fin = new Date('2024-08-27');
    const dias = [];
    let d = new Date(inicio);
    while (d <= fin) {
      dias.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return dias;
  }, []);

  // Generar filas detalladas para exportación avanzada
  const filasDetalladas = useMemo(() => {
    let filas = [];
    let numero = 1;
    formularios.forEach(f => {
      if (!f.personas || !Array.isArray(f.personas)) return;
      const grupos = {};
      f.personas.forEach(p => {
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
      Object.values(grupos).forEach(grupo => {
        grupo.sort((a, b) => (a.fechaLlegada || '') < (b.fechaLlegada || '') ? -1 : 1);
        const p1 = grupo[0];
        const p2 = grupo[1] || {};
        const fechasLlegada = grupo.map(p => p.fechaLlegada).filter(Boolean);
        const fechasSalida = grupo.map(p => p.fechaSalida).filter(Boolean);
        const horasLlegada = grupo.map(p => p.horaLlegada).filter(Boolean);
        const horasSalida = grupo.map(p => p.horaSalida).filter(Boolean);
        const minFechaLlegada = fechasLlegada.length ? fechasLlegada.reduce((a, b) => a < b ? a : b) : '';
        const maxFechaSalida = fechasSalida.length ? fechasSalida.reduce((a, b) => a > b ? a : b) : '';
        const minHoraLlegada = horasLlegada.length ? horasLlegada.reduce((a, b) => a < b ? a : b) : '';
        const minHoraSalida = horasSalida.length ? horasSalida.reduce((a, b) => a < b ? a : b) : '';
        const tipo = grupo.map(p => p.tipoHabitacion).filter(Boolean)[0] || '';
        let noches = '';
        if (minFechaLlegada && maxFechaSalida) {
          const d1 = new Date(minFechaLlegada);
          const d2 = new Date(maxFechaSalida);
          noches = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
        }
        const comentarioGeneral = f.comentarios || '';
        // Marcar "Sí" solo si la habitación está ocupada esa noche
        const ocupacionDias = diasEvento.map(dia => {
          // Convertir a Date para comparar correctamente
          const diaDate = new Date(dia);
          const llegadaDate = minFechaLlegada ? new Date(minFechaLlegada) : null;
          const salidaDate = maxFechaSalida ? new Date(maxFechaSalida) : null;
          // Si no hay llegada o salida, no marcar
          if (!llegadaDate || !salidaDate) return '';
          // Si la salida es <= 10:00, no se ocupa la última noche
          let ultimaNocheOcupada = true;
          if (minHoraSalida && minHoraSalida <= '10:00') {
            // La última noche NO se ocupa
            ultimaNocheOcupada = false;
          }
          // Si el día está entre llegada y salida (sin incluir la última noche si no se ocupa)
          if (
            diaDate >= llegadaDate &&
            (
              (diaDate < salidaDate) ||
              (diaDate.getTime() === salidaDate.getTime() && ultimaNocheOcupada)
            )
          ) {
            console.log("entro por aca")
            // Si es el día de salida y la última noche no se ocupa, no marcar
           // if (diaDate.getTime() === salidaDate.getTime() && !ultimaNocheOcupada) return '';
            return 'Sí';
          }
          return 'No';
        });
        filas.push({
          numero: numero++,
          empresa: toTitleCase(p1.empresa || f.empresa || (f.datosEmpresa && f.datosEmpresa.empresa) || ''),
          nombre: toTitleCase(`${p1.apellido || ''} ${p1.nombre || ''}`.trim()),
          dni: p1.dni || '',
          comentarioComp: toSentenceCase(p1.comentario || ''),
          acompanante: toTitleCase(p2 ? `${p2.apellido || ''} ${p2.nombre || ''}`.trim() : ''),
          dniAcompanante: p2.dni || '',
          comentarioPersona: toTitleCase(p2.comentario || ''),
          tercerPersona: '',
          dniTercerPersona: '',
          fechaLlegada: minFechaLlegada,
          horaLlegada: minHoraLlegada,
          fechaSalida: maxFechaSalida,
          horaSalida: minHoraSalida,
          tipoHabitacion: toTitleCase(tipo),
          noches,
          comentarioGeneral: toSentenceCase(comentarioGeneral),
          ocupacionDias
        });
      });
    });
    return filas;
  }, [formularios, diasEvento]);

  // Exportar Rooming List Detallado a HTML
  function exportarRoomingListDetalladoHTML() {
    let html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Rooming List Detallado</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 2em; }
      table { border-collapse: collapse; width: 100%; background: #fff; font-size: 0.92em; }
      th, td { border: 1px solid #90caf9; padding: 6px; text-align: left; }
      thead tr { background: #e3f2fd; }
      .alt-row { background: #e3f2fd; }
    </style>
    </head><body>
    <h2>Rooming List Detallado</h2>
    <table><thead><tr>`;
    const headers = [
      'N°', 'Empresa', 'Apellido y nombre', 'DNI', 'Comentario (nombre persona comparte)',
      'Acompañante', 'DNI acompañante', 'Comentario persona (nombre persona)',
      '3er persona', 'DNI 3er persona', 'Fecha llegada', 'Hora llegada',
      'Fecha salida', 'Hora salida', 'Tipo habitación', ...diasEvento.map(d => d.split('-').reverse().join('/')), 'Noches', 'Comentario general'
    ];
    headers.forEach(h => { html += `<th>${h}</th>`; });
    html += `</tr></thead><tbody>`;
    let colorToggle = false;
    let lastEmpresa = null;
    filasDetalladas.forEach((fila, idx) => {
      if (fila.empresa !== lastEmpresa) {
        colorToggle = !colorToggle;
        lastEmpresa = fila.empresa;
      }
      html += `<tr class='${colorToggle ? "alt-row" : ""}'>`;
      html += `<td>${fila.numero}</td>`;
      html += `<td>${fila.empresa}</td>`;
      html += `<td>${fila.nombre}</td>`;
      html += `<td>${fila.dni}</td>`;
      html += `<td>${fila.comentarioComp}</td>`;
      html += `<td>${fila.acompanante}</td>`;
      html += `<td>${fila.dniAcompanante}</td>`;
      html += `<td>${fila.comentarioPersona}</td>`;
      html += `<td></td>`;
      html += `<td></td>`;
      html += `<td>${fila.fechaLlegada}</td>`;
      html += `<td>${fila.horaLlegada}</td>`;
      html += `<td>${fila.fechaSalida}</td>`;
      html += `<td>${fila.horaSalida}</td>`;
      html += `<td>${fila.tipoHabitacion}</td>`;
      fila.ocupacionDias.forEach(oc => html += `<td style='text-align:center'>${oc ? oc : 'No'}</td>`);
      html += `<td>${fila.noches}</td>`;
      html += `<td>${fila.comentarioGeneral}</td>`;
      html += `</tr>`;
    });
    html += `</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rooming_list_detallado.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar Rooming List Detallado a Excel
  function exportarRoomingListDetalladoExcel() {
    import('xlsx').then(XLSX => {
      const headers = [
        'N°', 'Empresa', 'Apellido y nombre', 'DNI', 'Comentario (nombre persona comparte)',
        'Acompañante', 'DNI acompañante', 'Comentario persona (nombre persona)',
        '3er persona', 'DNI 3er persona', 'Fecha llegada', 'Hora llegada',
        'Fecha salida', 'Hora salida', 'Tipo habitación', ...diasEvento.map(d => d.split('-').reverse().join('/')), 'Noches', 'Comentario general'
      ];
      const data = filasDetalladas.map(fila => [
        fila.numero, fila.empresa, fila.nombre, fila.dni, fila.comentarioComp,
        fila.acompanante, fila.dniAcompanante, fila.comentarioPersona,
        '', '', fila.fechaLlegada, fila.horaLlegada,
        fila.fechaSalida, fila.horaSalida, fila.tipoHabitacion,
        ...fila.ocupacionDias, fila.noches, fila.comentarioGeneral
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rooming List Detallado');
      XLSX.writeFile(wb, 'rooming_list_detallado.xlsx');
    });
  }
  // Función para capitalizar cada palabra
  function toTitleCase(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }
  function toSentenceCase(str) {
  if (!str) return '';
  str = String(str).trim();
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
  // Filtros de búsqueda
  const [filtroTipo, setFiltroTipo] = React.useState('');
  const [filtroEmpresa, setFiltroEmpresa] = React.useState('');
  const [filtroPersona, setFiltroPersona] = React.useState('');
  const [filtroHabitacion, setFiltroHabitacion] = React.useState('');
// Detalle por grupo (primero)
  const detalleFilas = useMemo(() => {
    let filas = [];
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
      Object.values(gruposForm).forEach(grupo => {
        const tipos = grupo.map(p => p.tipoHabitacion).filter(t => t);
        let tipo = tipos.length > 0 ? tipos[0] : '';
        if (tipos.length > 1 && !tipos.every(t => t === tipo)) tipo = 'varios';
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
        let empresa = '';
        if (grupo.length > 0 && grupo[0].empresa) {
          empresa = grupo[0].empresa;
        } else if (f.empresa) {
          empresa = f.empresa;
        } else if (f.datosEmpresa && f.datosEmpresa.empresa) {
          empresa = f.datosEmpresa.empresa;
        }
        filas.push({
          tipoFormulario: f.tipo,
          empresa,
          personas: grupo.map(p => `${p.nombre} ${p.apellido}`).join(' y '),
          tipo,
          noches,
          fechaLlegada,
          horaLlegada,
          fechaSalida,
          horaSalida
        });
      });
    });
    return filas;
  }, [formularios]);

  // Filtrar detalleFilas según los filtros
  const detalleFilasFiltrado = useMemo(() => {
    return detalleFilas.filter(fila => {
      const tipoOk = !filtroTipo || fila.tipoFormulario.toLowerCase().includes(filtroTipo.toLowerCase());
      const empresaOk = !filtroEmpresa || (fila.empresa && fila.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase()));
      const personaOk = !filtroPersona || (fila.personas && fila.personas.toLowerCase().includes(filtroPersona.toLowerCase()));
      const habitacionOk = !filtroHabitacion || fila.tipo.toLowerCase().includes(filtroHabitacion.toLowerCase());
      return tipoOk && empresaOk && personaOk && habitacionOk;
    });
  }, [detalleFilas, filtroTipo, filtroEmpresa, filtroPersona, filtroHabitacion]);

  // Exportar a Excel
  function exportarExcel() {
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(detalleFilasFiltrado);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rooming List');
      XLSX.writeFile(wb, 'rooming_list.xlsx');
    });
  }

  // Exportar a HTML con formato y resumen de habitaciones por día
  function exportarHTML() {
    let html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Rooming List Export</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 2em; }
      table { border-collapse: collapse; width: 100%; background: #fff; font-size: 0.92em; }
      th, td { border: 1px solid #90caf9; padding: 6px; text-align: left; }
      thead tr { background: #e3f2fd; }
      tfoot tr { background: #bbdefb; font-weight: bold; }
      .alt-row { background: #e3f2fd; }
    </style>
    </head><body>
    <h2>Rooming List - Resumen de habitaciones por día</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Dobles</th>
          <th>Matrimoniales</th>
          <th>Total habitaciones</th>
        </tr>
      </thead>
      <tbody>
    `;
    let totalDobles = 0, totalMatrimoniales = 0, totalHabitaciones = 0;
    Object.keys(habitacionesPorDia).sort().forEach(fecha => {
      const dobles = habitacionesPorDia[fecha].dobles;
      const matrimoniales = habitacionesPorDia[fecha].matrimoniales;
      const total = dobles + matrimoniales;
      totalDobles += dobles;
      totalMatrimoniales += matrimoniales;
      totalHabitaciones += total;
      html += `<tr>` +
        `<td>${fecha.split('-').reverse().join('/')}</td>` +
        `<td style='text-align:center'>${dobles}</td>` +
        `<td style='text-align:center'>${matrimoniales}</td>` +
        `<td style='text-align:center;font-weight:600'>${total}</td>` +
        `</tr>`;
    });
    html += `</tbody><tfoot><tr style='background:#bbdefb;font-weight:bold'>` +
      `<td>Totales</td>` +
      `<td style='text-align:center'>${totalDobles}</td>` +
      `<td style='text-align:center'>${totalMatrimoniales}</td>` +
      `<td style='text-align:center;font-weight:600'>${totalHabitaciones}</td>` +
      `</tr></tfoot></table>`;

    html += `<hr /><h2>Rooming List - Detalle de habitaciones por grupo</h2>`;
    html += `<table><thead><tr>` +
      `<th>Tipo de formulario</th><th>Empresa</th><th>Personas</th><th>Tipo de habitación</th><th>Fecha llegada</th><th>Hora llegada</th><th>Fecha salida</th><th>Hora salida</th><th>Noches</th>` +
      `</tr></thead><tbody>`;
    let lastEmpresa = null;
    let colorToggle = false;
    detalleFilasFiltrado.forEach((g, idx) => {
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
    html += `</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rooming_list.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Agrupación por tipo de formulario (después de detalleFilas)
  const detallePorFormulario = useMemo(() => {
    const agrupado = {};
    detalleFilas.forEach(fila => {
      agrupado[fila.tipoFormulario] = agrupado[fila.tipoFormulario] || [];
      agrupado[fila.tipoFormulario].push(fila);
    });
    return agrupado;
  }, [detalleFilas]);
  // Agrupación por habitación
  const habitacionesPorDia = useMemo(() => {
    const habitacionesPorDia = {};
    formularios.forEach(f => {
      if (!f.personas || !Array.isArray(f.personas)) return;
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
      Object.values(grupos).forEach(grupo => {
        const tipos = grupo.map(p => p.tipoHabitacion).filter(t => t);
        let tipo = tipos.length > 0 ? tipos[0] : '';
        if (tipos.length > 1 && !tipos.every(t => t === tipo)) tipo = 'varios';
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
    return habitacionesPorDia;
  }, [formularios]);

  
  // Render
  const fechas = Object.keys(habitacionesPorDia).sort();
  let totalDobles = 0, totalMatrimoniales = 0, totalHabitaciones = 0;
  const filas = fechas.map(fecha => {
    const dobles = habitacionesPorDia[fecha].dobles;
    const matrimoniales = habitacionesPorDia[fecha].matrimoniales;
    const total = dobles + matrimoniales;
    totalDobles += dobles;
    totalMatrimoniales += matrimoniales;
    totalHabitaciones += total;
    return { fecha, dobles, matrimoniales, total };
  });

  // Resumen inferior de totales
  const totalEmpresas = Array.from(new Set(detalleFilasFiltrado.map(f => f.empresa && f.empresa.trim()).filter(e => e))).length;
  const totalDoblesDetalle = detalleFilasFiltrado.filter(f => f.tipo === 'doble').length;
  const totalMatrimonialesDetalle = detalleFilasFiltrado.filter(f => f.tipo === 'matrimonial').length;
  const totalHabitacionesDetalle = detalleFilasFiltrado.length;

  return (
    <div className="rooming-list-view" style={{padding:'2rem'}}>
      <h2>Rooming List - Detalle de habitaciones</h2>
      <div style={{marginBottom:8, display:'flex', flexDirection:'row', alignItems:'center', gap:8, flexWrap:'nowrap', width:'100%', overflowX:'auto'}}>
        {/* Filtros alineados horizontalmente */}
        {(() => {
          const tiposFormulario = Array.from(new Set(detalleFilas.map(f => f.tipoFormulario).filter(Boolean)));
          const tiposHabitacion = Array.from(new Set(detalleFilas.map(f => f.tipo).filter(Boolean)));
          return <>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{padding:'2px 6px', minWidth:100, fontSize:'0.95em', height:28, marginRight:4, display:'inline-block'}}>
              <option value="">Tipo de formulario</option>
              {tiposFormulario.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <input placeholder="Empresa" value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} style={{padding:'2px 6px', minWidth:100, fontSize:'0.95em', height:28, marginRight:4, display:'inline-block'}} />
            <input placeholder="Nombre persona" value={filtroPersona} onChange={e => setFiltroPersona(e.target.value)} style={{padding:'2px 6px', minWidth:100, fontSize:'0.95em', height:28, marginRight:4, display:'inline-block'}} />
            <select value={filtroHabitacion} onChange={e => setFiltroHabitacion(e.target.value)} style={{padding:'2px 6px', minWidth:100, fontSize:'0.95em', height:28, marginRight:4, display:'inline-block'}}>
              <option value="">Tipo de habitación</option>
              {tiposHabitacion.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </>;
        })()}
      </div>
      <div style={{marginBottom:16, display:'flex', flexDirection:'row', justifyContent:'flex-end', alignItems:'center', gap:8, width:'100%'}}>
        <button onClick={exportarHTML} style={{padding:'0.4em 1em', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>Rooming List Excel</button>
        <button onClick={exportarRoomingListDetalladoExcel} style={{padding:'0.4em 1em', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>Rooming List Detallado Excel (HTML)</button>
        <button onClick={exportarRoomingListDetalladoHTML} style={{padding:'0.4em 1em', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>Rooming List Detallado HTML</button>
        <button onClick={typeof window.onReload === 'function' ? window.onReload : undefined} style={{padding:'0.4em 1em', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>Actualizar</button>
      </div>
      <h4>Habitaciones ocupadas por día</h4>
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
      <hr />
      <h4>Detalle de habitaciones por grupo</h4>
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
              let lastEmpresa = null;
              let colorToggle = false;
              return detalleFilasFiltrado.map((g, idx) => {
                if (g.empresa !== lastEmpresa) {
                  colorToggle = !colorToggle;
                  lastEmpresa = g.empresa;
                }
                return (
                  <tr key={idx} style={{background: colorToggle ? '#e3f2fd' : '#fff'}}>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                      <span
                        className={
                          'tipo-badge ' +
                          (g.tipoFormulario && g.tipoFormulario.toLowerCase() === 'socio' ? 'socio' :
                          g.tipoFormulario && g.tipoFormulario.toLowerCase() === 'proveedor con hotel' ? 'proveedor-con-hotel' : '')
                        }
                        style={{display:'inline-block', padding:'2px 10px', borderRadius:'12px', fontWeight:'bold'}}
                      >
                        {toTitleCase(g.tipoFormulario)}
                      </span>
                    </td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{toTitleCase(g.empresa || '')}</td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{toTitleCase(g.personas)}</td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'60px'}}>{g.tipo}</td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'80px'}}>{g.fechaLlegada || ''}</td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.horaLlegada || ''}</td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left', minWidth:'100px', maxWidth:'140px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{g.fechaSalida || ''}</td>
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.horaSalida || ''}</td>
                    {g.ocupacionDias && g.ocupacionDias.map((oc, i) => {
                      console.log('Ocupación día', diasEvento[i], 'fila', g.empresa, 'valor:', oc);
                      return (
                        <td key={i} style={{textAlign:'center'}}>{oc}</td>
                      );
                    })}
                    <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>{g.noches}</td>
                  </tr>
                );
              })
            })()}
          </tbody>
          <tfoot>
            <tr style={{background:'#bbdefb', fontWeight:'bold'}}>
              <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Totales</td>
              <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                Empresas: {totalEmpresas}
              </td>
              <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}></td>
              <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                Dobles: {totalDoblesDetalle} | Matrimoniales: {totalMatrimonialesDetalle}
              </td>
              <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                Total habitaciones: {totalHabitacionesDetalle}
              </td>
            </tr>
            <tr style={{background:'#e3f2fd', fontWeight:'bold'}}>
              <td style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>Por tipo de formulario</td>
              <td colSpan={4} style={{border:'1px solid #90caf9', padding:'6px', textAlign:'left'}}>
                {Object.entries(detallePorFormulario).map(([tipo, grupos], i) => (
                  <span key={tipo} style={{marginRight:16}}>
                    {tipo}: <b>{grupos.length}</b>
                  </span>
                ))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default RoomingList;