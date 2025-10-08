import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/LogoTEL.png'
import './App.css'
import {PilarTelematica} from "./components/Pilar/PilarTelematica";
import HomeHero from "./layouts/TemploTEL";
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from './components/etc/ThemeToggle';
import FlagSubmitter from './components/Flags/FlagSubmitter';
import styles from './App.module.css';
// import ThemeContext from './context/ThemeContext';
import { useTheme } from './context/ThemeContext.jsx';
// Creamos un componente interno para que pueda acceder a los contextos
const AppLayout = () => {
  const location = useLocation();
  const { isRefreshing } = useData(); // Mantenemos el estado de refresh del DataContext
  const { user, logout, isAuthenticated } = useAuth(); // Usamos el nuevo AuthContext
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { currentTheme, setTheme } = useTheme();

  // Detectar scroll para ocultar/mostrar navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up o en la parte superior
        setNavbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down y pasó 100px
        setNavbarVisible(false);
        // Cerrar dropdowns al ocultar navbar
        setGamesDropdownOpen(false);
        setUserDropdownOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Cerrar dropdown de juegos al abrir/cerrar mobile menu
    if (!mobileMenuOpen) {
      setGamesDropdownOpen(false);
      setUserDropdownOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setGamesDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const toggleGamesDropdown = () => {
    setGamesDropdownOpen(!gamesDropdownOpen);
  };

  const closeGamesDropdown = () => {
    setGamesDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const closeUserDropdown = () => {
    setUserDropdownOpen(false);
  };

  const handleGameSelection = () => {
    // Cerrar ambos menús al seleccionar un juego
    setGamesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleUserMenuSelection = () => {
    // Cerrar ambos menús al seleccionar una opción de usuario
    setUserDropdownOpen(false);
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
    // Close user dropdown when clicking outside
    if (userDropdownOpen && !e.target.closest(`.${styles.userDropdown}`)) {
      closeUserDropdown();
    }
  };
// console.log(ThemeContext.Consumer.);
// Quiero saber si es tema oscuro o claro
// console.log(useTheme().currentTheme);
  return (
    <div className={styles.appContainer} onClick={handleNavClick}>
      <nav className={`${styles.navbar} ${!navbarVisible ? styles.navbarHidden : ''}`}>
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
              <Link to="/Datos" className={styles.dropdownItem} onClick={handleGameSelection}>
                📊 Análisis (Datos)
              </Link>
              <Link to="/Software" className={styles.dropdownItem} onClick={handleGameSelection}>
                💻 Código (Software)
              </Link>
              <Link to="/Redes" className={styles.dropdownItem} onClick={handleGameSelection}>
                🌐 Consola (Redes)
              </Link>
              <Link to="/Espectro" className={styles.dropdownItem} onClick={handleGameSelection}>
                📡 Espectro (Teleco)
              </Link>
              <Link to="/NandGame" className={styles.dropdownItem} onClick={handleGameSelection}>
                📟 NandGame (Hardware)
              </Link>
            </div>
          </div>

          <Link to="/Templo" className={styles.navLink} onClick={closeMobileMenu}>🏛️ Templo</Link>
          
          {/* Dropdown de Usuario en mobile (solo cuando está autenticado) */}
          {isAuthenticated && (
            <div className={`${styles.userDropdown} ${styles.mobileOnly}`}>
              <button 
                className={`${styles.navLink} ${styles.dropdownToggle}`}
                onClick={toggleUserDropdown}
                aria-expanded={userDropdownOpen}
              >
                Hola, {user?.first_name || user?.username} {user?.role === 'admin' ? '👑' : user?.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {userDropdownOpen ? '▲' : '▼'}
              </button>
              <div className={`${styles.dropdownMenu} ${userDropdownOpen ? styles.dropdownOpen : ''}`}>
                <Link to="/perfil" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                  👤 Perfil
                </Link>
                <Link to="/mis-flags" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                  🏁 Mis Flags
                </Link>
                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                      👑 Admin
                    </Link>
                    <Link to="/admin/flags" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                      📊 Flags Admin
                    </Link>
                  </>
                )}
                {/* <div className={styles.dropdownDivider}></div>
                <div className={styles.dropdownItem} style={{ padding: '0.6rem 0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Tema</span>
                    <ThemeToggle />
                  </div>
                </div>
                <div className={styles.dropdownDivider}></div> */}
                <button 
                  onClick={() => { handleLogout(); handleUserMenuSelection(); }}
                  className={`${styles.dropdownItem} ${styles.logoutDropdownButton}`}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
          
          {isRefreshing && <div className={styles.refreshIndicator}>🔄️</div>}
          
          {/* Sección de auth para usuarios no autenticados en mobile */}
          {!isAuthenticated && location.pathname !== '/auth' && (
            <div className={`${styles.authSection} ${styles.mobileOnly}`} style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--theme-border)' }}>
              <Link to="/auth" className={styles.loginButton}>
                Iniciar Sesión
              </Link>
              <div style={{ padding: '0.5rem' }}>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>

        {/* Desktop auth section - Dropdown de usuario a la derecha */}
        <div className={`${styles.authSection} ${styles.desktopOnly}`}>
          {isAuthenticated ? (
            <div className={styles.userDropdown}>
              <button 
                className={`${styles.navLink} ${styles.dropdownToggle}`}
                onClick={toggleUserDropdown}
                aria-expanded={userDropdownOpen}
              >
                Hola, {user?.first_name || user?.username} {user?.role === 'admin' ? '👑' : user?.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {userDropdownOpen ? '▲' : '▼'}
              </button>
              <div className={`${styles.dropdownMenu} ${styles.userDropdownMenu} ${userDropdownOpen ? styles.dropdownOpen : ''}`}>
                <Link to="/perfil" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                  👤 Perfil
                </Link>
                <Link to="/mis-flags" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                  🏁 Mis Flags
                </Link>
                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                      👑 Admin
                    </Link>
                    <Link to="/admin/flags" className={styles.dropdownItem} onClick={handleUserMenuSelection}>
                      📊 Flags Admin
                    </Link>
                  </>
                )}
                {/*<div className={styles.dropdownDivider}></div>
                <div className={styles.dropdownItem} style={{ padding: '0.6rem 0.9rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>🎨 Tema</span>
                    <ThemeToggle />
                  </div> 
                </div>*/}
                <div className={styles.dropdownDivider}></div>
                <button 
                  onClick={() => { handleLogout(); handleUserMenuSelection(); }}
                  className={`${styles.dropdownItem} ${styles.logoutDropdownButton}`}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            location.pathname !== '/auth' && (
              <Link to="/auth" className={styles.loginButton}>
                Iniciar Sesión
              </Link>
            )
          )}
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
