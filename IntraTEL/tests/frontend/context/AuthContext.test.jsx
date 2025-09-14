import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthContext, { AuthProvider } from '../../../src/context/AuthContext';
import { mockUser, mockAdmin } from '../../utils/testHelpers';
import { server } from '../../utils/mocks/server';
import { rest } from 'msw';

// Mock de la configuración de entorno
jest.mock('../../../src/config/environment', () => ({
  getApiUrl: (path) => `http://localhost:3001/api${path}`,
  getAuthHeaders: () => ({
    'Authorization': 'Bearer fake-jwt-token'
  }),
  log: jest.fn(),
  logError: jest.fn()
}));

// Componente de prueba para consumir el contexto
const TestComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    logout, 
    updateProfile,
    checkAuth 
  } = React.useContext(AuthContext);

  return (
    <div>
      <div data-testid="user-info">
        {user ? JSON.stringify(user) : 'No user'}
      </div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="loading-status">
        {isLoading ? 'Loading' : 'Not loading'}
      </div>
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={() => register({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateProfile({ name: 'Updated Name' })}>
        Update Profile
      </button>
      <button onClick={checkAuth}>Check Auth</button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('provides initial unauthenticated state', () => {
      renderWithAuthProvider();

      expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
  });

  describe('Login Functionality', () => {
    test('successfully logs in with valid credentials', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();

      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-info')).toHaveTextContent('test@example.com');
      });

      // Verify token is stored in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'intratel-token',
        'fake-jwt-token'
      );
    });

    test('handles login failure', async () => {
      // Override handler to simulate failure
      server.use(
        rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              success: false,
              message: 'Credenciales inválidas'
            })
          );
        })
      );

      const user = userEvent.setup();
      renderWithAuthProvider();

      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
      });
    });

    test('sets loading state during login', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();

      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      // Loading state should be visible briefly
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
      });
    });
  });

  describe('Registration Functionality', () => {
    test('successfully registers new user', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();

      await user.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-info')).toHaveTextContent('new@example.com');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'intratel-token',
        'fake-jwt-token'
      );
    });

    test('handles registration failure', async () => {
      server.use(
        rest.post('http://localhost:3001/api/auth/register', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              message: 'Email ya registrado'
            })
          );
        })
      );

      const user = userEvent.setup();
      renderWithAuthProvider();

      await user.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      });
    });
  });

  describe('Logout Functionality', () => {
    test('successfully logs out user', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();

      // First login
      await user.click(screen.getByText('Login'));
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      // Then logout
      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('intratel-token');
    });
  });

  describe('Token Persistence', () => {
    test('restores authentication state from stored token', async () => {
      // Simulate existing token in localStorage
      localStorage.getItem.mockReturnValue('fake-jwt-token');

      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-info')).toHaveTextContent('test@example.com');
      });
    });

    test('handles invalid stored token', async () => {
      localStorage.getItem.mockReturnValue('invalid-token');
      
      server.use(
        rest.get('http://localhost:3001/api/auth/verify', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              success: false,
              message: 'Token inválido'
            })
          );
        })
      );

      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('intratel-token');
    });
  });

  describe('Profile Update', () => {
    test('successfully updates user profile', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();

      // First login
      await user.click(screen.getByText('Login'));
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      // Mock the update profile endpoint
      server.use(
        rest.put('http://localhost:3001/api/auth/profile', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              user: {
                ...mockUser,
                name: 'Updated Name'
              }
            })
          );
        })
      );

      await user.click(screen.getByText('Update Profile'));

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Updated Name');
      });
    });

    test('handles profile update failure', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();

      // First login
      await user.click(screen.getByText('Login'));
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      // Mock failed update
      server.use(
        rest.put('http://localhost:3001/api/auth/profile', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              message: 'Error al actualizar perfil'
            })
          );
        })
      );

      await user.click(screen.getByText('Update Profile'));

      // Profile should remain unchanged
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Test User');
      });
    });
  });

  describe('Auth Check', () => {
    test('successfully verifies authentication', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue('fake-jwt-token');
      renderWithAuthProvider();

      await user.click(screen.getByText('Check Auth'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      server.use(
        rest.post('http://localhost:3001/api/auth/login', (req, res) => {
          return res.networkError('Network error');
        })
      );

      const user = userEvent.setup();
      renderWithAuthProvider();

      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
      });
    });
  });
});
