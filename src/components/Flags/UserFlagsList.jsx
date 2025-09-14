import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import styles from './UserFlagsList.module.css';

const UserFlagsList = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState([]);
  const [groupFlags, setGroupFlags] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  const fetchUserFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/user'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setFlags(data.data);
      }
    } catch (error) {
      logError('Error fetching user flags:', error);
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
    if (user?.group_id) {
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
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchUserFlags(),
      fetchUserStats(),
      fetchGroupFlags()
    ]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadInitialData();

    // Actualizar cada 30 segundos
    const interval = setInterval(refreshData, 30000);

    return () => clearInterval(interval);
  }, [user?.group_id]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

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
      <div className={styles.header}>
        <h2 className={styles.title}>🏁 Mis Flags</h2>
        <button
          className={styles.refreshButton}
          onClick={refreshData}
          title="Actualizar"
        >
          🔄
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalFlags || 0}</div>
          <div className={styles.statLabel}>Flags Obtenidas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalPoints || 0}</div>
          <div className={styles.statLabel}>Puntos Totales</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.daysActive || 0}</div>
          <div className={styles.statLabel}>Días Activo</div>
        </div>
      </div>

      {user?.group_id && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'personal' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Mis Flags ({flags.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'group' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('group')}
          >
            Flags del Equipo ({groupFlags.length})
          </button>
        </div>
      )}

      <div className={styles.flagsSection}>
        {activeTab === 'personal' && (
          <div className={styles.flagsList}>
            {flags.length === 0 ? (
              <div className={styles.emptyState}>
                <p>🎯 ¡Aún no has obtenido ninguna flag!</p>
                <p>Explora los juegos y desafíos para encontrar flags escondidas.</p>
              </div>
            ) : (
              flags.map((flag, index) => {
                const datetime = formatDateTime(flag.obtained_at);
                return (
                  <div key={flag.id} className={styles.flagCard}>
                    <div className={styles.flagHeader}>
                      <div className={styles.flagIcon}>🏁</div>
                      <div className={styles.flagInfo}>
                        <h4 className={styles.flagName}>{flag.flag_name}</h4>
                        <p className={styles.flagDescription}>{flag.description}</p>
                      </div>
                      <div className={styles.flagPoints}>+{flag.points}</div>
                    </div>
                    
                    <div className={styles.flagMeta}>
                      <div className={styles.flagValue}>
                        <code>{flag.flag_value}</code>
                      </div>
                      <div className={styles.flagTime}>
                        <span className={styles.timeAgo}>{getTimeAgo(flag.obtained_at)}</span>
                        <span className={styles.datetime}>
                          {datetime.date} a las {datetime.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'group' && user?.group_id && (
          <div className={styles.flagsList}>
            {groupFlags.length === 0 ? (
              <div className={styles.emptyState}>
                <p>🎯 Tu equipo aún no ha obtenido ninguna flag!</p>
                <p>Trabajen juntos para encontrar y resolver los desafíos.</p>
              </div>
            ) : (
              groupFlags.map((flag, index) => {
                const datetime = formatDateTime(flag.obtained_at);
                const isOwnFlag = flag.username === user.username;
                
                return (
                  <div 
                    key={`${flag.flag_id}-${index}`} 
                    className={`${styles.flagCard} ${isOwnFlag ? styles.ownFlag : ''}`}
                  >
                    <div className={styles.flagHeader}>
                      <div className={styles.flagIcon}>
                        {isOwnFlag ? '🎯' : '👥'}
                      </div>
                      <div className={styles.flagInfo}>
                        <h4 className={styles.flagName}>{flag.flag_name}</h4>
                        <p className={styles.flagDescription}>{flag.description}</p>
                        <p className={styles.flagSubmitter}>
                          Obtenida por: <strong>{flag.first_name} {flag.last_name}</strong> (@{flag.username})
                        </p>
                      </div>
                      <div className={styles.flagPoints}>+{flag.points}</div>
                    </div>
                    
                    <div className={styles.flagMeta}>
                      <div className={styles.flagTime}>
                        <span className={styles.timeAgo}>{getTimeAgo(flag.obtained_at)}</span>
                        <span className={styles.datetime}>
                          {datetime.date} a las {datetime.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFlagsList;
