import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FirebaseService } from '../services/FirebaseService';

function MagicLogin() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verificando enlace...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('Enlace inválido.');
      return;
    }
    fetch(`/api/validateMagicLink?token=${token}`)
      .then(res => res.json())
      .then(async data => {
        if (data.error) {
          setStatus('Enlace inválido o expirado.');
        } else {
          // Login automático: busca el usuario y lo setea en el contexto (ajusta según tu auth)
          const user = await FirebaseService.obtenerUsuarioPorId(data.userId);
          if (user) {
            // Marca que debe cambiar la contraseña
            await FirebaseService.resetearPrimerLogin(user.id);
            // Guarda el usuario en localStorage/session (ajusta según tu auth)
            localStorage.setItem('usuario', JSON.stringify(user));
            setStatus('Login exitoso. Redirigiendo...');
            setTimeout(() => {
              navigate('/cambiar-password', { replace: true });
            }, 1500);
          } else {
            setStatus('Usuario no encontrado.');
          }
        }
      })
      .catch(() => setStatus('Error validando el enlace.'));
  }, [searchParams, navigate]);

  return (
    <div style={{margin:'2em',textAlign:'center'}}>
      <h2>Ingreso automático</h2>
      <p>{status}</p>
    </div>
  );
}

export default MagicLogin;
