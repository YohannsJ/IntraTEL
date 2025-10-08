import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import styles from './Auth.module.css';

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useData();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validaciones adicionales para registro
    if (!isLoginMode) {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmar contraseña es requerido';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        // Simular llamada a API de login
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = {
          email: formData.email,
          name: formData.email.split('@')[0], // Usar parte del email como nombre
          id: Date.now()
        };
        
        login(userData);
        navigate('/');
      } else {
        // Simular llamada a API de registro
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = {
          email: formData.email,
          name: formData.name
        };
        
        register(userData);
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: 'Error en la autenticación. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setErrors({});
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
          </h1>
          <p className={styles.authSubtitle}>
            {isLoginMode 
              ? 'Bienvenido de vuelta a Didactic-Tel' 
              : 'Únete a la comunidad Didactic-Tel'
            }
          </p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}

          {!isLoginMode && (
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.name && (
                <span className={styles.fieldError}>{errors.name}</span>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
              placeholder="ejemplo@correo.com"
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          {!isLoginMode && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Repite tu contraseña"
              />
              {errors.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}>⟳</span>
            ) : (
              isLoginMode ? 'Iniciar Sesión' : 'Registrarse'
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.toggleText}>
            {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              onClick={toggleMode}
              className={styles.toggleButton}
            >
              {isLoginMode ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
