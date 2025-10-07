import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import ProgressDashboard from './ProgressDashboard';
import styles from './AdminFlagsPanel.module.css';

const AdminFlagsPanel = () => {
  const { user } = useAuth();
  const [allFlags, setAllFlags] = useState([]);
  const [availableFlags, setAvailableFlags] = useState([]);
  const [recentFlags, setRecentFlags] = useState([]);
  const [groupLeaderboard, setGroupLeaderboard] = useState([]);
  const [individualLeaderboard, setIndividualLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCreateFlag, setShowCreateFlag] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [flagForm, setFlagForm] = useState({
    flagName: '',
    flagValue: '',
    description: '',
    points: 10
  });

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

  const fetchAvailableFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/available'), {
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

  const refreshData = async () => {
    await Promise.all([
      fetchAllFlags(),
      fetchRecentFlags(),
      fetchGroupLeaderboard(),
      fetchIndividualLeaderboard(),
      fetchAvailableFlags()
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

  const handleCreateFlag = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/create'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(flagForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Flag creada exitosamente');
        setShowCreateFlag(false);
        setFlagForm({ flagName: '', flagValue: '', description: '', points: 10 });
        await fetchAvailableFlags();
      } else {
        alert(data.message || 'Error creando flag');
      }
    } catch (error) {
      logError('Error creating flag:', error);
      alert('Error creando flag');
    }
  };

  const handleEditFlag = async () => {
    try {
      const response = await fetch(getApiUrl(`/flags/admin/${editingFlag.id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(flagForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Flag actualizada exitosamente');
        setEditingFlag(null);
        setFlagForm({ flagName: '', flagValue: '', description: '', points: 10 });
        await Promise.all([fetchAvailableFlags(), fetchAllFlags(), fetchRecentFlags()]);
      } else {
        alert(data.message || 'Error actualizando flag');
      }
    } catch (error) {
      logError('Error updating flag:', error);
      alert('Error actualizando flag');
    }
  };

  const handleDeleteFlag = async (flagId, flagName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la flag "${flagName}"?`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/flags/admin/${flagId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        await fetchAvailableFlags();
      } else {
        alert(data.message || 'Error eliminando flag');
      }
    } catch (error) {
      logError('Error deleting flag:', error);
      alert('Error eliminando flag');
    }
  };

  const startEdit = (flag) => {
    setEditingFlag(flag);
    setFlagForm({
      flagName: flag.flag_name,
      flagValue: flag.flag_value,
      description: flag.description || '',
      points: flag.points
    });
  };

  const cancelEdit = () => {
    setEditingFlag(null);
    setShowCreateFlag(false);
    setFlagForm({ flagName: '', flagValue: '', description: '', points: 10 });
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
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard de Progreso
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Actividad Reciente ({recentFlags.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Gestionar Flags ({availableFlags.length})
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
        {activeTab === 'dashboard' && (
          <div className={styles.section}>
            <ProgressDashboard />
          </div>
        )}

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

        {activeTab === 'available' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>⚙️ Gestionar Flags Disponibles</h3>
              <button
                className={styles.createButton}
                onClick={() => setShowCreateFlag(true)}
              >
                ➕ Nueva Flag
              </button>
            </div>

            {(showCreateFlag || editingFlag) && (
              <div className={styles.flagForm}>
                <h4>{editingFlag ? 'Editar Flag' : 'Crear Nueva Flag'}</h4>
                <div className={styles.formGroup}>
                  <label>Nombre de la Flag:</label>
                  <input
                    type="text"
                    value={flagForm.flagName}
                    onChange={(e) => setFlagForm({ ...flagForm, flagName: e.target.value })}
                    placeholder="Ej: Flag de SQL Injection"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Valor de la Flag:</label>
                  <input
                    type="text"
                    value={flagForm.flagValue}
                    onChange={(e) => setFlagForm({ ...flagForm, flagValue: e.target.value })}
                    placeholder="Ej: FLAG{sql_injection_found}"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descripción:</label>
                  <textarea
                    value={flagForm.description}
                    onChange={(e) => setFlagForm({ ...flagForm, description: e.target.value })}
                    placeholder="Descripción de la flag..."
                    rows="3"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Puntos:</label>
                  <input
                    type="number"
                    value={flagForm.points}
                    onChange={(e) => setFlagForm({ ...flagForm, points: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="100"
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    className={styles.submitButton}
                    onClick={editingFlag ? handleEditFlag : handleCreateFlag}
                  >
                    {editingFlag ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className={styles.flagsList}>
              {availableFlags.map((flag) => (
                <div key={flag.id} className={styles.flagCard}>
                  <div className={styles.flagHeader}>
                    <h4 className={styles.flagTitle}>{flag.flag_name}</h4>
                    <div className={styles.flagActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => startEdit(flag)}
                        title="Editar flag"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteFlag(flag.id, flag.flag_name)}
                        title="Eliminar flag"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className={styles.flagDetails}>
                    <div className={styles.flagValue}>
                      <strong>Valor:</strong> <code>{flag.flag_value}</code>
                    </div>
                    {flag.description && (
                      <div className={styles.flagDescription}>
                        <strong>Descripción:</strong> {flag.description}
                      </div>
                    )}
                    <div className={styles.flagMeta}>
                      <span className={styles.flagPoints}>
                        <strong>Puntos:</strong> {flag.points}
                      </span>
                      <span className={styles.flagCreated}>
                        <strong>Creada:</strong> {formatDateTime(flag.created_at).date}
                      </span>
                      <span className={styles.flagStatus}>
                        <strong>Estado:</strong> {flag.is_active ? '✅ Activa' : '❌ Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
