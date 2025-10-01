
import React from "react";
import NetworkManager from "../components/Games/Gestion/NetworkManager";

const GestionWorkshop = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Administrador de Red Escolar
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        ¡Bienvenido! Eres el encargado de mantener la red del colegio funcionando correctamente.
        Resuelve los problemas que aparezcan y mantén la estabilidad de la red alta.
      </p>
      <NetworkManager />
    </div>
  );
};

export default GestionWorkshop;