import React, { useState, useEffect } from 'react';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import styles from './GroupLeaderboard.module.css';

const GroupLeaderboard = () => {
  const [groups, setGroups] = useState([]);
  const [recentFlags, setRecentFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');

  const fetchGroupLeaderboard = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/groups/leaderboard?limit=15'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.data);
      } else {
        console.error('Error al obtener ranking de grupos');
      }
    } catch (error) {
      logError('Error fetching group leaderboard:', error);
    }
  };

  const fetchRecentFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/recent?limit=30'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setRecentFlags(data.data);
      } else {
        console.error('Error al obtener flags recientes');
      }
    } catch (error) {
      logError('Error fetching recent flags:', error);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchGroupLeaderboard(), fetchRecentFlags()]);
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
  }, []);

  const formatTimeAgo = (dateString) => {
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

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getRankColor = (position) => {
    switch (position) {
      case 1: return styles.gold;
      case 2: return styles.silver;
      case 3: return styles.bronze;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🏆 Dashboard de Equipos</h2>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Ranking de Grupos
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'activity' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Actividad Reciente
          </button>
        </div>
        <button
          className={styles.refreshButton}
          onClick={refreshData}
          title="Actualizar datos"
        >
          🔄
        </button>
      </div>

      {activeTab === 'leaderboard' && (
        <div className={styles.leaderboardSection}>
          <div className={styles.sectionHeader}>
            <h3>🎯 Ranking por Puntos</h3>
            <p className={styles.subtitle}>
              Los equipos con más flags obtenidas y puntos acumulados
            </p>
          </div>
          
          <div className={styles.groupsGrid}>
            {groups.map((group, index) => (
              <div 
                key={group.id} 
                className={`${styles.groupCard} ${getRankColor(index + 1)}`}
              >
                <div className={styles.rankBadge}>
                  {getRankIcon(index + 1)}
                </div>
                
                <div className={styles.groupInfo}>
                  <h4 className={styles.groupName}>{group.group_name}</h4>
                  <p className={styles.groupCode}>Código: {group.group_code}</p>
                </div>
                
                <div className={styles.groupStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{group.total_flags}</span>
                    <span className={styles.statLabel}>Flags</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{group.total_points}</span>
                    <span className={styles.statLabel}>Puntos</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{group.active_members}/{group.total_members}</span>
                    <span className={styles.statLabel}>Activos</span>
                  </div>
                </div>
                
                <div className={styles.participationBar}>
                  <div 
                    className={styles.participationFill}
                    style={{ width: `${group.participation_rate}%` }}
                  ></div>
                  <span className={styles.participationText}>
                    {group.participation_rate}% participación
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h3>⚡ Actividad en Tiempo Real</h3>
            <p className={styles.subtitle}>
              Las últimas flags obtenidas por todos los equipos
            </p>
          </div>
          
          <div className={styles.activityFeed}>
            {recentFlags.map((flag, index) => (
              <div key={`${flag.id}-${index}`} className={styles.activityItem}>
                <div className={styles.activityIcon}>🏁</div>
                
                <div className={styles.activityContent}>
                  <div className={styles.activityMain}>
                    <span className={styles.username}>
                      {flag.first_name} {flag.last_name}
                    </span>
                    <span className={styles.activityText}>obtuvo</span>
                    <span className={styles.flagName}>{flag.flag_name}</span>
                    {flag.group_name && (
                      <>
                        <span className={styles.activityText}>para</span>
                        <span className={styles.groupName}>{flag.group_name}</span>
                      </>
                    )}
                  </div>
                  
                  <div className={styles.activityMeta}>
                    <span className={styles.points}>+{flag.points} pts</span>
                    <span className={styles.timestamp}>
                      {formatTimeAgo(flag.obtained_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {recentFlags.length === 0 && (
              <div className={styles.emptyState}>
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupLeaderboard;
