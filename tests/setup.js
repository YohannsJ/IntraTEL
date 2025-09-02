// Setup para todos los tests
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './utils/mocks/server';

// Mock de variables de entorno para tests
global.process.env = {
  ...global.process.env,
  VITE_API_BASE_URL: 'http://localhost:3001',
  VITE_API_PREFIX: '/api',
  VITE_APP_NAME: 'IntraTEL Test',
  VITE_ENABLE_LOGGING: 'false',
  VITE_DEBUG_MODE: 'false'
};

// Mock de funciones de logging para tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Setup MSW (Mock Service Worker)
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error'
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock de fetch si no está disponible
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock de window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Mock de matchMedia para tests de CSS
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
