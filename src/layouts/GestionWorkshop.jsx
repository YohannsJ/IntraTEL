
import React from "react";
import { useNavigate } from "react-router-dom";
import NetworkManager from "../components/Games/Gestion/NetworkManager";
import Footer from "../components/Footer/Footer";

const GestionWorkshop = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '20px' }}>
      {/* Page header removed: title will be handled by the game's welcome hero to avoid duplicate headings */}
      {/* Welcome paragraph removed per user request */}
      <NetworkManager />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '16px 24px', 
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
          title="Ir al juego anterior: Gestión de Redes"
        >
          ← Main
        </button>
        <button 
          onClick={() => navigate('/software')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
          title="Ir al siguiente juego: Consola (Redes)"
        >
          Siguiente juego →
        </button>
      </div>
      
      {/* Footer con créditos de todos los creadores */}
      <Footer />
    </div>
  );
};

export default GestionWorkshop;