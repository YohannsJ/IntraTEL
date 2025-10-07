import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config';
import Footer from '../components/Footer/Footer';
import styles from './WelcomePage.module.css';

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('/flags/stats'));
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const games = [
    {
      title: "🔧 NandGame (Hardware)",
      description: "Construye circuitos lógicos desde cero, comenzando con compuertas NAND hasta diseñar una computadora completa.",
      skills: ["Lógica digital", "Circuitos integrados", "Arquitectura de computadoras"],
      path: "/NandGame"
    },
    {
      title: "🌐 Consola (Redes)",
      description: "Domina los protocolos de red y aprende a configurar dispositivos en un entorno de simulación realista.",
      skills: ["Protocolos TCP/IP", "Configuración de routers", "Subnetting"],
      path: "/Redes"
    },
    {
      title: "📡 Espectro (Telecomunicaciones)",
      description: "Explora el espectro electromagnético y comprende los fundamentos de las comunicaciones inalámbricas.",
      skills: ["Ondas electromagnéticas", "Modulación", "Propagación de señales"],
      path: "/Espectro"
    },
    {
      title: "💻 Código (Software)",
      description: "Desarrolla habilidades de programación resolviendo desafíos de código y CSS interactivos.",
      skills: ["Programación", "Diseño web", "Algoritmos"],
      path: "/Software"
    },
    {
      title: "📊 Análisis (Datos)",
      description: "Analiza y visualiza datos de sistemas telemáticos para tomar decisiones informadas.",
      skills: ["Análisis de datos", "Visualización", "Gestión de información"],
      path: "/Datos"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header de bienvenida */}
        <header className={styles.header}>
          <div className={styles.welcomeIcon}>🎓</div>
          <h1 className={styles.title}>
            ¡Bienvenido a IntraTEL, {user?.first_name}!
          </h1>
          <p className={styles.subtitle}>
           Has elegido una carrera apasionante que está a la vanguardia en las TIC e integra telecomunicaciones, redes de computadores, programación, hardware y datos (hasta machine learning). En IntraTEL, conocerás estos pilares de la carrera 
              a través de juegos interactivos y desafiantes.
          </p>
        </header>

        {/* Estadísticas del sistema */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>📊 El Desafío</h2>
          {loading ? (
            <div className={styles.loading}>Cargando estadísticas...</div>
          ) : stats ? (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🚩</div>
                <div className={styles.statValue}>{stats.totalFlags}</div>
                <div className={styles.statLabel}>Flags Disponibles</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⭐</div>
                <div className={styles.statValue}>{stats.maxPoints}</div>
                <div className={styles.statLabel}>Puntos Máximos</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statValue}>{stats.totalUsers}</div>
                <div className={styles.statLabel}>Estudiantes Activos</div>
              </div>
            </div>
          ) : (
            <p className={styles.errorMessage}>No se pudieron cargar las estadísticas</p>
          )}
        </section>

        {/* Información sobre los juegos */}
        <section className={styles.gamesSection}>
          <h2 className={styles.sectionTitle}>🎮 Explora Nuestros Juegos</h2>
          <p className={styles.sectionDescription}>
            Cada juego está diseñado para desarrollar competencias específicas de la Ingeniería Civil Telemática.
            Completa desafíos, encuentra flags ocultas y acumula puntos mientras aprendes.
          </p>
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <div key={index} className={styles.gameCard}>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <p className={styles.gameDescription}>{game.description}</p>
                <div className={styles.skillsList}>
                  <strong>Aprenderás:</strong>
                  <ul>
                    {game.skills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <Link to={game.path} className={styles.gameButton}>
                  Jugar Ahora →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Información sobre el sistema de flags */}
        <section className={styles.flagsSection}>
          <h2 className={styles.sectionTitle}>🏁 Sistema de Flags</h2>
          <div className={styles.flagsInfo}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🔍</div>
              <h3>¿Qué es una Flag?</h3>
              <p>
                Las flags son códigos secretos escondidos en los juegos. Cada flag que encuentres 
                representa un logro o concepto que has dominado.
              </p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🎯</div>
              <h3>¿Cómo Funcionan?</h3>
              <p>
                Completa desafíos, resuelve problemas o alcanza objetivos específicos para descubrir 
                flags. Cada flag tiene un valor en puntos que refleja su dificultad.
              </p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🏆</div>
              <h3>¿Por Qué Importan?</h3>
              <p>
                Las flags representan tu progreso y conocimiento. Acumula puntos, compite con tus 
                compañeros y demuestra tu dominio de la telemática.
              </p>
            </div>
          </div>
        </section>


        {/* Call to action */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>¿Listo para comenzar?</h2>
          <p className={styles.ctaText}>
            Explora el Templo Telemático para conocer los pilares de la carrera, o empieza directamente 
            con los juegos para obtener tus primeras flags.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/Templo" className={styles.primaryButton}>
              🏛️ Visitar el Templo
            </Link>
            <Link to="/NandGame" className={styles.secondaryButton}>
              🎮 Comenzar a Jugar
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default WelcomePage;
