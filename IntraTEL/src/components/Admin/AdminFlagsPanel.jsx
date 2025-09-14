import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import styles from './AdminFlagsPanel.module.css';

const AdminFlagsPanel = () => {
  const { user } = useAuth();
  const [allFlags, setAllFlags] = useState([]);
  const [recentFlags, setRecentFlags] = useState([]);
  const [groupLeaderboard, setGroupLeaderboard] = useState([]);
  const [individualLeaderboard, setIndividualLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAllFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/all'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAllFlags(data.data);
      }
    } catch (error) {
      logError('Error fetching all flags:', error);
    }
  };

  const fetchRecentFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/recent?limit=50'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setRecentFlags(data.data);
      }
    } catch (error) {
      logError('Error fetching recent flags:', error);
    }
  };

  const fetchGroupLeaderboard = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/groups/leaderboard?limit=20'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setGroupLeaderboard(data.data);
      }
    } catch (error) {
      logError('Error fetching group leaderboard:', error);
    }
  };

  const fetchIndividualLeaderboard = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/leaderboard?limit=20'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setIndividualLeaderboard(data.data);
      }
    } catch (error) {
      logError('Error fetching individual leaderboard:', error);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchAllFlags(),
      fetchRecentFlags(),
      fetchGroupLeaderboard(),
      fetchIndividualLeaderboard()
    ]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadInitialData();

    let interval;
    if (autoRefresh) {
      // Actualizar cada 15 segundos cuando el auto-refresh está activo
      interval = setInterval(refreshData, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffSecs < 60) return `Hace ${diffSecs}s`;
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${Math.floor(diffHours / 24)}d`;
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <h2>Acceso Denegado</h2>
          <p>Se requieren permisos de administrador para ver este contenido.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🛡️ Panel de Administración - Flags</h2>
        <div className={styles.controls}>
          <div className={styles.autoRefreshControl}>
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="autoRefresh" className={styles.checkboxLabel}>
              Auto-actualizar (15s)
            </label>
          </div>
          <button
            className={styles.refreshButton}
            onClick={refreshData}
            title="Actualizar datos"
          >
            🔄
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Actividad Reciente ({recentFlags.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'groups' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Ranking Grupos ({groupLeaderboard.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'individual' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          Ranking Individual ({individualLeaderboard.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todas las Flags ({allFlags.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'recent' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>⚡ Actividad en Tiempo Real</h3>
            <div className={styles.flagsFeed}>
              {recentFlags.map((flag, index) => {
                const datetime = formatDateTime(flag.obtained_at);
                return (
                  <div key={`${flag.id}-${index}`} className={styles.flagItem}>
                    <div className={styles.flagIcon}>🏁</div>
                    <div className={styles.flagContent}>
                      <div className={styles.flagMain}>
                        <span className={styles.username}>
                          {flag.first_name} {flag.last_name}
                        </span>
                        <span className={styles.flagName}>{flag.flag_name}</span>
                        {flag.group_name && (
                          <span className={styles.groupBadge}>{flag.group_name}</span>
                        )}
                      </div>
                      <div className={styles.flagMeta}>
                        <span className={styles.points}>+{flag.points} pts</span>
                        <span className={styles.timestamp}>
                          {getTimeAgo(flag.obtained_at)} - {datetime.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🏆 Ranking de Grupos</h3>
            <div className={styles.leaderboard}>
              {groupLeaderboard.map((group, index) => (
                <div key={group.id} className={styles.leaderboardItem}>
                  <div className={styles.rank}>{getRankIcon(index + 1)}</div>
                  <div className={styles.leaderboardContent}>
                    <div className={styles.name}>{group.group_name}</div>
                    <div className={styles.details}>
                      Código: {group.group_code} | 
                      {group.active_members}/{group.total_members} miembros activos
                    </div>
                  </div>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{group.total_flags}</span>
                      <span className={styles.statLabel}>Flags</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{group.total_points}</span>
                      <span className={styles.statLabel}>Puntos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'individual' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>👑 Ranking Individual</h3>
            <div className={styles.leaderboard}>
              {individualLeaderboard.map((user, index) => (
                <div key={user.id} className={styles.leaderboardItem}>
                  <div className={styles.rank}>{getRankIcon(index + 1)}</div>
                  <div className={styles.leaderboardContent}>
                    <div className={styles.name}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div className={styles.details}>
                      @{user.username}
                      {user.group_name && ` | Grupo: ${user.group_name}`}
                    </div>
                  </div>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{user.total_flags}</span>
                      <span className={styles.statLabel}>Flags</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{user.total_points}</span>
                      <span className={styles.statLabel}>Puntos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📋 Todas las Flags Obtenidas</h3>
            <div className={styles.allFlagsTable}>
              <div className={styles.tableHeader}>
                <div>Usuario</div>
                <div>Flag</div>
                <div>Grupo</div>
                <div>Puntos</div>
                <div>Fecha</div>
              </div>
              {allFlags.map((flag, index) => {
                const datetime = formatDateTime(flag.obtained_at);
                return (
                  <div key={`${flag.id}-${index}`} className={styles.tableRow}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {flag.first_name} {flag.last_name}
                      </div>
                      <div className={styles.userDetails}>@{flag.username}</div>
                    </div>
                    <div className={styles.flagInfo}>
                      <div className={styles.flagName}>{flag.flag_name}</div>
                      <div className={styles.flagValue}>{flag.flag_value}</div>
                    </div>
                    <div className={styles.groupInfo}>
                      {flag.group_name || 'Sin grupo'}
                    </div>
                    <div className={styles.points}>+{flag.points}</div>
                    <div className={styles.dateInfo}>
                      <div className={styles.date}>{datetime.date}</div>
                      <div className={styles.time}>{datetime.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlagsPanel;
