import { useState } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Login: Intentando login para:', email);
      
      // ✅ USAR validarLogin que ya tiene toda la lógica:
      const userData = await FirebaseService.validarLogin(email, password);
      
      console.log('✅ Login: Usuario validado:', {
        id: userData.id,
        email: userData.email,
        passwordCambiado: userData.passwordCambiado
      });
      
      // ✅ PASAR TODOS los datos del usuario:
      onLogin(userData); // Todo el objeto con todos los campos reales
      
    } catch (error) {
      console.error('❌ Login: Error:', error);
      setError(error.message || 'Error al iniciar sesión');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <h1>Eventos Red Acero</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Ingresa tu email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Ingresa tu contraseña"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        {/* Botón temporal para debugging oculto en producción */}
        {/*
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={() => {
              setEmail('admin@redacero.com');
              setPassword('admin123');
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}
          >
            🔧 Login Admin (Dev)
          </button>
        </div>
        */}
      </div>
    </div>
  );
}

export default Login;