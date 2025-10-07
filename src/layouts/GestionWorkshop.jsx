
import React from "react";
import NetworkManager from "../components/Games/Gestion/NetworkManager";
import GameCredits from "../components/GameCredits/GameCredits";

const GestionWorkshop = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Administrador de Red Escolar
      </h1>
      {/* Welcome paragraph removed per user request */}
      <NetworkManager />
      
      {/* Créditos */}
      <GameCredits 
        creator={{ name: 'Gabriel García', github: 'gabsgcx' }}
        emoji="📊"
        gameName="Gestión de Red"
      />
    </div>
  );
};

export default GestionWorkshop;