import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './layouts/LandingPage.jsx';
import NandGame from './components/Games/G1/NAND_Layouts.jsx';
import NotFoundPage from './layouts/404.jsx';
import Auth from './layouts/Auth.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TemploTelematica } from './components/Pilar/PilarTelematica.js';
import HomeHero from './layouts/TemploTEL.js';
import AuthPage from './components/Auth/AuthPage.jsx';
import GroupDashboard from './components/Groups/GroupDashboard.jsx';
import GroupLeaderboard from './components/Groups/GroupLeaderboard.jsx';
import UserFlagsList from './components/Flags/UserFlagsList.jsx';
import AdminFlagsPanel from './components/Admin/AdminFlagsPanel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import UserProfile from './components/Profile/UserProfile.jsx';
import AdminPanel from './components/Admin/AdminPanel.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'NandGame', element: <NandGame /> },
      { 
        path: 'grupos', 
        element: (
          <ProtectedRoute>
            <GroupDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'ranking', 
        element: (
          <ProtectedRoute>
            <GroupLeaderboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'mis-flags', 
        element: (
          <ProtectedRoute>
            <UserFlagsList />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin/flags', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminFlagsPanel />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'perfil', 
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        ) 
      },
      // { path: 'Templo', element: <TemploTelematica /> },
      { path: 'Templo', element: <HomeHero /> },
      // { path: 'devices/:deviceId/trips/:tripId', element: <TripDetailPage /> },
      // { path: 'summary', element: <DailySummaryPage /> }, // <-- AÑADIR ESTA LÍNEA
      { path: '*', element: <NotFoundPage /> }, // Ruta para manejar 404
    ],
  },
  {
    path: '/legacy-auth',
    element: <Auth />,
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
{/* <Link path="/*" element={<NotFoundPage />} /> */}
    
  </React.StrictMode>
);

