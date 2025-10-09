import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const LogoDidacticTel = ({ className, style, width = "200", height = "45" }) => {
  const { currentTheme } = useTheme();
  
  // Colores adaptativos según el tema
  const getLogoColors = () => {
    if (currentTheme === 'dark') {
      return {
        didacticColor: '#f1f5f9',     // Color claro para "Didactic-"
        telColor: '#7ACBFF',           // Azul claro para "Tel"
      };
    } else {
      return {
        didacticColor: '#0f172a',     // Color oscuro para "Didactic-"
        telColor: '#0369a1',          // Azul más oscuro para "Tel"
      };
    }
  };
  
  const colors = getLogoColors();
  
  return (
    <svg 
      viewBox="0 0 900 200" 
      xmlns="http://www.w3.org/2000/svg" 
      role="img" 
      aria-label="Didactic-Tel logo"
      className={className}
      style={{ 
        width: width, 
        height: height,
        ...style 
      }}
    >
      {/* Fondo transparente */}
      <rect width="100%" height="100%" fill="none"/>
      
      {/* Texto central */}
      <text 
        x="50%" 
        y="55%" 
        textAnchor="middle"
        fontFamily="Inter, Poppins, Segoe UI, Arial, sans-serif"
        fontSize="120" 
        fontWeight="700"
        dominantBaseline="middle"
      >
        <tspan fill={colors.didacticColor}>Didactic-</tspan>
        <tspan fill={colors.telColor}>Tel</tspan>
      </text>
    </svg>
  );
};

export default LogoDidacticTel;