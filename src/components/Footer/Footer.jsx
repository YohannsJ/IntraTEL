import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const creators = [
    {
      name: 'Yohanns Jara',
      github: 'YohannsJ',
      role: 'Juego de Hardware',
      emoji: '📟'
    },
    {
      name: 'Juan Villalón',
      github: 'juanvillalon',
      role: 'Juego de Telecomunicaciones',
      emoji: '📡'
    },
    {
      name: 'Gabriela Gonzales',
      github: 'gabsgcx',
      role: 'Juego de Gestión de datos',
      emoji: '📊'
    },
    {
      name: 'Nicolas Verdugo',
      github: 'guarenSemilla',
      role: 'Juego de Software',
      emoji: '💻'
    },
    {
      name: 'Vicente Tejos',
      github: 'tejosmv',
      role: 'Juego de Redes de computadores',
      emoji: '🌐'
    }
  ];

  return (
    <footer className={styles.footer}>
  <div className={styles.footerContainer}>
    <div className={styles.left}>
      <p>© {new Date().getFullYear()} IntraTEL · Ingeniería Civil Telemática</p>
    </div>

    <div className={styles.center}>
      {/* <a href="https://github.com/YohannsJ/IntraTEL" target="_blank" rel="noopener noreferrer">Repositorio</a>
      <a href="/Templo">Templo Telemático</a>
      <a href="mailto:contacto@intratel.cl">Contacto</a> */}
    </div>

    <div className={styles.right}>
      <p>Hecho con ❤️ por estudiantes de TEL.</p>
    </div>
  </div>

  <div className={styles.creators}>
    <p>
      <span className={styles.teamTitle}>Creadores:</span>
      <a href="https://github.com/YohannsJ" target="_blank" rel="noopener noreferrer">@YohannsJ</a> ·
      <a href="https://github.com/juanvillalon" target="_blank" rel="noopener noreferrer">@juanvillalon</a> ·
      <a href="https://github.com/gabsgcx" target="_blank" rel="noopener noreferrer">@gabsgcx</a> ·
      <a href="https://github.com/guarenSemilla" target="_blank" rel="noopener noreferrer">@guarenSemilla</a> ·
      <a href="https://github.com/tejosmv" target="_blank" rel="noopener noreferrer">@tejosmv</a>
    </p>
    <p className={styles.roles}>
      Hardware · Telecomunicaciones · Gestión de Datos · Software · Redes de Computadores
    </p>
  </div>
</footer>
    );
}
export default Footer;
