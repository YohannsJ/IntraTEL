import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const DataContext = createContext();

// Hook personalizado para usar el contexto
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

// Proveedor del contexto
export const DataProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    
    if (savedUser && savedLoginStatus === 'true') {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Función para hacer login
  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
  };

  // Función para hacer logout
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  };

  // Función para registrar un nuevo usuario
  const register = (userData) => {
    // En una app real, aquí harías una llamada a la API
    // Por ahora, simplemente guardamos los datos localmente
    const newUser = {
      ...userData,
      id: Date.now(), // ID temporal
      createdAt: new Date().toISOString()
    };
    
    login(newUser);
    return newUser;
  };

  const value = {
    isLoggedIn,
    user,
    isRefreshing,
    setIsRefreshing,
    login,
    logout,
    register
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};