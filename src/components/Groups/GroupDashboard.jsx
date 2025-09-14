import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Groups.module.css';

const GroupDashboard = () => {
  const { user, apiCall } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError('');

      if (user.role === 'admin') {
        // Admin puede ver todos los grupos
        const response = await apiCall('/groups/all');
        setGroups(response.data.groups);
      } else if (user.role === 'teacher') {
        // Teacher puede ver sus grupos administrados
        const response = await apiCall('/groups/my-groups');
        setGroups(response.data.groups);
      } else {
        // Student puede ver su grupo actual
        if (user.group_id) {
          const response = await apiCall(`/groups/${user.group_id}`);
          setGroups([response.data.group]);
          setSelectedGroup(response.data.group);
        } else {
          setGroups([]);
        }
      }
    } catch (err) {
      setError('Error cargando grupos: ' + err.message);
      console.error('Error cargando grupos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (groupId) => {
    try {
      const response = await apiCall(`/groups/${groupId}`);
      setSelectedGroup(response.data.group);
    } catch (err) {
      setError('Error cargando detalles del grupo: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando grupos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Grupos</h1>
        {['admin', 'teacher'].includes(user.role) && (
          <button
            onClick={() => setShowCreateForm(true)}
            className={styles.createButton}
          >
            Crear Grupo
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')} className={styles.closeError}>×</button>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>
            {user.role === 'admin' ? 'Todos los Grupos' : 
             user.role === 'teacher' ? 'Mis Grupos' : 'Mi Grupo'}
          </h3>
          
          {groups.length === 0 ? (
            <div className={styles.noGroups}>
              {user.role === 'student' ? 
                'No perteneces a ningún grupo aún.' :
                'No has creado ningún grupo aún.'
              }
            </div>
          ) : (
            <div className={styles.groupList}>
              {groups.map(group => (
                <div
                  key={group.id}
                  className={`${styles.groupItem} ${
                    selectedGroup?.id === group.id ? styles.groupItemActive : ''
                  }`}
                  onClick={() => handleGroupSelect(group.id)}
                >
                  <div className={styles.groupItemHeader}>
                    <h4 className={styles.groupItemName}>{group.name}</h4>
                    <span className={styles.groupCode}>{group.code}</span>
                  </div>
                  <div className={styles.groupItemInfo}>
                    <span className={styles.memberCount}>
                      {group.member_count || group.members?.length || 0} miembros
                    </span>
                    {group.admin_username && (
                      <span className={styles.adminInfo}>
                        Admin: {group.admin_username}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.mainContent}>
          {selectedGroup ? (
            <GroupDetails 
              group={selectedGroup} 
              user={user}
              onGroupUpdate={loadGroups}
              apiCall={apiCall}
            />
          ) : (
            <div className={styles.noSelection}>
              <h3>Selecciona un grupo para ver los detalles</h3>
              <p>Escoge un grupo de la lista para ver información detallada, miembros y estadísticas.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <CreateGroupModal
          onClose={() => setShowCreateForm(false)}
          onGroupCreated={loadGroups}
          apiCall={apiCall}
        />
      )}
    </div>
  );
};

// Componente para mostrar detalles del grupo
const GroupDetails = ({ group, user, onGroupUpdate, apiCall }) => {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: group.name,
    description: group.description || ''
  });

  const isAdmin = group.admin_id === user.id || user.role === 'admin';

  const handleSaveEdit = async () => {
    try {
      await apiCall(`/groups/${group.id}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      setEditing(false);
      onGroupUpdate();
    } catch (err) {
      alert('Error actualizando grupo: ' + err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres remover este miembro?')) return;

    try {
      await apiCall(`/groups/${group.id}/members/${userId}`, {
        method: 'DELETE'
      });
      onGroupUpdate();
    } catch (err) {
      alert('Error removiendo miembro: ' + err.message);
    }
  };

  return (
    <div className={styles.groupDetails}>
      <div className={styles.groupHeader}>
        {editing ? (
          <div className={styles.editForm}>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className={styles.editInput}
              placeholder="Nombre del grupo"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className={styles.editTextarea}
              placeholder="Descripción del grupo"
              rows={3}
            />
            <div className={styles.editActions}>
              <button onClick={handleSaveEdit} className={styles.saveButton}>
                Guardar
              </button>
              <button onClick={() => setEditing(false)} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.groupInfo}>
              <h2 className={styles.groupName}>{group.name}</h2>
              <p className={styles.groupDescription}>
                {group.description || 'Sin descripción'}
              </p>
              <div className={styles.groupMeta}>
                <span className={styles.groupCodeDisplay}>
                  Código: <strong>{group.code}</strong>
                </span>
                <span className={styles.groupAdmin}>
                  Admin: {group.admin_first_name} {group.admin_last_name}
                </span>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className={styles.editButton}
              >
                Editar
              </button>
            )}
          </>
        )}
      </div>

      {group.stats && (
        <div className={styles.groupStats}>
          <h3>Estadísticas del Grupo</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Miembros</span>
              <span className={styles.statValue}>{group.stats.totalMembers}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Jugadores Activos</span>
              <span className={styles.statValue}>{group.stats.activePlayers}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Progreso Promedio</span>
              <span className={styles.statValue}>{group.stats.averageProgress}%</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.membersSection}>
        <h3>Miembros del Grupo ({group.members?.length || 0})</h3>
        
        {group.members && group.members.length > 0 ? (
          <div className={styles.membersList}>
            {group.members.map(member => (
              <div key={member.id} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>
                    {member.first_name} {member.last_name}
                  </div>
                  <div className={styles.memberDetails}>
                    <span className={styles.memberUsername}>@{member.username}</span>
                    <span className={styles.memberEmail}>{member.email}</span>
                    <span className={`${styles.memberRole} ${styles[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                
                {isAdmin && member.id !== group.admin_id && (
                  <div className={styles.memberActions}>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className={styles.removeButton}
                      title="Remover del grupo"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noMembers}>
            No hay miembros en este grupo.
          </div>
        )}
      </div>
    </div>
  );
};

// Modal para crear nuevo grupo
const CreateGroupModal = ({ onClose, onGroupCreated, apiCall }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre del grupo es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiCall('/groups', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      onGroupCreated();
      onClose();
    } catch (err) {
      setError('Error creando grupo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Crear Nuevo Grupo</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.modalError}>{error}</div>
          )}

          <div className={styles.formGroup}>
            <label>Nombre del Grupo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Telecomunicaciones 2024-1"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descripción (Opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del grupo..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelModalButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.createModalButton}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupDashboard;
