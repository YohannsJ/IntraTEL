import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import styles from './ProgressDashboard.module.css';

const ProgressDashboard = () => {
  const [progressData, setProgressData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, custom
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });
  const isInitialLoad = useRef(true); // Para rastrear la primera carga

  // Paleta de colores variada para cada jugador
  const COLORS = [
    '#FF6B6B', // Rojo vibrante
    '#4ECDC4', // Turquesa
    '#45B7D1', // Azul cielo
    '#FFA07A', // Salmón
    '#98D8C8', // Menta
    '#F7DC6F', // Amarillo dorado
    '#BB8FCE', // Púrpura
    '#85C1E2', // Azul claro
    '#F8B88B', // Naranja claro
    '#AAB7B8', // Gris azulado
    '#FF9FF3', // Rosa brillante
    '#54A0FF', // Azul brillante
    '#48DBFB', // Cyan
    '#1DD1A1', // Verde turquesa
    '#F368E0', // Rosa fucsia
    '#FF9F43', // Naranja
    '#EE5A6F', // Rosa coral
    '#00D2D3', // Cyan oscuro
    '#5F27CD', // Violeta
    '#00B894'  // Verde esmeralda
  ];

  const fetchProgressData = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/progress'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data.data);
        
        // Auto-seleccionar los primeros 5 usuarios SOLO en la primera carga
        if (isInitialLoad.current && data.data.length > 0) {
          const initialSelection = new Set(
            data.data.slice(0, Math.min(5, data.data.length)).map(u => u.userId)
          );
          setSelectedUsers(initialSelection);
          isInitialLoad.current = false; // Marcar que ya no es la primera carga
        }
      }
    } catch (error) {
      logError('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();

    let interval;
    if (autoRefresh) {
      // Actualizar cada 10 segundos
      interval = setInterval(fetchProgressData, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    // Preparar datos para el gráfico
    if (progressData.length === 0 || selectedUsers.size === 0) {
      setChartData([]);
      return;
    }

    // Calcular rango de fechas según el filtro
    const now = new Date();
    let startDate = null;
    let endDate = now;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        if (customDateRange.start) {
          startDate = new Date(customDateRange.start);
        }
        if (customDateRange.end) {
          endDate = new Date(customDateRange.end);
        }
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    // Obtener todos los timestamps únicos de los usuarios seleccionados
    const timestamps = new Set();
    const selectedUserData = progressData.filter(u => selectedUsers.has(u.userId));
    
    selectedUserData.forEach(user => {
      user.progress.forEach(point => {
        const pointDate = new Date(point.timestamp);
        // Filtrar por rango de fechas
        if (startDate && pointDate < startDate) return;
        if (endDate && pointDate > endDate) return;
        timestamps.add(point.timestamp);
      });
    });

    // Ordenar timestamps
    const sortedTimestamps = Array.from(timestamps).sort();

    // Crear datos del gráfico
    const chartPoints = sortedTimestamps.map(timestamp => {
      const point = { timestamp };
      
      selectedUserData.forEach(user => {
        // Encontrar el punto de progreso acumulado hasta este timestamp
        let cumulativePoints = 0;
        let flagInfo = null;
        
        // Buscar en el progreso del usuario
        user.progress.forEach(p => {
          const pDate = new Date(p.timestamp);
          
          // Aplicar filtro de fecha si existe
          if (startDate && pDate < startDate) {
            return;
          }
          if (endDate && pDate > endDate) {
            return;
          }
          
          if (p.timestamp <= timestamp) {
            cumulativePoints = p.points;
            
            // Si este es el punto exacto, guardamos la info de la flag
            if (p.timestamp === timestamp) {
              flagInfo = {
                flagPoints: p.flagPoints,
                flagName: p.flagName,
                timestamp: p.timestamp
              };
            }
          }
        });
        
        point[`user_${user.userId}`] = cumulativePoints;
        point[`user_${user.userId}_name`] = user.fullName;
        
        // Solo agregar info de flag si existe en este punto exacto
        if (flagInfo) {
          point[`user_${user.userId}_flag`] = flagInfo;
        }
      });

      return point;
    });

    setChartData(chartPoints);
  }, [progressData, selectedUsers, dateFilter, customDateRange]);

  const toggleUser = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAll = () => {
    const allUserIds = progressData.map(u => u.userId);
    setSelectedUsers(new Set(allUserIds));
  };

  const clearAll = () => {
    setSelectedUsers(new Set());
  };

  const selectTop = (n) => {
    const topUsers = progressData.slice(0, n).map(u => u.userId);
    setSelectedUsers(new Set(topUsers));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filtrar solo los usuarios que obtuvieron una flag en este punto exacto
      const usersWithFlagsAtThisPoint = [];
      
      payload.forEach(entry => {
        const userId = entry.dataKey.replace('user_', '');
        const flagKey = `user_${userId}_flag`;
        
        // Verificar si este usuario obtuvo una flag en este punto exacto
        if (entry.payload[flagKey]) {
          const user = progressData.find(u => u.userId === parseInt(userId));
          const flagInfo = entry.payload[flagKey];
          
          usersWithFlagsAtThisPoint.push({
            userId: userId,
            userName: user?.fullName || `Usuario ${userId}`,
            points: entry.value,
            flagPoints: flagInfo.flagPoints,
            flagName: flagInfo.flagName,
            color: entry.color
          });
        }
      });

      // Si no hay flags en este punto, no mostrar tooltip
      if (usersWithFlagsAtThisPoint.length === 0) {
        return null;
      }

      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{formatDate(label)}</p>
          {usersWithFlagsAtThisPoint.map((userFlag, index) => (
            <div key={index} className={styles.tooltipEntry}>
              <p style={{ color: userFlag.color, margin: 0, fontWeight: 600 }}>
                {userFlag.userName}: {userFlag.points} pts
              </p>
              <p className={styles.tooltipSubtext}>
                (+{userFlag.flagPoints} pts de "{userFlag.flagName}")
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando dashboard de progreso...</p>
      </div>
    );
  }

  if (progressData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>📊 No hay datos de progreso disponibles</h3>
        <p>Los datos aparecerán cuando los usuarios empiecen a obtener flags.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>📈 Dashboard de Progreso en Tiempo Real</h2>
          <p className={styles.subtitle}>
            Visualiza el progreso acumulado de puntos de cada jugador
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.autoRefreshControl}>
            <input
              type="checkbox"
              id="progressAutoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="progressAutoRefresh" className={styles.checkboxLabel}>
              Auto-actualizar (10s)
            </label>
          </div>
          <button
            className={styles.refreshButton}
            onClick={fetchProgressData}
            title="Actualizar datos"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.quickSelect}>
          <span className={styles.controlLabel}>Selección rápida:</span>
          <button onClick={() => selectTop(5)} className={styles.quickButton}>
            Top 5
          </button>
          <button onClick={() => selectTop(10)} className={styles.quickButton}>
            Top 10
          </button>
          <button onClick={selectAll} className={styles.quickButton}>
            Todos ({progressData.length})
          </button>
          <button onClick={clearAll} className={styles.quickButton}>
            Limpiar
          </button>
        </div>

        <div className={styles.dateFilters}>
          <span className={styles.controlLabel}>Período:</span>
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.dateSelect}
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
          
          {dateFilter === 'custom' && (
            <div className={styles.customDateInputs}>
              <input
                type="date"
                value={customDateRange.start || ''}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={styles.dateInput}
                placeholder="Desde"
              />
              <span>-</span>
              <input
                type="date"
                value={customDateRange.end || ''}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={styles.dateInput}
                placeholder="Hasta"
              />
            </div>
          )}
        </div>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{selectedUsers.size}</strong> jugadores seleccionados
          </span>
          <span className={styles.stat}>
            <strong>{chartData.length}</strong> puntos de datos
          </span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#888"
            />
            <YAxis
              label={{ value: 'Puntos Acumulados', angle: -90, position: 'insideLeft' }}
              stroke="#888"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const userId = parseInt(value.replace('user_', ''));
                const user = progressData.find(u => u.userId === userId);
                return user ? user.fullName : value;
              }}
            />
            {progressData
              .filter(user => selectedUsers.has(user.userId))
              .map((user, index) => (
                <Line
                  key={user.userId}
                  type="monotone"
                  dataKey={`user_${user.userId}`}
                  name={`user_${user.userId}`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.usersList}>
        <h3 className={styles.usersListTitle}>
          Jugadores ({progressData.length})
        </h3>
        <div className={styles.usersGrid}>
          {progressData.map((user, index) => {
            const isSelected = selectedUsers.has(user.userId);
            const totalPoints = user.progress.length > 0
              ? user.progress[user.progress.length - 1].points
              : 0;
            const totalFlags = user.progress.length;

            return (
              <div
                key={user.userId}
                className={`${styles.userCard} ${isSelected ? styles.selected : ''}`}
                onClick={() => toggleUser(user.userId)}
              >
                <div className={styles.userCardHeader}>
                  <div
                    className={styles.colorIndicator}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.fullName}</div>
                    <div className={styles.userUsername}>@{user.username}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUser(user.userId)}
                    className={styles.userCheckbox}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className={styles.userStats}>
                  <div className={styles.userStat}>
                    <span className={styles.statValue}>{totalPoints}</span>
                    <span className={styles.statLabel}>puntos</span>
                  </div>
                  <div className={styles.userStat}>
                    <span className={styles.statValue}>{totalFlags}</span>
                    <span className={styles.statLabel}>flags</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
