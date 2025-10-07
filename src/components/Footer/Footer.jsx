import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const creators = [
    {
      name: 'Yohanns Jiménez',
      github: 'YohannsJ',
      role: 'PMO & NandGame',
      emoji: '🔧'
    },
    {
      name: 'Juan Villalón',
      github: 'juanvillalon',
      role: 'Juego Teleco',
      emoji: '📡'
    },
    {
      name: 'Gabriel García',
      github: 'gabsgcx',
      role: 'Juego Gestión',
      emoji: '📊'
    },
    {
      name: 'Guarén Semilla',
      github: 'guarenSemilla',
      role: 'Juego Software',
      emoji: '💻'
    },
    {
      name: 'Tejos MV',
      github: 'tejosmv',
      role: 'Juego Redes',
      emoji: '🌐'
    }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>IntraTEL</h3>
          <p className={styles.footerDescription}>
            Plataforma de aprendizaje interactivo para Ingeniería Civil Telemática
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Creadores</h4>
          <div className={styles.creatorsGrid}>
            {creators.map((creator, index) => (
              <a
                key={index}
                href={`https://github.com/${creator.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.creatorLink}
              >
                <span className={styles.creatorEmoji}>{creator.emoji}</span>
                <div className={styles.creatorInfo}>
                  <span className={styles.creatorName}>{creator.name}</span>
                  <span className={styles.creatorGithub}>@{creator.github}</span>
                  <span className={styles.creatorRole}>{creator.role}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Enlaces</h4>
          <div className={styles.linksColumn}>
            <a href="https://github.com/YohannsJ/IntraTEL" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              💻 Repositorio GitHub
            </a>
            <a href="/Templo" className={styles.footerLink}>
              🏛️ Templo Telemático
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} IntraTEL - Ingeniería Civil Telemática
        </p>
        <p className={styles.madeWith}>
          Hecho con ❤️ para estudiantes de Telemática
        </p>
      </div>
    </footer>
  );
};

export default Footer;
