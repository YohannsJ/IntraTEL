import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup del servidor mock para tests
export const server = setupServer(...handlers);
