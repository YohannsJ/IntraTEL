import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/LogoTEL.png'
import './App.css'
import {PilarTelematica} from "./components/Pilar/PilarTelematica";
import HomeHero from "./layouts/TemploTEL";
import { Link, Outlet } from 'react-router-dom';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from './components/etc/ThemeToggle';
import FlagSubmitter from './components/Flags/FlagSubmitter';
import styles from './App.module.css';
// import ThemeContext from './context/ThemeContext';
import { useTheme } from './context/ThemeContext.jsx';
// Creamos un componente interno para que pueda acceder a los contextos
const AppLayout = () => {
  const { isRefreshing } = useData(); // Mantenemos el estado de refresh del DataContext
  const { user, logout, isAuthenticated } = useAuth(); // Usamos el nuevo AuthContext

  const handleLogout = () => {
    logout();
  };
// console.log(ThemeContext.Consumer.);
// Quiero saber si es tema oscuro o claro
// console.log(useTheme().currentTheme);
  return (
    <div className={styles.appContainer}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}><img src={`intratel-logo-${useTheme().currentTheme}.svg`} alt="" /></Link>
        <div className={styles.navLinks}>
          {/* <Link to="/" className={styles.navLink}>Inicio</Link> */}
          <Link to="/NandGame" className={styles.navLink}>NandGame</Link>
          <Link to="/Templo" className={styles.navLink}>Templo</Link>
          {isAuthenticated && (
            <>
              <Link to="/grupos" className={styles.navLink}>Grupos</Link>
              <Link to="/ranking" className={styles.navLink}>🏆 Ranking</Link>
              <Link to="/mis-flags" className={styles.navLink}>🏁 Mis Flags</Link>
              {/* <Link to="/perfil" className={styles.navLink}>Mi Perfil</Link> */}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className={styles.navLink}>Admin</Link>
                  <Link to="/admin/flags" className={styles.navLink}>📊 Flags Admin</Link>
                </>
              )}
            </>
          )}
          {isRefreshing && <div className={styles.refreshIndicator}>🔄️</div>}
        </div>

        <div className={styles.authSection}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
                <Link to="/perfil" className={styles.navLink}>
                <span className={styles.welcomeText}>
                  Hola, {user?.first_name || user?.username}
                </span>
                {user?.group_name && (
                <span className={styles.groupInfo}>
                  ({user.group_name})
                </span>
              )}
              <span className={styles.roleInfo}>
                {user?.role === 'admin' ? ' 👑' : 
                 user?.role === 'teacher' ? ' 👨‍🏫' : ' 👨‍🎓'}
              </span>
              </Link>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to="/auth" className={styles.loginButton}>
              Iniciar Sesión
            </Link>
          )}
          <ThemeToggle className={styles.themeToggle} />
        </div>
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
      {isAuthenticated && <FlagSubmitter />}
    </div>
  );
};


function App() {

  return (
    <>
        <AppLayout />
        {/* <h1>Hola</h1> */}
      {/* <HomeHero /> */}
      
    </>
  )
}

export default App
