import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getAuthHeaders, log, logError } from '../../config/environment';
import styles from './Profile.module.css';

const UserProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);

  // Datos del perfil
  const [profileData, setProfileData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: ''
  });

  // Datos de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      });
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await fetch(getApiUrl('/auth/statistics'), {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data.statistics);
        log('User stats loaded successfully');
      }
    } catch (error) {
      logError('Error loading stats:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Actualizar perfil
      const profileResult = await updateProfile({
        username: profileData.username,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      });

      if (!profileResult.success) {
        setMessage({ type: 'error', text: profileResult.message || 'Error al actualizar perfil' });
        setLoading(false);
        return;
      }

      // Si hay datos de contraseña, intentar cambiarla
      if (passwordData.currentPassword && passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
          setLoading(false);
          return;
        }

        if (passwordData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
          setLoading(false);
          return;
        }

        const passwordResult = await changePassword(
          passwordData.currentPassword,
          passwordData.newPassword
        );

        if (!passwordResult.success) {
          setMessage({ type: 'error', text: passwordResult.message || 'Error al cambiar contraseña' });
          setLoading(false);
          return;
        }

        // Limpiar campos de contraseña
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        setMessage({ type: 'success', text: 'Perfil y contraseña actualizados exitosamente' });
      } else {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error interno del servidor' });
      logError('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    }
    if (username) {
      return username.slice(0, 2);
    }
    return 'US';
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderContent}>
          <div className={styles.avatar}>
            {getInitials(user.first_name, user.last_name, user.username)}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user.username}
            </h1>
            <p className={styles.userEmail}>{user.email}</p>
            <span className={styles.userRole}>{user.role}</span>
            <p className={styles.memberSince}>
              Miembro desde {formatJoinDate(user.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className={styles.section}>
        <div className={styles.infoHeader}>
          <h3 className={styles.sectionTitle}>📋 Información Personal</h3>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot}></span>
            Activo
          </div>
        </div>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>👤</div>
            <div className={styles.infoContent}>
              <label className={styles.infoLabel}>Usuario</label>
              <span className={styles.infoValue}>{user.username}</span>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📧</div>
            <div className={styles.infoContent}>
              <label className={styles.infoLabel}>Email</label>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🏷️</div>
            <div className={styles.infoContent}>
              <label className={styles.infoLabel}>Nombre Completo</label>
              <span className={styles.infoValue}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : 'No especificado'}
              </span>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>⭐</div>
            <div className={styles.infoContent}>
              <label className={styles.infoLabel}>Rol</label>
              <span className={`${styles.infoValue} ${styles.roleValue}`}>{user.role}</span>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📅</div>
            <div className={styles.infoContent}>
              <label className={styles.infoLabel}>Miembro desde</label>
              <span className={styles.infoValue}>{formatJoinDate(user.created_at)}</span>
            </div>
          </div>
          
          {user.group_name && (
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>👥</div>
              <div className={styles.infoContent}>
                <label className={styles.infoLabel}>Grupo</label>
                <span className={styles.infoValue}>{user.group_name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 Estadísticas</h3>
        {stats ? (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.totalPoints || 0}</span>
              <span className={styles.statLabel}>Puntos Totales</span>
            </div>
            <div 
              className={styles.statCard} 
              onClick={() => navigate('/mis-flags')}
              style={{ cursor: 'pointer' }}
              title="Ir a Mis Flags"
            >
              <span className={styles.statNumber}>{stats.flagsObtained || 0}</span>
              <span className={styles.statLabel}>Flags Obtenidas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.levelsCompleted || 0}</span>
              <span className={styles.statLabel}>Niveles Completados</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{stats.gamesPlayed || 0}</span>
              <span className={styles.statLabel}>Juegos Jugados</span>
            </div>
          </div>
        ) : (
          <div className={styles.loading}>
            Cargando estadísticas...
          </div>
        )}
      </div>

      {/* Editar Perfil */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>✏️ Editar Perfil</h3>
        <form onSubmit={handleProfileSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre de Usuario</label>
              <input
                type="text"
                className={styles.formInput}
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
              <small className={styles.formHelp}>Debe ser único en el sistema</small>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={`${styles.formInput} ${styles.disabled}`}
                value={profileData.email}
                disabled
              />
              <small className={styles.formHelp}>El email no se puede cambiar</small>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre</label>
              <input
                type="text"
                className={styles.formInput}
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Apellido</label>
              <input
                type="text"
                className={styles.formInput}
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Cambio de Contraseña en el mismo formulario */}
          <div className={styles.passwordSection}>
            <h4 className={styles.subsectionTitle}>🔒 Cambiar Contraseña</h4>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña Actual</label>
              <input
                type="password"
                className={styles.formInput}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Dejar vacío si no deseas cambiar"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nueva Contraseña</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  minLength="6"
                  placeholder="Dejar vacío si no deseas cambiar"
                />
                <small className={styles.formHelp}>Mínimo 6 caracteres</small>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirmar Contraseña</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  minLength="6"
                  placeholder="Confirmar nueva contraseña"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Todos los Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
