// Configuración de variables de entorno para la aplicación
const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || './api',
  API_PREFIX: '/api',
  
  // Server Configuration
  SERVER_PORT: import.meta.env.VITE_SERVER_PORT || 3001,
  
  // Frontend Configuration
  CLIENT_PORT: import.meta.env.VITE_CLIENT_PORT || 5174,
  
  // Application Settings
  APP_NAME: 'IntraTEL',
  APP_VERSION: '1.0.0',
  
  // Game Settings
  DEFAULT_FLAG_POINTS: 10,
  MAX_FLAGS_PER_USER: 100,
  LEADERBOARD_LIMIT: 20,
  
  // UI Settings
  ITEMS_PER_PAGE: 10,
  TOAST_DURATION: 3000,
  
  // Authentication
  TOKEN_STORAGE_KEY: 'intratel-token',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Debug
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV,
};

// Helper functions
export const getApiUrl = (endpoint = '') => {
  const baseUrl = `${config.API_BASE_URL}${config.API_PREFIX}`;
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const log = (...args) => {
  if (config.ENABLE_LOGGING) {
    console.log('[IntraTEL]', ...args);
  }
};

export const logError = (...args) => {
  if (config.ENABLE_LOGGING) {
    console.error('[IntraTEL Error]', ...args);
  }
};

export default config;
