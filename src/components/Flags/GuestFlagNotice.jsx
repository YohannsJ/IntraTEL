import React from 'react';
import { Link } from 'react-router-dom';

// Aviso que reemplaza a la bandera cuando se juega sin iniciar sesión
const GuestFlagNotice = ({ style }) => (
  <div
    role="note"
    style={{
      margin: '12px 0',
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px dashed #f59e0b',
      background: 'rgba(245, 158, 11, 0.12)',
      color: 'inherit',
      fontSize: '0.95rem',
      textAlign: 'center',
      ...style
    }}
  >
    🔒 Estás jugando como invitado.{' '}
    <Link to="/auth" style={{ color: '#f59e0b', fontWeight: 'bold' }}>Inicia sesión</Link>{' '}
    para obtener banderas.
  </div>
);

export default GuestFlagNotice;
