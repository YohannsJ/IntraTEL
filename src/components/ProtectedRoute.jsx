import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../components/Auth/AuthPage';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--theme-background)',
        color: 'var(--theme-text)'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--theme-background)',
        color: 'var(--theme-text)',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Rol requerido: {requiredRole}</p>
        <p>Tu rol actual: {user.role}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
