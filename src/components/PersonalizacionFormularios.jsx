import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FirebaseService } from '../services/FirebaseService';
import './PersonalizacionFormularios.css';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- Soporte para interlineado personalizado (lineheight) ---
const ParchLineHeight = () => {
  const Inline = Quill.import('blots/inline');
  class LineHeightStyle extends Inline {
    static create(value) {
      const node = super.create();
      node.style.lineHeight = value;
      return node;
    }
    static formats(node) {
      return node.style.lineHeight;
    }
  }
  LineHeightStyle.blotName = 'lineheight';
  LineHeightStyle.className = 'ql-lineheight';
  LineHeightStyle.tagName = 'SPAN';
  Quill.register(LineHeightStyle, true);
};
ParchLineHeight();
// -----------------------------------------------------------

// --- Agrega este código antes de tu componente ---
const Link = Quill.import('formats/link');
Link.sanitize = url => {
  // Permite pegar URLs sin protocolo
  if (url && !/^https?:\/\//i.test(url)) {
    return 'http://' + url;
  }
  return url;
};
Quill.register(Link, true);
// -------------------------------------------------

const TIPOS_FORMULARIO = [
  { value: 'socio', label: 'Socio' },
  { value: 'proveedor-con-hotel', label: 'Proveedor con Hotel' },
  { value: 'proveedor-sin-hotel', label: 'Proveedor sin Hotel' }
];

