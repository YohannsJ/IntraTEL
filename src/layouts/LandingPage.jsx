// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const features = [
    {
      title: "Juegos Interactivos",
      description: "Aprende conceptos complejos de telecomunicaciones a través de juegos diseñados específicamente para la carrera.",
      icon: "🎮",
      details: ["Circuitos lógicos NAND", "Protocolos de red", "Sistemas de comunicación"]
    },
    {
      title: "Sistema de Flags",
      description: "Completa desafíos y obtén flags como recompensa por tu progreso y logros en cada módulo.",
      icon: "🚩",
      details: ["Puntuación automática", "Ranking competitivo", "Logros desbloqueables"]
    },
    // SISTEMA DE GRUPOS DESHABILITADO - Juegos individuales únicamente
    // {
    //   title: "Colaboración en Grupos",
    //   description: "Forma equipos con tus compañeros y colabora en proyectos mientras compites con otros grupos.",
    //   icon: "👥",
    //   details: ["Creación de grupos", "Estadísticas compartidas", "Competencias entre equipos"]
    // },
    {
      title: "Pilares Telemáticos",
      description: "Explora los fundamentos de la ingeniería civil telemática a través de contenido interactivo y práctico.",
      icon: "📡",
      details: ["Teoría de redes", "Protocolos", "Arquitecturas de comunicación"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return; // Skip parallax if user prefers reduced motion

    const handleScroll = () => {
      // Throttle scroll events for better performance
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reduceMotion]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/ranking');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Parallax Background Layers */}
        <div className={styles.parallaxContainer}>
          <div 
            className={styles.parallaxLayer}
            style={{ 
              transform: reduceMotion ? 'none' : `translateY(${scrollY * 0.5}px)`,
              backgroundImage: `url('/BackgroundTEL.png')`
            }}
          />
          <div 
            className={styles.parallaxOverlay}
            style={{ 
              transform: reduceMotion ? 'none' : `translateY(${scrollY * 0.3}px)`
            }}
          />
          <div 
            className={styles.parallaxGradient}
            style={{ 
              transform: reduceMotion ? 'none' : `translateY(${scrollY * 0.2}px)`
            }}
          />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.logoSection}>
            <img 
              src="/LogoTEL.png" 
              alt="Logo Telemática" 
              className={styles.heroLogo}
              style={{ 
                transform: reduceMotion ? 'none' : `translateY(${scrollY * -0.1}px)`
              }}
            />
          </div>
          <div 
            className={styles.heroText}
            style={{ 
              transform: reduceMotion ? 'none' : `translateY(${scrollY * -0.15}px)`
            }}
          >
            <h1 className={styles.heroTitle}>
              Bienvenido a <span className={styles.brandName}>IntraTEL</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Una plataforma interactiva diseñada por DifTel para ofrecer una experiencia única 
              en el aprendizaje de <strong>Ingeniería Civil Telemática</strong>
            </p>
            <p className={styles.heroDescription}>
              Descubre los pilares fundamentales de la carrera a través de juegos educativos, 
              desafíos prácticos y colaboración en equipo.
            </p>
            <div className={styles.heroActions}>
              <button 
                onClick={handleGetStarted}
                className={`${styles.ctaButton} ${styles.primary}`}
              >
                {isAuthenticated ? 'Ir al Ranking' : 'Comenzar Ahora'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>¿Por qué elegir IntraTEL?</h2>
          <p className={styles.sectionSubtitle}>
            Una experiencia de aprendizaje diseñada específicamente para estudiantes de telecomunicaciones
          </p>
        </div>
        
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <ul className={styles.featureList}>
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className={styles.featureListItem}>
                      ✓ {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
          <p className={styles.sectionSubtitle}>
            Tres simples pasos para comenzar tu aventura en IntraTel
          </p>
        </div>
        
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Regístrate</h3>
              <p className={styles.stepDescription}>
                Crea tu cuenta individual y comienza tu aventura de aprendizaje
              </p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Explora</h3>
              <p className={styles.stepDescription}>
                Navega por los diferentes juegos y desafíos diseñados para cada pilar telemático
              </p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Compite</h3>
              <p className={styles.stepDescription}>
                Completa desafíos, obtén flags y compite en el ranking con otros estudiantes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
