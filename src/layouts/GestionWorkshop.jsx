
import React from "react";
import NetworkManager from "../components/Games/Gestion/NetworkManager";

const GestionWorkshop = () => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Page header removed: title will be handled by the game's welcome hero to avoid duplicate headings */}
      {/* Welcome paragraph removed per user request */}
      <NetworkManager />
    </div>
  );
};

export default GestionWorkshop;