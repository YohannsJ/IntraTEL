import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, log, logError } from '../../config/environment';
import styles from './Profile.module.css';

const UserProfile = () => {
  const { user, updateProfile, changePassword, joinGroup, leaveGroup } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);
  const [flags, setFlags] = useState([]);
  const [groupCode, setGroupCode] = useState('');
  const [joinGroupLoading, setJoinGroupLoading] = useState(false);

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
      loadUserFlags();
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

  const loadUserFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/user'), {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setFlags(data.data);
        log(`Loaded ${data.data.length} user flags`);
      }
    } catch (error) {
      logError('Error loading flags:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile({
        username: profileData.username,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al actualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error interno del servidor' });
      logError('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al cambiar contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error interno del servidor' });
      logError('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    
    if (!groupCode.trim()) {
      setMessage({ type: 'error', text: 'Código de grupo requerido' });
      return;
    }

    setJoinGroupLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await joinGroup(groupCode.trim());
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Te has unido al grupo exitosamente' });
        setGroupCode('');
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al unirse al grupo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error interno del servidor' });
      logError('Error joining group:', error);
    } finally {
      setJoinGroupLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('¿Estás seguro de que quieres salir del grupo?')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await leaveGroup();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Has salido del grupo exitosamente' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al salir del grupo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error interno del servidor' });
      logError('Error leaving group:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
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

  const tabs = [
    { id: 'profile', label: '👤 Perfil', icon: '👤' },
    { id: 'estadisticas', label: '📊 Estadísticas', icon: '📊' },
    { id: 'flags', label: '🚩 Flags', icon: '🚩' },
    { id: 'grupos', label: '👥 Grupos', icon: '👥' },
    { id: 'contrasena', label: '🔒 Contraseña', icon: '🔒' }
  ];

  return (
    <div className={styles.profileContainer}>
      {/* Profile Header GitHub Style */}
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

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* Profile Tab - Información Personal Mejorada */}
        {activeTab === 'profile' && (
          <div className={styles.profileTabContainer}>
            {/* Información Personal Display */}
            <div className={styles.personalInfoSection}>
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

            {/* Formulario de Edición */}
            <div className={styles.editSection}>
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
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : '💾 Guardar Cambios'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Estadisticas Tab */}
        {activeTab === 'estadisticas' && (
          <>
            {stats ? (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.totalPoints || 0}</span>
                  <span className={styles.statLabel}>Puntos Totales</span>
                </div>
                <div className={styles.statCard}>
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
          </>
        )}

        {/* Flags Tab */}
        {activeTab === 'flags' && (
          <div className={styles.flagsSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Mis Flags</h3>
              <span>{flags.length} obtenidas</span>
            </div>
            {flags.length > 0 ? (
              <div className={styles.flagsGrid}>
                {flags.map((flag, index) => (
                  <div key={index} className={styles.flagCard}>
                    <div className={styles.flagHeader}>
                      <div className={styles.flagIcon}>🚩</div>
                      <h4 className={styles.flagTitle}>{flag.flag_name || `Flag ${index + 1}`}</h4>
                    </div>
                    <p className={styles.flagDescription}>
                      {flag.description || 'Descripción no disponible'}
                    </p>
                    <div className={styles.flagMeta}>
                      <span className={styles.flagDate}>
                        {formatDate(flag.obtained_at)}
                      </span>
                      <span className={styles.flagPoints}>
                        +{flag.points || 0} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎯</div>
                <h3 className={styles.emptyTitle}>No tienes flags aún</h3>
                <p className={styles.emptyDescription}>
                  Completa desafíos y encuentra flags ocultas para ganar puntos y subir en el ranking.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Grupos Tab */}
        {activeTab === 'grupos' && (
          <div className={styles.groupSection}>
            {user.group_id ? (
              <div className={styles.currentGroup}>
                <div className={styles.groupHeader}>
                  <h4 className={styles.groupTitle}>Mi Grupo</h4>
                  <button
                    className={styles.leaveButton}
                    onClick={handleLeaveGroup}
                    disabled={loading}
                  >
                    Salir del Grupo
                  </button>
                </div>
                <div className={styles.groupInfo}>
                  <p><strong>Nombre:</strong> {user.group_name || 'Grupo sin nombre'}</p>
                  <p><strong>Código:</strong> {user.group_code || 'No disponible'}</p>
                  <p><strong>Miembros:</strong> {user.group_members || 'No disponible'}</p>
                </div>
              </div>
            ) : (
              <div className={styles.joinGroupForm}>
                <h4 className={styles.joinGroupTitle}>Unirse a un Grupo</h4>
                <form onSubmit={handleJoinGroup}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Código del Grupo</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value)}
                      placeholder="Ingresa el código del grupo"
                      required
                    />
                    <small className={styles.formHelp}>
                      Solicita el código a tu instructor o administrador
                    </small>
                  </div>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={joinGroupLoading}
                  >
                    {joinGroupLoading ? 'Uniéndose...' : '🔗 Unirse al Grupo'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Contraseña Tab */}
        {activeTab === 'contrasena' && (
          <div className={styles.form}>
            <form onSubmit={handlePasswordSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contraseña Actual</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
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
                    required
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
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Cambiando...' : '🔒 Cambiar Contraseña'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
