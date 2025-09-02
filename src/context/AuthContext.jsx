import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getAuthHeaders, log, logError, config } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem(config.TOKEN_STORAGE_KEY));

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl('/auth/verify'), {
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          log('Token verificado exitosamente');
        } else {
          localStorage.removeItem(config.TOKEN_STORAGE_KEY);
          setToken(null);
          logError('Token inválido, limpiando sesión');
        }
      } catch (error) {
        logError('Error verificando token:', error);
        localStorage.removeItem(config.TOKEN_STORAGE_KEY);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem(config.TOKEN_STORAGE_KEY, data.data.token);
        log('Login exitoso para:', email);
        return { success: true, user: data.data.user };
      } else {
        logError('Error en login:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      logError('Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem(config.TOKEN_STORAGE_KEY, data.data.token);
        log('Registro exitoso para:', userData.email);
        return { success: true, user: data.data.user };
      } else {
        logError('Error en registro:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      logError('Error en registro:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(config.TOKEN_STORAGE_KEY);
    log('Logout exitoso');
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(getApiUrl('/auth/verify'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      logError('Error verificando autenticación:', error);
      return false;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch(getApiUrl('/auth/profile'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        log('Perfil actualizado exitosamente');
        return { success: true, user: data.data.user };
      } else {
        logError('Error actualizando perfil:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      logError('Error actualizando perfil:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(getApiUrl('/auth/change-password'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        log('Contraseña cambiada exitosamente');
        return { success: true };
      } else {
        logError('Error cambiando contraseña:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      logError('Error cambiando contraseña:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const joinGroup = async (groupCode) => {
    try {
      const response = await fetch(getApiUrl('/groups/join'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ groupCode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refrescar información del usuario
        await checkAuth();
        log('Joined group successfully:', data.data.group.name);
        return { success: true, data: data.data };
      } else {
        logError('Failed to join group:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      logError('Error joining group:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const leaveGroup = async () => {
    try {
      const response = await fetch(getApiUrl('/groups/leave'), {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refrescar información del usuario
        await checkAuth();
        log('Left group successfully');
        return { success: true };
      } else {
        logError('Failed to leave group:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      logError('Error leaving group:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
    
    const requestConfig = {
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, requestConfig);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    joinGroup,
    leaveGroup,
    apiCall,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
