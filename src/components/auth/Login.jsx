// Reemplazar el estado inicial:

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',        // ✅ Vacío, sin datos prellenados
    password: ''      // ✅ Vacío, sin datos prellenados
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Eliminar cualquier useEffect que esté prellenando datos
  // NO hacer esto:
  // useEffect(() => {
  //   setFormData({ email: 'admin@redacero.com', password: 'reacero' });
  // }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Login: Intentando login con:', formData.email);
      
      const usuario = await FirebaseService.validarLogin(formData.email, formData.password);
      
      console.log('✅ Login exitoso:', usuario.email);
      onLogin(usuario);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔑 Iniciar Sesión</h1>
          <p>Accede a RedAcero Eventos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Ingresa tu email"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.submit && (
            <div className="error-message">
              ❌ {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Iniciando sesión...' : '🔑 Iniciar Sesión'}
            </button>
          </div>
        </form>

        {/* Información para desarrollo */}
        <div className="dev-info">
          <p>💡 Si es la primera vez:</p>
          <ul>
            <li>Usuario admin: <code>admin@redacero.com</code></li>
            <li>Contraseña: <code>reacero</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;