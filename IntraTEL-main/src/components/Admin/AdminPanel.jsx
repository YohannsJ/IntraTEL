import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, log, logError, config } from '../../config';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    dashboard: null,
    users: [],
    usersPagination: null,
    selectedUser: null,
    flags: [],
    userFlags: []
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1
  });
  const [editingUser, setEditingUser] = useState(null);
  const [newFlag, setNewFlag] = useState({
    flagName: '',
    flagValue: '',
    description: '',
    points: config.DEFAULT_FLAG_POINTS || 10 // Valor por defecto como fallback
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        await loadDashboard();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'flags') {
        await loadFlags();
      } else if (activeTab === 'user-flags') {
        await loadUserFlags();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch(getApiUrl('/auth/admin/dashboard'), {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({ ...prev, dashboard: result.data }));
        log('Dashboard data loaded successfully');
      }
    } catch (error) {
      logError('Error loading dashboard:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: config.ITEMS_PER_PAGE,
        search: filters.search,
        role: filters.role
      });

      const response = await fetch(getApiUrl(`/auth/admin/users?${params}`), {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({ 
          ...prev, 
          users: result.data.users,
          usersPagination: result.data.pagination
        }));
        log(`Loaded ${result.data.users.length} users`);
      }
    } catch (error) {
      logError('Error loading users:', error);
    }
  };

  const loadFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/available'), {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({ ...prev, flags: result.data }));
        log(`Loaded ${result.data.length} flags`);
      }
    } catch (error) {
      logError('Error loading flags:', error);
    }
  };

  const loadUserFlags = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/all'), {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({ ...prev, userFlags: result.data }));
        log(`Loaded ${result.data.length} user flags`);
      }
    } catch (error) {
      logError('Error loading user flags:', error);
    }
  };

  const loadUserDetails = async (userId) => {
    try {
      const response = await fetch(getApiUrl(`/auth/admin/users/${userId}`), {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({ ...prev, selectedUser: result.data }));
        log(`Loaded details for user ${userId}`);
      }
    } catch (error) {
      logError('Error loading user details:', error);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await fetch(getApiUrl(`/auth/admin/users/${userId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      
      if (result.success) {
        await loadUsers(); // Recargar lista
        if (data.selectedUser?.user.id === userId) {
          await loadUserDetails(userId); // Recargar detalles
        }
        log(`User ${userId} updated successfully`);
        return { success: true };
      } else {
        logError('Error updating user:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      logError('Error updating user:', error);
      return { success: false, message: 'Error al actualizar usuario' };
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/auth/admin/users/${userId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        await loadUsers();
        setData(prev => ({ ...prev, selectedUser: null }));
        log(`User ${userId} deleted successfully`);
        alert('Usuario eliminado exitosamente');
      } else {
        alert(result.message);
      }
    } catch (error) {
      logError('Error deleting user:', error);
      alert('Error al eliminar usuario');
    }
  };

  const createFlag = async () => {
    try {
      const response = await fetch(getApiUrl('/flags/admin/create'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newFlag)
      });
      const result = await response.json();
      
      if (result.success) {
        await loadFlags();
        setNewFlag({
          flagName: '',
          flagValue: '',
          description: '',
          points: config.DEFAULT_FLAG_POINTS || 10
        });
        log('Flag created successfully');
        alert('Flag creada exitosamente');
        return { success: true };
      } else {
        logError('Error creating flag:', result.message);
        alert(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      logError('Error creating flag:', error);
      alert('Error al crear flag');
      return { success: false, message: 'Error al crear flag' };
    }
  };

  const assignGroupToUser = async (userId, groupId) => {
    try {
      const response = await fetch(getApiUrl(`/auth/admin/users/${userId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ groupId })
      });
      const result = await response.json();
      
      if (result.success) {
        await loadUsers();
        if (data.selectedUser?.user.id === userId) {
          await loadUserDetails(userId);
        }
        log(`Group assigned to user ${userId}`);
        alert('Grupo asignado exitosamente');
        return { success: true };
      } else {
        logError('Error assigning group:', result.message);
        alert(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      logError('Error assigning group:', error);
      alert('Error al asignar grupo');
      return { success: false, message: 'Error al asignar grupo' };
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className={styles.accessDenied}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      <div className={styles.header}>
        <h1>Panel de Administración</h1>
        <p>Gestión de usuarios y estadísticas del sistema</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuarios
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'flags' ? styles.active : ''}`}
          onClick={() => setActiveTab('flags')}
        >
          🚩 Flags
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'user-flags' ? styles.active : ''}`}
          onClick={() => setActiveTab('user-flags')}
        >
          🏆 Flags de Usuarios
        </button>
      </div>

      {loading && <div className={styles.loading}>Cargando...</div>}

      {activeTab === 'dashboard' && data.dashboard && (
        <DashboardContent dashboard={data.dashboard} />
      )}

      {activeTab === 'users' && (
        <UsersContent 
          users={data.users}
          pagination={data.usersPagination}
          selectedUser={data.selectedUser}
          filters={filters}
          setFilters={setFilters}
          onUserSelect={loadUserDetails}
          onUserUpdate={updateUser}
          onUserDelete={deleteUser}
          onAssignGroup={assignGroupToUser}
        />
      )}

      {activeTab === 'flags' && (
        <FlagsContent 
          flags={data.flags}
          newFlag={newFlag}
          setNewFlag={setNewFlag}
          onCreateFlag={createFlag}
        />
      )}

      {activeTab === 'user-flags' && (
        <UserFlagsContent 
          userFlags={data.userFlags}
        />
      )}
    </div>
  );
};

