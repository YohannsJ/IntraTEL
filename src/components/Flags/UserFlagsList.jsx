import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import styles from './UserFlagsList.module.css';

// Función para formatear tiempo relativo
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Hace menos de 1 minuto';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  // Para fechas más antiguas, mostrar fecha formateada
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const UserFlagsList = () => {
  const { user } = useAuth();
  const [userFlags, setUserFlags] = useState([]);
  const [availableFlags, setAvailableFlags] = useState([]);
  const [groupFlags, setGroupFlags] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchUserFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/user'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUserFlags(data.data);
      }
    } catch (error) {
      logError('Error fetching user flags:', error);
    }
  };

  const fetchAvailableFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/available'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableFlags(data.data);
      }
    } catch (error) {
      logError('Error fetching available flags:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/user/stats'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      logError('Error fetching user stats:', error);
    }
  };

  const fetchGroupFlags = async () => {
    if (!user?.group_id) return;

    try {
      const response = await fetch(getApiUrl(`/flags/groups/${user.group_id}`), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setGroupFlags(data.data);
      }
    } catch (error) {
      logError('Error fetching group flags:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserFlags(),
        fetchAvailableFlags(),
        fetchUserStats(),
        fetchGroupFlags()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user?.group_id]);

  // Función para refrescar datos manualmente
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchUserFlags(),
      fetchAvailableFlags(),
      fetchUserStats(),
      fetchGroupFlags()
    ]);
    setLoading(false);
  };

  // Función auxiliar para formatear fecha
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Función auxiliar para tiempo relativo
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  };

  // Crear mapa de flags obtenidas por el usuario
  const userFlagMap = new Map(userFlags.map(flag => [flag.flag_name, flag]));
  
  // Combinar flags disponibles con información de si fueron obtenidas
  const allFlagsWithStatus = availableFlags.map(availableFlag => {
    const userFlag = userFlagMap.get(availableFlag.flag_name);
    return {
      ...availableFlag,
      obtained: !!userFlag,
      userFlagData: userFlag || null
    };
  });

  // Filtrar flags según la pestaña activa
  const getFilteredFlags = () => {
    switch (activeTab) {
      case 'obtained':
        return allFlagsWithStatus.filter(flag => flag.obtained);
      case 'missing':
        return allFlagsWithStatus.filter(flag => !flag.obtained);
      case 'personal':
        return userFlags.map(flag => ({ ...flag, obtained: true, userFlagData: flag }));
      case 'group':
        return groupFlags;
      default: // 'all'
        return allFlagsWithStatus;
    }
  };

  const filteredFlags = getFilteredFlags();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button 
        className={styles.refreshButton}
        onClick={handleRefresh}
        title="Actualizar flags"
      >
        🔄
      </button>
      
      <div className={styles.header}>
        <h1 className={styles.title}>🚩 Flags Disponibles ({availableFlags.length})</h1>
        <p className={styles.subtitle}>
          Explora todas las flags disponibles y tu progreso en el sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{userFlags.length}</div>
          <div className={styles.statLabel}>Flags Obtenidas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{availableFlags.length}</div>
          <div className={styles.statLabel}>Flags Disponibles</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalPoints || 0}</div>
          <div className={styles.statLabel}>Puntos Totales</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {availableFlags.length > 0 ? Math.round((userFlags.length / availableFlags.length) * 100) : 0}%
          </div>
          <div className={styles.statLabel}>Progreso</div>
        </div>
      </div>

      {/* Pestañas */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todas ({availableFlags.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'obtained' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('obtained')}
        >
          Obtenidas ({userFlags.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'missing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('missing')}
        >
          Faltantes ({availableFlags.length - userFlags.length})
        </button>
        {user?.group_id && (
          <button
            className={`${styles.tab} ${activeTab === 'group' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('group')}
          >
            Equipo ({groupFlags.length})
          </button>
        )}
      </div>

      {/* Lista de flags */}
      <div className={styles.flagsSection}>
        <div className={styles.flagsList}>
          {filteredFlags.length === 0 ? (
            <div className={styles.emptyState}>
              <p>🎯 No hay flags para mostrar en esta categoría</p>
              <p>
                {activeTab === 'missing' 
                  ? 'Explora los juegos y desafíos para encontrar más flags.'
                  : 'Explora los juegos y desafíos para obtener flags.'}
              </p>
            </div>
          ) : (
            filteredFlags.map((flag, index) => {
              const isObtained = flag.obtained;
              const flagData = flag.userFlagData;
              const isGroupFlag = activeTab === 'group';

              return (
                <div 
                  key={flag.id || `${flag.flag_name}-${index}`} 
                  className={`${styles.flagCard} ${isObtained ? styles.obtainedFlag : styles.missingFlag}`}
                >
                  {/* Fila superior: icono + puntos */}
                  <div className={styles.flagTopRow}>
                    <div className={styles.flagIcon}>
                      {isObtained ? '🏁' : '🚩'}
                    </div>
                    <div className={`${styles.flagPoints} ${isObtained ? styles.obtainedPoints : styles.missingPoints}`}>
                      +{flag.points} pts
                    </div>
                  </div>

                  {/* Nombre completo de la flag */}
                  <h4 className={styles.flagName}>{flag.flag_name}</h4>

                  {/* Descripción */}
                  <p className={styles.flagDescription}>{flag.description}</p>

                  {/* Sección de flag completa (solo si está obtenida) */}
                  {isObtained && flag.flag && (
                    <div className={styles.flagValueSection}>
                      <code>{flag.flag}</code>
                    </div>
                  )}

                  {/* Footer con información del usuario y fecha */}
                  <div className={styles.flagFooter}>
                    {isGroupFlag && (
                      <p className={styles.flagSubmitter}>
                        Obtenida por: <strong>{flag.first_name} {flag.last_name}</strong> (@{flag.username})
                      </p>
                    )}
                    {flag.submitted_at && (
                      <div className={styles.flagDate}>
                        {formatTimeAgo(flag.submitted_at)}
                      </div>
                    )}
                  </div>
                  
                  {isObtained && flagData && (
                    <div className={styles.flagMeta}>
                      <div className={styles.flagValue}>
                        <code>{flagData.flag_value}</code>
                      </div>
                      <div className={styles.flagTime}>
                        <span className={styles.timeAgo}>{getTimeAgo(flagData.obtained_at)}</span>
                        <span className={styles.datetime}>
                          {formatDateTime(flagData.obtained_at).date} a las {formatDateTime(flagData.obtained_at).time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFlagsList;