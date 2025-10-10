import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../etc/ThemeToggle';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import styles from './Auth.module.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setMessage(result.message || 'Error en el inicio de sesión');
      }
    } catch (error) {
      setMessage('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await register(userData);
      
      if (result.success) {
        // Redirigir a la página de bienvenida para nuevos usuarios
        navigate('/bienvenida');
      } else {
        setMessage(result.message || 'Error en el registro');
      }
    } catch (error) {
      setMessage('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authMain}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Botón de cambio de tema */}
          <div className={styles.themeToggleContainer}>
            <ThemeToggle />
          </div>
          
          <div className={styles.authCardHeader}>
            <h1 className={styles.authTitle}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className={styles.authSubtitle}>
              {isLogin 
                ? 'Bienvenido de vuelta a Didactic-Tel' 
                : 'Únete a la comunidad Didactic-Tel'
              }
            </p>
          </div>

          {message && (
            <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
              {message}
            </div>
          )}

          <div className={styles.authFormContainer}>
            {isLogin ? (
              <LoginForm 
                onSubmit={handleLogin}
                onSwitchToRegister={() => setIsLogin(false)}
                isLoading={isLoading}
              />
            ) : (
              <RegisterForm 
                onSubmit={handleRegister}
                onSwitchToLogin={() => setIsLogin(true)}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
