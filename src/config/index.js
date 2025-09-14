// Configuración de la aplicación usando variables de entorno
import environment from './environment.js';

// Re-exportamos la configuración del environment
export const config = environment;

// Helper para construir URLs de API
export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${environment.API_BASE_URL}${environment.API_PREFIX}/${cleanEndpoint}`;
};

// Helper para headers de API
export const apiHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem(environment.TOKEN_STORAGE_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Re-exportamos funciones útiles del environment
export { getApiUrl, getAuthHeaders, log, logError } from './environment.js';

export default config;
