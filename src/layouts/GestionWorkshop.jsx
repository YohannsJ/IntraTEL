
import React from "react";
import NetworkManager from "../components/Games/Gestion/NetworkManager";
import Footer from "../components/Footer/Footer";

const GestionWorkshop = () => {
  return (
    <div style={{ padding: '50px 0px 0px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Administrador de Red Escolar
      </h1>
      {/* Welcome paragraph removed per user request */}
      <NetworkManager />
      
      {/* Footer con créditos de todos los creadores */}
      <Footer />
    </div>
  );
};

export default GestionWorkshop;