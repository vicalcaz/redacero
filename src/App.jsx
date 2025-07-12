import { useState, useEffect } from 'react';
import { FirebaseService } from './services/FirebaseService';
import Login from './components/Login';
import AdminNavbar from './components/AdminNavBar';
import UserManagement from './components/UserManagement';
import EventManagement from './components/EventManagement';
import FormularioManagement from './components/formularios/FormularioManagement';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('usuarios');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar datos por defecto al cargar la app
    const inicializar = async () => {
      try {
        await FirebaseService.inicializarDatos();
      } catch (error) {
        console.error('Error inicializando la aplicación:', error);
      } finally {
        setLoading(false);
      }
    };
    
    inicializar();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('usuarios');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'usuarios':
        return <UserManagement />;
      case 'eventos':
        return <EventManagement />;
      case 'formularios':
        return <FormularioManagement />;
      default:
        return <UserManagement />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Inicializando aplicación...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {user.perfil === 'Administrador' && (
        <>
          <AdminNavbar onNavigate={handleNavigate} onLogout={handleLogout} />
          <main className="main-content">
            {renderCurrentView()}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
