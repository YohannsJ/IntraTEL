import React, { useState } from 'react';
import styles from './Auth.module.css';

const RegisterForm = ({ onSubmit, onSwitchToLogin, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    groupCode: '',
    createGroup: false,
    groupName: ''
  });
  const [errors, setErrors] = useState({});
  const [showGroupCode, setShowGroupCode] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña es requerido';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Apellido es requerido';
    }

    if (showCreateGroup && !formData.groupName.trim()) {
      newErrors.groupName = 'Nombre del grupo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setErrors({});

    const registerData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      ...(formData.groupCode.trim() && { groupCode: formData.groupCode.trim() }),
      ...(showCreateGroup && formData.groupName.trim() && { createGroup: true, groupName: formData.groupName.trim() })
    };

    await onSubmit(registerData);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Crear Cuenta</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
              placeholder="Tu nombre"
              disabled={isLoading}
            />
            {errors.firstName && (
              <span className={styles.fieldError}>{errors.firstName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
              placeholder="Tu apellido"
              disabled={isLoading}
            />
            {errors.lastName && (
              <span className={styles.fieldError}>{errors.lastName}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
            placeholder="usuario123"
            disabled={isLoading}
          />
          {errors.username && (
            <span className={styles.fieldError}>{errors.username}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email}</span>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Repetir contraseña"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className={styles.groupCodeSection}>
          <h3 className={styles.groupOptionsTitle}>Opciones de Grupo</h3>
          
          <div className={styles.groupOptionsGrid}>
            <div 
              className={`${styles.groupOptionCard} ${showGroupCode ? styles.active : ''}`}
              onClick={() => {
                setShowGroupCode(!showGroupCode);
                if (!showGroupCode) setShowCreateGroup(false);
              }}
            >
              <span className={styles.groupOptionIcon}>🔗</span>
              <h4 className={styles.groupOptionTitle}>Unirse a Grupo</h4>
              <p className={styles.groupOptionDescription}>
                Tengo un código de grupo existente
              </p>
            </div>
            
            <div 
              className={`${styles.groupOptionCard} ${showCreateGroup ? styles.active : ''}`}
              onClick={() => {
                setShowCreateGroup(!showCreateGroup);
                if (!showCreateGroup) setShowGroupCode(false);
              }}
            >
              <span className={styles.groupOptionIcon}>✨</span>
              <h4 className={styles.groupOptionTitle}>Crear Grupo</h4>
              <p className={styles.groupOptionDescription}>
                Crear un nuevo grupo de estudio
              </p>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="hasGroupCode"
              checked={showGroupCode}
              onChange={(e) => {
                setShowGroupCode(e.target.checked);
                if (e.target.checked) setShowCreateGroup(false);
              }}
              className={styles.checkbox}
              disabled={isLoading}
            />
            <label htmlFor="hasGroupCode" className={styles.checkboxLabel}>
              Tengo un código de grupo
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="createGroup"
              checked={showCreateGroup}
              onChange={(e) => {
                setShowCreateGroup(e.target.checked);
                if (e.target.checked) setShowGroupCode(false);
              }}
              className={styles.checkbox}
              disabled={isLoading}
            />
            <label htmlFor="createGroup" className={styles.checkboxLabel}>
              Crear un nuevo grupo
            </label>
          </div>

          {showGroupCode && (
            <div className={styles.formGroup}>
              <label htmlFor="groupCode" className={styles.label}>
                Código de Grupo
              </label>
              <input
                type="text"
                id="groupCode"
                name="groupCode"
                value={formData.groupCode}
                onChange={handleChange}
                className={styles.input}
                placeholder="ABC123"
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
              <small className={styles.helpText}>
                Si tienes un código de grupo proporcionado por tu profesor, ingrésalo aquí.
              </small>
            </div>
          )}

          {showCreateGroup && (
            <div className={styles.formGroup}>
              <label htmlFor="groupName" className={styles.label}>
                Nombre del Grupo
              </label>
              <input
                type="text"
                id="groupName"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                className={`${styles.input} ${errors.groupName ? styles.inputError : ''}`}
                placeholder="Mi Grupo de Estudio"
                disabled={isLoading}
              />
              {errors.groupName && (
                <span className={styles.fieldError}>{errors.groupName}</span>
              )}
              <small className={styles.helpText}>
                Serás el administrador de este grupo y recibirás un código para invitar a otros miembros.
              </small>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <div className={styles.switchForm}>
        <p>
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={styles.linkButton}
            disabled={isLoading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
