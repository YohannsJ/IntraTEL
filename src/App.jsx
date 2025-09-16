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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Cerrar dropdown de juegos al abrir/cerrar mobile menu
    if (!mobileMenuOpen) {
      setGamesDropdownOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setGamesDropdownOpen(false);
  };

  const toggleGamesDropdown = () => {
    setGamesDropdownOpen(!gamesDropdownOpen);
  };

  const closeGamesDropdown = () => {
    setGamesDropdownOpen(false);
  };

  const handleGameSelection = () => {
    // Cerrar ambos menús al seleccionar un juego
    setGamesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  const handleNavClick = (e) => {
    if (e.target.closest(`.${styles.mobileMenuButton}`)) return;
    if (mobileMenuOpen && !e.target.closest(`.${styles.navLinks}`)) {
      closeMobileMenu();
    }
    // Close games dropdown when clicking outside
    if (gamesDropdownOpen && !e.target.closest(`.${styles.gamesDropdown}`)) {
      closeGamesDropdown();
    }
  };
// console.log(ThemeContext.Consumer.);
// Quiero saber si es tema oscuro o claro
// console.log(useTheme().currentTheme);
  return (
    <div className={styles.appContainer} onClick={handleNavClick}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}><img src={`intratel-logo-${useTheme().currentTheme}.svg`} alt="" /></Link>
        
        {/* Mobile menu button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          {/* <Link to="/" className={styles.navLink} onClick={closeMobileMenu}>Inicio</Link> */}
          
          {/* Dropdown de Juegos */}
          <div className={styles.gamesDropdown}>
            <button 
              className={`${styles.navLink} ${styles.dropdownToggle}`}
              onClick={toggleGamesDropdown}
              aria-expanded={gamesDropdownOpen}
            >
              🎮 Juegos {gamesDropdownOpen ? '▲' : '▼'}
            </button>
            <div className={`${styles.dropdownMenu} ${gamesDropdownOpen ? styles.dropdownOpen : ''}`}>
              <Link to="/NandGame" className={styles.dropdownItem} onClick={handleGameSelection}>
                🔧 NandGame (Hardware)
              </Link>
              <Link to="/Juego2" className={styles.dropdownItem} onClick={handleGameSelection}>
                🌐 Consola (Redes)
              </Link>
              <Link to="/Juego3" className={styles.dropdownItem} onClick={handleGameSelection}>
                📡 Espectro (Teleco)
              </Link>
              <Link to="/Juego5" className={styles.dropdownItem} onClick={handleGameSelection}>
                💻 Código (Software)
              </Link>
              <Link to="/Juego4" className={styles.dropdownItem} onClick={handleGameSelection}>
                📊 Análisis (Datos)
              </Link>
            </div>
          </div>

          <Link to="/Templo" className={styles.navLink} onClick={closeMobileMenu}>🏛️ Templo</Link>
          {isAuthenticated && (
            <>
              <Link to="/grupos" className={styles.navLink} onClick={closeMobileMenu}>👥 Grupos</Link>
              <Link to="/ranking" className={styles.navLink} onClick={closeMobileMenu}>🏆 Ranking</Link>
              <Link to="/mis-flags" className={styles.navLink} onClick={closeMobileMenu}>🏁 Mis Flags</Link>
              {/* <Link to="/perfil" className={styles.navLink} onClick={closeMobileMenu}>Mi Perfil</Link> */}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className={styles.navLink} onClick={closeMobileMenu}>👑 Admin</Link>
                  <Link to="/admin/flags" className={styles.navLink} onClick={closeMobileMenu}>📊 Flags Admin</Link>
                </>
              )}
            </>
          )}
          {isRefreshing && <div className={styles.refreshIndicator}>🔄️</div>}
          
          {/* Mobile auth section */}
          <div className={`${styles.authSection} ${styles.mobileOnly}`}>
            {isAuthenticated ? (
              <div className={styles.userInfo}>
                  <Link to="/perfil" className={styles.navLink} onClick={closeMobileMenu}>
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
        </div>

        {/* Desktop auth section */}
        <div className={`${styles.authSection} ${styles.desktopOnly}`}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
                <Link to="/perfil" className={styles.navLink} onClick={closeMobileMenu}>
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
