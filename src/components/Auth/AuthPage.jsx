import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
        navigate('/dashboard');
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
        navigate('/dashboard');
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
    <div className={styles.authPage}>
      {/* Header con navegación */}
      <header className={styles.authHeader}>
        <nav className={styles.authNav}>
          <Link to="/" className={styles.logoLink}>
            <img src="/LogoTEL.png" alt="IntraTEL" className={styles.logo} />
            <span className={styles.logoText}>IntraTEL</span>
          </Link>
          <Link to="/" className={styles.backToHome}>
            ← Volver al inicio
          </Link>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className={styles.authMain}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.authCardHeader}>
              <h1 className={styles.authTitle}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h1>
              <p className={styles.authSubtitle}>
                {isLogin 
                  ? 'Bienvenido de vuelta a IntraTEL' 
                  : 'Únete a la comunidad IntraTEL'
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
      </main>
    </div>
  );
};

export default AuthPage;
