import React from 'react';
import { useAuth } from '../context/AuthContext';
import WelcomePage from './WelcomePage';
import LandingPage from './LandingPage';

const HomePage = () => {
  const { isAuthenticated, loading } = useAuth();

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

  return isAuthenticated ? <WelcomePage /> : <LandingPage />;
};

export default HomePage;
