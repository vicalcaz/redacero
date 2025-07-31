import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ListadoReferentesModal.css'; // Puedes renombrar el CSS si quieres

function ListadoReferentes() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    empresa: '',
    tipo: '',
    nombre: '',
    apellido: '',
    formularioCargado: '',
    passwordCambiado: '',
  });

  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'usuarios'))
      .then(snapshot => {
        setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const usuariosFiltrados = usuarios.filter(u => {
    return (
      (filtros.empresa === '' || u.empresa?.toLowerCase().includes(filtros.empresa.toLowerCase())) &&
      (filtros.tipo === '' || u.tipo?.toLowerCase().includes(filtros.tipo.toLowerCase())) &&
      (filtros.nombre === '' || u.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (filtros.apellido === '' || u.apellido?.toLowerCase().includes(filtros.apellido.toLowerCase())) &&
      (filtros.formularioCargado === '' ||
        (filtros.formularioCargado === 'si'
          ? u.formularioCargado
          : !u.formularioCargado)) &&
      (filtros.passwordCambiado === '' ||
        (filtros.passwordCambiado === 'si'
          ? u.passwordCambiado
          : !u.passwordCambiado))
    );
  });

  return (
    <div className="listado-referentes-interno">
      <div className="header">
        <h2>Listado de Control de Usuarios Referentes</h2>
      </div>
      <div className="modal-referentes-filtros">
        <input name="empresa" placeholder="Empresa" value={filtros.empresa} onChange={handleFiltro} />
        <input name="tipo" placeholder="Tipo" value={filtros.tipo} onChange={handleFiltro} />
        <input name="nombre" placeholder="Nombre" value={filtros.nombre} onChange={handleFiltro} />
        <input name="apellido" placeholder="Apellido" value={filtros.apellido} onChange={handleFiltro} />
        <select name="formularioCargado" value={filtros.formularioCargado} onChange={handleFiltro}>
          <option value="">¿Formulario cargado?</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        <select name="passwordCambiado" value={filtros.passwordCambiado} onChange={handleFiltro}>
          <option value="">¿Entró al sistema?</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="modal-referentes-table-wrapper">
        <table className="modal-referentes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Empresa</th>
              <th>Tipo</th>
              <th>Rol</th>
              <th>Formulario cargado</th>
              <th>Entró al sistema</th>
              <th>Usuario Creador</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u, i) => (
              <tr key={i}>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.email}</td>
                <td>{u.empresa}</td>
                <td>{u.tipo}</td>
                <td>{u.rol}</td>
                <td>{u.formularioCargado ? 'Sí' : 'No'}</td>
                <td>{u.passwordCambiado ? 'Sí' : 'No'}</td>
                <td>{u.usuarioCreador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListadoReferentes;