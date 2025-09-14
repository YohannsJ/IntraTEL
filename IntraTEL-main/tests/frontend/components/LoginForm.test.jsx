import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../../src/components/Auth/LoginForm';
import { fillForm, submitForm } from '../../utils/testHelpers';

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSwitchToRegister: mockOnSwitchToRegister,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders all form elements correctly', () => {
      render(<LoginForm {...defaultProps} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/recordarme/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByText(/¿no tienes cuenta?/i)).toBeInTheDocument();
    });

    test('renders title', () => {
      render(<LoginForm {...defaultProps} />);
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      await submitForm(user, /iniciar sesión/i);

      await waitFor(() => {
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      await fillForm(user, {
        email: 'invalid-email'
      });

      await submitForm(user, /iniciar sesión/i);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    test('clears field errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      // Trigger validation error
      await submitForm(user, /iniciar sesión/i);

      await waitFor(() => {
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      });

      // Start typing in email field
      await user.type(screen.getByLabelText(/email/i), 't');

      await waitFor(() => {
        expect(screen.queryByText(/email es requerido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid credentials', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      await fillForm(user, {
        email: 'test@example.com',
        contraseña: 'password123'
      });

      await submitForm(user, /iniciar sesión/i);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false
        });
      });
    });

    test('includes rememberMe when checkbox is checked', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      await fillForm(user, {
        email: 'test@example.com',
        contraseña: 'password123'
      });

      await user.click(screen.getByLabelText(/recordarme/i));
      await submitForm(user, /iniciar sesión/i);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true
        });
      });
    });
  });

  describe('Loading State', () => {
    test('disables inputs when loading', () => {
      render(<LoginForm {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();
      expect(screen.getByLabelText(/recordarme/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled();
    });

    test('shows loading text on submit button', () => {
      render(<LoginForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/iniciando sesión.../i)).toBeInTheDocument();
      expect(screen.queryByText(/^iniciar sesión$/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('calls onSwitchToRegister when register link is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));

      expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Display', () => {
    test('displays general error message when provided', () => {
      const propsWithError = {
        ...defaultProps,
        error: 'Credenciales inválidas'
      };

      render(<LoginForm {...propsWithError} />);

      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and structure', () => {
      render(<LoginForm {...defaultProps} />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/recordarme/i)).toHaveAttribute('type', 'checkbox');
    });

    test('can be submitted via Enter key', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      await fillForm(user, {
        email: 'test@example.com',
        contraseña: 'password123'
      });

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });
});