function PersonalizacionFormularios({ user }) {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoFondo, setSubiendoFondo] = useState(false);
  const [pestania, setPestania] = useState('eventos'); // 'eventos', 'formularios' o 'correos'
  const [formularioSeleccionado, setFormularioSeleccionado] = useState(TIPOS_FORMULARIO[0].value);
  const [editorListo, setEditorListo] = useState(false);
  // Pestañas principales para formularios (Socios, Proveedores con hotel, Proveedores sin hotel)
  const [pestaniaFormulario, setPestaniaFormulario] = useState('socio');

  // Configuración de eventos
  const [configuracion, setConfiguracion] = useState({
    logoEmpresa: '',
    logoInfo: null,
    imagenFondo: '',
    fondoInfo: null,
    colorPrimario: '#3498db',
    colorSecundario: '#2c3e50',
    textoEncabezado: 'Red Acero - Registro de Eventos',
    textoDescripcion: 'Complete el formulario con sus datos',
    mostrarLogo: true,
    mostrarImagenFondo: true
  });

  // Configuración de formularios individuales
  const [configFormularios, setConfigFormularios] = useState({
    'socio': { notainicio: '', notafin: '', imageninicio: '' },
    'proveedor-con-hotel': { notainicio: '', notafin: '', imageninicio: '' },
    'proveedor-sin-hotel': { notainicio: '', notafin: '', imageninicio: '' }
  });


  // Configuración de mails
  const [configCorreo, setConfigCorreo] = useState({
    nombre: '',
    descripcion: '',
    remitente: user.email,
    asunto: '',
    cuerpo: '',
    estado: 'activo'
  });
  const [mailsGuardados, setMailsGuardados] = useState([]);
  const [mailSeleccionado, setMailSeleccionado] = useState('nuevo');


  // Cargar configuración existente
  useEffect(() => {
    cargarConfiguracion();
    cargarConfigFormularios();
    cargarMailsGuardados();
  }, []);

  // Recargar mails guardados cada vez que se cambia a la pestaña de correos
  useEffect(() => {
    if (pestania === 'correos') {
      cargarMailsGuardados();
    }
  }, [pestania]);

  // Cargar mails guardados
  const cargarMailsGuardados = async () => {
    try {
      const mails = await FirebaseService.obtenerMailsConfigurados?.();
      if (Array.isArray(mails)) setMailsGuardados(mails);
    } catch (error) {
      console.error('Error cargando mails guardados:', error);
    }
  };

  useEffect(() => {
    setEditorListo(true);
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);
      const config = await FirebaseService.obtenerConfiguracionFormularios();
      if (config) setConfiguracion(config);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarConfigFormularios = async () => {
    try {
      const configs = await FirebaseService.obtenerConfiguracionesFormulariosTipos();
      // Espera un array de objetos con { tipoformulario, notainicio, notafin, imageninicio }
      const nuevo = { ...configFormularios };
      configs.forEach(cfg => {
        if (cfg.tipoformulario) {
          nuevo[cfg.tipoformulario] = {
            notainicio: cfg.notainicio || '',
            notafin: cfg.notafin || '',
            imageninicio: cfg.imageninicio || ''
          };
        }
      });
      setConfigFormularios(nuevo);
    } catch (error) {
      console.error('Error cargando configuración de formularios:', error);
    }
  };

  // Subir imagen de inicio para formulario
  const handleImagenInicioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ La imagen debe ser menor a 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setConfigFormularios(prev => ({
        ...prev,
        [formularioSeleccionado]: {
          ...prev[formularioSeleccionado],
          imageninicio: reader.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Guardar configuración de eventos
  const handleSubmitEventos = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await FirebaseService.guardarConfiguracionFormularios(configuracion);
      alert('✅ Configuración de eventos guardada exitosamente');
    } catch (error) {
      alert('❌ Error al guardar la configuración de eventos');
    } finally {
      setGuardando(false);
    }
  };

  // Guardar configuración de formulario individual
  const handleSubmitFormulario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const datos = {
        tipoformulario: pestaniaFormulario,
        ...configFormularios[pestaniaFormulario]
      };
      await FirebaseService.guardarConfiguracionFormularioTipo(datos);
      alert('✅ Configuración de formulario guardada exitosamente');
    } catch (error) {
      alert('❌ Error al guardar la configuración del formulario');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }
    if (file.size > 1024 * 1024) {
      alert('❌ El logo debe ser menor a 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setConfiguracion(prev => ({
        ...prev,
        logoEmpresa: reader.result,
        logoInfo: {
          originalName: file.name,
          sizeInMB: (file.size / 1024 / 1024).toFixed(2),
          mimeType: file.type
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFondoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Debe seleccionar una imagen válida');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ La imagen debe ser menor a 2MB');
      return;
    }
    setSubiendoFondo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setConfiguracion(prev => ({
        ...prev,
        imagenFondo: reader.result,
        fondoInfo: {
          originalName: file.name,
          sizeInMB: (file.size / 1024 / 1024).toFixed(2),
          mimeType: file.type
        }
      }));
      setSubiendoFondo(false);
    };
    reader.readAsDataURL(file);
  };

  const eliminarLogo = () => {
    setConfiguracion(prev => ({
      ...prev,
      logoEmpresa: '',
      logoInfo: null
    }));
  };

  const eliminarFondo = () => {
    setConfiguracion(prev => ({
      ...prev,
      imagenFondo: '',
      fondoInfo: null
    }));
  };

  const guardarMailConfig = async () => {
    try {
      setGuardando(true);
      let datosMail = { ...configCorreo };
      // Si es nuevo, no enviar id
      if (mailSeleccionado === 'nuevo') {
        if (datosMail.id) delete datosMail.id;
      } else {
        // Si es uno existente, agregar el id
        datosMail.id = mailSeleccionado;
      }
      console.log('configCorreo a guardar:', datosMail); // <-- Verifica el objeto
      await FirebaseService.guardarConfiguracionMailEvento(datosMail);
      alert('✅ Configuración de mail guardada exitosamente');
      await cargarMailsGuardados(); // Refresca la lista tras guardar
    } catch (error) {
      console.error('Error al guardar la configuración de mail:', error); // <-- Log detallado
      alert('❌ Error al guardar la configuración de mail: ' + (error.message || error));
    } finally {
      setGuardando(false);
    }
  };

  // Exportar mails guardados a Excel
  const exportarMailsAExcel = () => {
    if (!mailsGuardados.length) {
      alert('No hay mails guardados para exportar.');
      return;
    }
    // Prepara los datos para exportar
    const datos = mailsGuardados.map(m => ({
      ID: m.id,
      Nombre: m.nombre,
      Descripción: m.descripcion,
      Remitente: m.remitente,
      Asunto: m.asunto,
      Estado: m.estado,
      'Última modificación': m.ultimaModificacion || '',
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MailsGuardados');
    XLSX.writeFile(wb, 'mails_guardados.xlsx');
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando configuraciones...</p>
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'lineheight': ['1', '1.2', '1.5', '2', '2.5', '3'] }],
      ['clean']
    ],
    // Para que funcione lineheight, se requiere un módulo extra o CSS personalizado
  };

  const TABS_FORM = [
    { value: 'socio', label: 'Socios' },
    { value: 'proveedor-con-hotel', label: 'Proveedores con hotel' },
    { value: 'proveedor-sin-hotel', label: 'Proveedores sin hotel' }
  ];

  return (
    <div className="personalizacion-formularios">
      <div className="page-header">
        <h1>🎨 Personalizar</h1>
        <div className="tabs">
          <button
            className={pestania === 'eventos' ? 'active' : ''}
            onClick={() => setPestania('eventos')}
          >
            Eventos
          </button>
          <button
            className={pestania === 'formularios' ? 'active' : ''}
            onClick={() => setPestania('formularios')}
          >
            Formularios
          </button>
          <button
            className={pestania === 'correos' ? 'active' : ''}
            onClick={() => setPestania('correos')}
          >
            Correos
          </button>
        </div>
        {/* Si está en Formularios, mostrar pestañas secundarias */}
        {pestania === 'formularios' && (
          <div className="tabs tabs-formularios" style={{ marginTop: 16 }}>
            {TABS_FORM.map(t => (
              <button
                key={t.value}
                className={`color-gris${pestaniaFormulario === t.value ? ' active' : ''}`}
                onClick={() => setPestaniaFormulario(t.value)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>


      {pestania === 'eventos' && (
        <form onSubmit={handleSubmitEventos} className="config-form">
          {/* Sección de imágenes */}
          <div className="config-section">
            <h2>🖼️ Imágenes</h2>
            {/* Logo de empresa */}
            <div className="image-upload-section">
              <div className="section-header">
                <h3>🏢 Logo de Empresa</h3>
                <div className="section-badges">
                  <span className="badge info">Base64</span>
                  <span className="badge warning">Recomendado</span>
                </div>
              </div>
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={subiendoLogo || guardando}
                  id="logo-upload"
                  className="file-input-hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className={`btn-upload primary ${subiendoLogo ? 'loading' : ''}`}
                >
                  {subiendoLogo ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">📁</span>
                      <span>Seleccionar Logo</span>
                    </>
                  )}
                </label>
                {configuracion.logoEmpresa && (
                  <button
                    type="button"
                    onClick={eliminarLogo}
                    className="btn-delete"
                    disabled={guardando}
                  >
                    <span className="icon">🗑️</span>
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
              {/* Preview del logo */}
              {configuracion.logoEmpresa && (
                <div className="image-preview">
                  <div className="preview-container">
                    <img
                      src={configuracion.logoEmpresa}
                      alt="Logo de empresa"
                      className="logo-preview"
                    />
                  </div>
                  {configuracion.logoInfo && (
                    <div className="image-info">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">📁 Archivo:</span>
                          <span className="info-value">{configuracion.logoInfo.originalName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">📏 Tamaño:</span>
                          <span className="info-value">{configuracion.logoInfo.sizeInMB} MB</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">🎨 Formato:</span>
                          <span className="info-value">{configuracion.logoInfo.mimeType}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">💾 Almacenamiento:</span>
                          <span className="info-value">Base64 en Firestore</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="upload-info">
                <div className="info-card">
                  <div className="info-icon">💡</div>
                  <div className="info-content">
                    <p><strong>Almacenamiento Base64:</strong> La imagen se convierte a texto y se guarda directamente en Firestore</p>
                    <p><strong>Recomendaciones:</strong> Logo de 200x60px, formato PNG, máximo 500KB</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Imagen de fondo */}
            <div className="image-upload-section">
              <div className="section-header">
                <h3>🌄 Imagen de Fondo</h3>
                <div className="section-badges">
                  <span className="badge info">Base64</span>
                  <span className="badge warning">Opcional</span>
                </div>
              </div>
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFondoUpload}
                  disabled={subiendoFondo || guardando}
                  id="fondo-upload"
                  className="file-input-hidden"
                />
                <label
                  htmlFor="fondo-upload"
                  className={`btn-upload secondary ${subiendoFondo ? 'loading' : ''}`}
                >
                  {subiendoFondo ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">🖼️</span>
                      <span>Seleccionar Fondo</span>
                    </>
                  )}
                </label>
                {configuracion.imagenFondo && (
                  <button
                    type="button"
                    onClick={eliminarFondo}
                    className="btn-delete"
                    disabled={guardando}
                  >
                    <span className="icon">🗑️</span>
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
              {/* Preview de imagen de fondo */}
              {configuracion.imagenFondo && (
                <div className="image-preview">
                  <div className="preview-container fondo">
                    <img
                      src={configuracion.imagenFondo}
                      alt="Imagen de fondo"
                      className="fondo-preview"
                    />
                  </div>
                  {configuracion.fondoInfo && (
                    <div className="image-info">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">📁 Archivo:</span>
                          <span className="info-value">{configuracion.fondoInfo.originalName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">📏 Tamaño:</span>
                          <span className="info-value">{configuracion.fondoInfo.sizeInMB} MB</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">🎨 Formato:</span>
                          <span className="info-value">{configuracion.fondoInfo.mimeType}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">💾 Almacenamiento:</span>
                          <span className="info-value">Base64 en Firestore</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="upload-info">
                <div className="info-card warning">
                  <div className="info-icon">⚠️</div>
                  <div className="info-content">
                    <p><strong>Atención:</strong> Las imágenes grandes aumentan el tiempo de carga</p>
                    <p><strong>Recomendación:</strong> Máximo 1MB, formato JPG optimizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {pestania === 'formularios' && (
        <form onSubmit={handleSubmitFormulario} className="config-form">
          <div className="config-section">
            <h2>📝 Personalización de Formularios</h2>
            {/* Tabs secundarios reemplazan el select */}
            {/* Renderiza el formulario correspondiente al tabForm */}
            <div className="form-group">
              <label>Nota de Inicio</label>
              {editorListo && (
                <ReactQuill
                  value={configFormularios[pestaniaFormulario]?.notainicio || ''}
                  onChange={value =>
                    setConfigFormularios(prev => ({
                      ...prev,
                      [pestaniaFormulario]: {
                        ...prev[pestaniaFormulario],
                        notainicio: value
                      }
                    }))
                  }
                  theme="snow"
                  modules={modules}
                  style={{ background: 'white', minHeight: 120 }}
                  readOnly={guardando}
                />
              )}
              <small>Puedes usar formato, listas, colores, imágenes, etc.</small>
            </div>
            <div className="form-group">
              <label>Nota de Fin</label>
              {editorListo && (
                <ReactQuill
                  value={configFormularios[pestaniaFormulario]?.notafin || ''}
                  onChange={value =>
                    setConfigFormularios(prev => ({
                      ...prev,
                      [pestaniaFormulario]: {
                        ...prev[pestaniaFormulario],
                        notafin: value
                      }
                    }))
                  }
                  theme="snow"
                  modules={modules}
                  style={{ background: 'white', minHeight: 120 }}
                  readOnly={guardando}
                />
              )}
              <small>Puedes usar formato, listas, colores, imágenes, etc.</small>
            </div>
            <div className="form-group">
              <label>Imagen de Inicio</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenInicioUpload}
                disabled={guardando}
              />
              {configFormularios[pestaniaFormulario]?.imageninicio && (
                <div className="image-preview">
                  <img
                    src={configFormularios[pestaniaFormulario].imageninicio}
                    alt="Imagen de inicio"
                    style={{ maxWidth: 400, maxHeight: 220, marginTop: 8, borderRadius: 10, boxShadow: '0 2px 8px #b0b0b0' }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfigFormularios(prev => ({
                        ...prev,
                        [pestaniaFormulario]: {
                          ...prev[pestaniaFormulario],
                          imageninicio: ''
                        }
                      }))
                    }
                    disabled={guardando}
                    style={{ marginLeft: 12 }}
                  >
                    Quitar Imagen
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              disabled={guardando}
              className="btn-primary"
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      )}

      {pestania === 'correos' && (
        <div className="seccion-formulario" style={{ marginTop: '2rem' }}>
          <h3>✉️ Configuración de Correos para el Evento</h3>
          {/* Selector de mails guardados */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              className="btn-secundario"
              onClick={exportarMailsAExcel}
              style={{ minWidth: 180 }}
            >
              📤 Exportar lista a Excel
            </button>
          </div>
          <div className="campo-grupo">
            <label>Seleccionar mail guardado</label>
            <select
              value={mailSeleccionado}
              onChange={e => {
                const val = e.target.value;
                setMailSeleccionado(val);
                if (val === 'nuevo') {
                  setConfigCorreo({
                    nombre: '',
                    descripcion: '',
                    remitente: user.email,
                    asunto: '',
                    cuerpo: '',
                    estado: 'activo'
                  });
                } else {
                  const mail = mailsGuardados.find(m => m.id === val);
                  if (mail) setConfigCorreo({
                    nombre: mail.nombre || '',
                    descripcion: mail.descripcion || '',
                    remitente: mail.remitente || user.email,
                    asunto: mail.asunto || '',
                    cuerpo: mail.cuerpo || '',
                    estado: mail.estado || 'activo'
                  });
                }
              }}
              style={{ marginBottom: 12 }}
            >
              <option value="nuevo">➕ Crear nuevo mail</option>
              {mailsGuardados.map(m => (
                <option
                  key={m.id}
                  value={m.id}
                  style={m.estado === 'inactivo' ? { color: 'red', fontWeight: 'bold' } : {}}
                >
                  {`${m.nombre || m.asunto || m.id} - ${m.descripcion ? m.descripcion : ''} [${m.estado === 'inactivo' ? 'Inactivo' : 'Activo'}]`}
                </option>
              ))}
            </select>
          </div>
          <div className="campo-grupo">
            <label>Nombre</label>
            <input
              type="text"
              value={configCorreo.nombre || ''}
              onChange={e => setConfigCorreo({ ...configCorreo, nombre: e.target.value })}
              placeholder="Nombre identificador del mail"
              required
            />
          </div>
          <div className="campo-grupo">
            <label>Descripción</label>
            <input
              type="text"
              value={configCorreo.descripcion || ''}
              onChange={e => setConfigCorreo({ ...configCorreo, descripcion: e.target.value })}
              placeholder="Descripción breve del mail"
            />
          </div>
          <div className="campo-grupo">
            <label>Estado</label>
            <select
              value={configCorreo.estado || 'activo'}
              onChange={e => setConfigCorreo({ ...configCorreo, estado: e.target.value })}
              style={{ maxWidth: 180, marginBottom: 8 }}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="campo-grupo">
            <label>Remitente</label>
            <input
              type="email"
              value={configCorreo.remitente || user.email}
              onChange={e => setConfigCorreo({ ...configCorreo, remitente: e.target.value })}
              placeholder="Remitente"
              required
            />
            <small>Por defecto es tu correo de usuario.</small>
          </div>
          <div className="campo-grupo">
            <label>Asunto</label>
            <input
              type="text"
              value={configCorreo.asunto || ''}
              onChange={e => setConfigCorreo({ ...configCorreo, asunto: e.target.value })}
              placeholder="Asunto del correo"
              required
            />
          </div>
          <div className="campo-grupo">
            <label>Cuerpo del Correo</label>
            {editorListo && (
              <ReactQuill
                value={configCorreo.cuerpo || ''}
                onChange={value => setConfigCorreo({ ...configCorreo, cuerpo: value })}
                theme="snow"
                modules={modules}
                style={{ background: 'white', minHeight: 180 }}
              />
            )}
            <small>Puedes escribir texto, pegar URLs o insertar imágenes (usa el botón de imagen del editor).</small>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
            <button
              className="btn-primario"
              onClick={guardarMailConfig}
              type="button"
            >
              Guardar configuración de correo
            </button>
            <button
              className="btn-secundario"
              type="button"
              onClick={() => {
                setMailSeleccionado('nuevo');
                setConfigCorreo({
                  nombre: '',
                  descripcion: '',
                  remitente: user.email,
                  asunto: '',
                  cuerpo: '',
                  estado: 'activo'
                  // No incluir id
                });
              }}
            >
              Nuevo correo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>Ocurrió un error al cargar el editor.</div>;
    }
    return this.props.children;
  }
}

export default PersonalizacionFormularios;