// Componente Dashboard
const DashboardContent = ({ dashboard }) => (
  <div className={styles.dashboardContent}>
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <h3>Total Usuarios</h3>
        <span className={styles.statNumber}>{dashboard.statistics.totalUsers}</span>
      </div>
      <div className={styles.statCard}>
        <h3>Usuarios Activos</h3>
        <span className={styles.statNumber}>{dashboard.statistics.activeUsers}</span>
      </div>
      <div className={styles.statCard}>
        <h3>Total Grupos</h3>
        <span className={styles.statNumber}>{dashboard.statistics.totalGroups}</span>
      </div>
      <div className={styles.statCard}>
        <h3>Juegos Completados</h3>
        <span className={styles.statNumber}>{dashboard.statistics.gameStats.completedGames}</span>
      </div>
    </div>

    <div className={styles.chartsGrid}>
      <div className={styles.chartCard}>
        <h3>Usuarios por Rol</h3>
        <div className={styles.rolesList}>
          {dashboard.statistics.usersByRole.map(role => (
            <div key={role.role} className={styles.roleItem}>
              <span className={styles.roleName}>{role.role}</span>
              <span className={styles.roleCount}>{role.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3>Actividad Reciente</h3>
        <div className={styles.recentUsers}>
          {dashboard.recentActivity.recentUsers.slice(0, 5).map(user => (
            <div key={user.id} className={styles.recentUser}>
              <div className={styles.userAvatar}>
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.first_name} {user.last_name}</span>
                <span className={styles.userDate}>
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Componente Usuarios
const UsersContent = ({ 
  users, 
  pagination, 
  selectedUser, 
  filters, 
  setFilters, 
  onUserSelect, 
  onUserUpdate, 
  onUserDelete 
}) => {
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active
    });
  };

  const handleSave = async (userId) => {
    const result = await onUserUpdate(userId, {
      username: editForm.username,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      role: editForm.role,
      isActive: editForm.isActive
    });

    if (result.success) {
      setEditingUser(null);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className={styles.usersContent}>
      <div className={styles.userFilters}>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className={styles.searchInput}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
          className={styles.roleFilter}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="teacher">Profesor</option>
          <option value="student">Estudiante</option>
        </select>
      </div>

      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Grupo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                      {editingUser === user.id ? (
                        <div className={styles.editFields}>
                          <input
                            type="text"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Nombre"
                          />
                          <input
                            type="text"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Apellido"
                          />
                        </div>
                      ) : (
                        <>
                          <div className={styles.userName}>{user.first_name} {user.last_name}</div>
                          <div className={styles.userUsername}>@{user.username}</div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  {editingUser === user.id ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="student">Estudiante</option>
                      <option value="teacher">Profesor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td>{user.group_name || 'Sin grupo'}</td>
                <td>
                  {editingUser === user.id ? (
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  ) : (
                    <span className={`${styles.status} ${user.is_active ? styles.active : styles.inactive}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    {editingUser === user.id ? (
                      <>
                        <button
                          onClick={() => handleSave(user.id)}
                          className={styles.saveBtn}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className={styles.cancelBtn}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onUserSelect(user.id)}
                          className={styles.viewBtn}
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className={styles.editBtn}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onUserDelete(user.id)}
                          className={styles.deleteBtn}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className={styles.pagination}>
          <span>
            Página {pagination.page} de {pagination.totalPages} 
            ({pagination.total} usuarios)
          </span>
          <div className={styles.paginationButtons}>
            <button
              disabled={pagination.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para gestionar flags
const FlagsContent = ({ flags, newFlag, setNewFlag, onCreateFlag }) => (
  <div className={styles.flagsContent}>
    <div className={styles.createFlagSection}>
      <h3>Crear Nueva Flag</h3>
      <div className={styles.flagForm}>
        <div className={styles.formGroup}>
          <label>Nombre de la Flag</label>
          <input
            type="text"
            value={newFlag.flagName}
            onChange={(e) => setNewFlag(prev => ({ ...prev, flagName: e.target.value }))}
            placeholder="Ej: Primera Victoria"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Valor de la Flag</label>
          <input
            type="text"
            value={newFlag.flagValue}
            onChange={(e) => setNewFlag(prev => ({ ...prev, flagValue: e.target.value }))}
            placeholder="Ej: INTRATEL{first_win_123}"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Descripción</label>
          <textarea
            value={newFlag.description}
            onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción de cómo obtener esta flag"
            rows={3}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Puntos</label>
          <input
            type="number"
            value={newFlag.points}
            onChange={(e) => setNewFlag(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
            min="1"
            max="1000"
          />
        </div>
        <button
          onClick={onCreateFlag}
          className={styles.createButton}
          disabled={!newFlag.flagName || !newFlag.flagValue}
        >
          Crear Flag
        </button>
      </div>
    </div>

    <div className={styles.flagsList}>
      <h3>Flags Disponibles ({flags?.length || 0})</h3>
      <div className={styles.flagsGrid}>
        {flags?.map(flag => (
          <div key={flag.id} className={styles.flagCard}>
            <div className={styles.flagHeader}>
              <h4>{flag.flag_name}</h4>
              <span className={styles.flagPoints}>+{flag.points} pts</span>
            </div>
            <p className={styles.flagDescription}>{flag.description}</p>
            <div className={styles.flagValue}>
              <strong>Valor:</strong>
              <code>{flag.flag_value}</code>
            </div>
            <div className={styles.flagMeta}>
              <small>Creada: {new Date(flag.created_at).toLocaleDateString()}</small>
              <small>Estado: {flag.is_active ? '✅ Activa' : '❌ Inactiva'}</small>
            </div>
          </div>
        ))}
        {(!flags || flags.length === 0) && (
          <div className={styles.emptyState}>
            <p>No hay flags disponibles</p>
            <small>Crea la primera flag usando el formulario de arriba</small>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Componente para ver flags de usuarios
const UserFlagsContent = ({ userFlags }) => (
  <div className={styles.userFlagsContent}>
    <h3>Flags Obtenidas por Usuarios ({userFlags?.length || 0})</h3>
    
    <div className={styles.userFlagsTable}>
      {userFlags?.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Grupo</th>
              <th>Flag</th>
              <th>Puntos</th>
              <th>Fecha Obtenida</th>
            </tr>
          </thead>
          <tbody>
            {userFlags.map(userFlag => (
              <tr key={userFlag.id}>
                <td>
                  <div className={styles.userInfo}>
                    <strong>{userFlag.first_name} {userFlag.last_name}</strong>
                    <small>@{userFlag.username}</small>
                  </div>
                </td>
                <td>{userFlag.group_name || 'Sin grupo'}</td>
                <td>
                  <div className={styles.flagInfo}>
                    <strong>{userFlag.flag_name}</strong>
                    <small>{userFlag.description}</small>
                  </div>
                </td>
                <td className={styles.points}>+{userFlag.points}</td>
                <td>{new Date(userFlag.obtained_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.emptyState}>
          <p>No hay flags obtenidas por usuarios aún</p>
          <small>Las flags aparecerán aquí cuando los usuarios las envíen</small>
        </div>
      )}
    </div>
  </div>
);

export default AdminPanel;
