  // Resumen por tipo de formulario
  const detallePorFormulario = {};
  detalleFilas.forEach(fila => {
    detallePorFormulario[fila.tipoFormulario] = detallePorFormulario[fila.tipoFormulario] || [];
    detallePorFormulario[fila.tipoFormulario].push(fila);
  });
import React, { useMemo } from 'react';
import './Dashboard.css';

// Reutilizamos la lógica de agrupación y detalle de habitaciones
function getRangoFechas(desde, hasta, horaSalida) {
  const fechas = [];
  let d = new Date(desde + 'T00:00:00Z');
  let h = new Date(hasta + 'T00:00:00Z');
  while (d <= h) {
    fechas.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return fechas;
}

function RoomingList({ formularios }) {
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

  // Detalle por grupo
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
  const totalEmpresas = Array.from(new Set(detalleFilas.map(f => f.empresa && f.empresa.trim()).filter(e => e))).length;
  const totalDoblesDetalle = detalleFilas.filter(f => f.tipo === 'doble').length;
  const totalMatrimonialesDetalle = detalleFilas.filter(f => f.tipo === 'matrimonial').length;
  const totalHabitacionesDetalle = detalleFilas.length;

  return (
    <div className="rooming-list-view" style={{padding:'2rem'}}>
      <h2>Rooming List - Detalle de habitaciones</h2>
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
              return detalleFilas.map((g, idx) => {
                if (g.empresa !== lastEmpresa) {
                  colorToggle = !colorToggle;
                  lastEmpresa = g.empresa;
                }
                return (
                  <tr key={idx} style={{background: colorToggle ? '#e3f2fd' : '#fff'}}>
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
