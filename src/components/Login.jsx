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
      // Primero verificar si el usuario existe en nuestra base de datos
      const userData = await FirebaseService.obtenerUsuarioPorEmail(email);
      
      if (!userData) {
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }

      // Verificar la contraseña (en desarrollo, usar la contraseña almacenada)
      if (userData.password !== password) {
        setError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      // Si es válido, hacer login
      onLogin({
        email: userData.email,
        perfil: userData.perfil,
        primerIngreso: userData.primerIngreso,
        id: userData.id
      });

    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al iniciar sesión');
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
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;