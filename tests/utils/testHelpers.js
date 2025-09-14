import React from 'react';
import { AuthProvider } from '../../src/context/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';

// Mock del AuthContext para tests
export const MockAuthProvider = ({ children, initialValue = {} }) => {
  const defaultValue = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    checkAuth: jest.fn(),
    ...initialValue
  };

  return (
    <AuthProvider value={defaultValue}>
      {children}
    </AuthProvider>
  );
};

// Mock del ThemeContext para tests
export const MockThemeProvider = ({ children, initialTheme = 'light' }) => {
  const value = {
    theme: initialTheme,
    toggleTheme: jest.fn(),
    setTheme: jest.fn()
  };

  return (
    <ThemeProvider value={value}>
      {children}
    </ThemeProvider>
  );
};

// Wrapper completo para tests con todos los providers
export const TestWrapper = ({ 
  children, 
  authValue = {}, 
  theme = 'light' 
}) => {
  return (
    <MockThemeProvider initialTheme={theme}>
      <MockAuthProvider initialValue={authValue}>
        {children}
      </MockAuthProvider>
    </MockThemeProvider>
  );
};

// Helper para renderizar con providers
export const renderWithProviders = (ui, options = {}) => {
  const { authValue, theme, ...renderOptions } = options;
  
  const Wrapper = ({ children }) => (
    <TestWrapper authValue={authValue} theme={theme}>
      {children}
    </TestWrapper>
  );

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Datos de prueba comunes
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  role: 'student',
  group_id: 1,
  created_at: '2023-01-01T00:00:00.000Z'
};

export const mockAdmin = {
  id: 2,
  email: 'admin@example.com',
  name: 'Admin User',
  username: 'admin',
  role: 'admin',
  group_id: null,
  created_at: '2023-01-01T00:00:00.000Z'
};

export const mockGroup = {
  id: 1,
  name: 'Test Group',
  description: 'A test group',
  invitation_code: 'TEST123',
  created_by: 2,
  member_count: 5,
  created_at: '2023-01-01T00:00:00.000Z'
};

export const mockFlag = {
  id: 1,
  name: 'Test Flag',
  description: 'A test flag description',
  points: 10,
  category: 'testing',
  difficulty: 'easy',
  is_solved: false,
  created_at: '2023-01-01T00:00:00.000Z'
};

// Helpers para simular eventos de usuario
export const fillForm = async (user, fields) => {
  for (const [fieldName, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async (user, buttonText = /submit|enviar|crear/i) => {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
};

// Esperar por elementos async
export const waitForLoading = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading|cargando/i)).not.toBeInTheDocument();
  });
};

export const waitForError = async (errorText) => {
  await waitFor(() => {
    expect(screen.getByText(new RegExp(errorText, 'i'))).toBeInTheDocument();
  });
};

// Mock de timers para tests
export const mockTimers = () => {
  jest.useFakeTimers();
  return {
    advance: (ms) => jest.advanceTimersByTime(ms),
    runAll: () => jest.runAllTimers(),
    restore: () => jest.useRealTimers()
  };
};
