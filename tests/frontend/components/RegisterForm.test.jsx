import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../../src/components/Auth/RegisterForm';
import { fillForm, submitForm } from '../../utils/testHelpers';

describe('RegisterForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSwitchToLogin: mockOnSwitchToLogin,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders all form fields correctly', () => {
      render(<RegisterForm {...defaultProps} />);

      expect(screen.getByLabelText(/nombre$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
      expect(screen.getByText(/tengo un código de grupo/i)).toBeInTheDocument();
      expect(screen.getByText(/crear un nuevo grupo/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    test('renders title and switch link', () => {
      render(<RegisterForm {...defaultProps} />);

      expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
      expect(screen.getByText(/¿ya tienes cuenta?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inicia sesión aquí/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/apellido es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/nombre de usuario es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument();
        expect(screen.getByText(/confirmar contraseña es requerido/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('validates username length', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, {
        'nombre de usuario': 'ab'
      });

      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/nombre de usuario debe tener al menos 3 caracteres/i)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, {
        email: 'invalid-email'
      });

      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    test('validates password length', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, {
        contraseña: '123'
      });

      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    test('validates password confirmation match', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, {
        contraseña: 'password123',
        'confirmar contraseña': 'different123'
      });

      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      });
    });

    test('clears field error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      // Trigger validation error
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
      });

      // Start typing in the field
      await user.type(screen.getByLabelText(/nombre$/i), 'J');

      await waitFor(() => {
        expect(screen.queryByText(/nombre es requerido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Group Code Functionality', () => {
    test('shows group code input when checkbox is selected', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      const groupCodeCheckbox = screen.getByLabelText(/tengo un código de grupo/i);
      await user.click(groupCodeCheckbox);

      expect(screen.getByLabelText(/código de grupo/i)).toBeInTheDocument();
      expect(screen.getByText(/si tienes un código de grupo proporcionado/i)).toBeInTheDocument();
    });

    test('shows create group input when checkbox is selected', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      const createGroupCheckbox = screen.getByLabelText(/crear un nuevo grupo/i);
      await user.click(createGroupCheckbox);

      expect(screen.getByLabelText(/nombre del grupo/i)).toBeInTheDocument();
      expect(screen.getByText(/serás el administrador de este grupo/i)).toBeInTheDocument();
    });

    test('mutually exclusive group options', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      // Select group code option
      await user.click(screen.getByLabelText(/tengo un código de grupo/i));
      expect(screen.getByLabelText(/código de grupo/i)).toBeInTheDocument();

      // Select create group option (should hide group code)
      await user.click(screen.getByLabelText(/crear un nuevo grupo/i));
      expect(screen.queryByLabelText(/código de grupo/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/nombre del grupo/i)).toBeInTheDocument();

      // Verify the group code checkbox is unchecked
      expect(screen.getByLabelText(/tengo un código de grupo/i)).not.toBeChecked();
    });

    test('validates group name when creating group', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      // Enable create group
      await user.click(screen.getByLabelText(/crear un nuevo grupo/i));

      // Submit without group name
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/nombre del grupo es requerido/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      'nombre de usuario': 'juanperez',
      email: 'juan@example.com',
      contraseña: 'password123',
      'confirmar contraseña': 'password123'
    };

    test('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, validFormData);
      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'juanperez',
          email: 'juan@example.com',
          password: 'password123',
          firstName: 'Juan',
          lastName: 'Pérez'
        });
      });
    });

    test('includes group code in submission data', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, validFormData);
      
      // Add group code
      await user.click(screen.getByLabelText(/tengo un código de grupo/i));
      await user.type(screen.getByLabelText(/código de grupo/i), 'ABC123');

      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'juanperez',
          email: 'juan@example.com',
          password: 'password123',
          firstName: 'Juan',
          lastName: 'Pérez',
          groupCode: 'ABC123'
        });
      });
    });

    test('includes group creation data in submission', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, validFormData);
      
      // Add group creation
      await user.click(screen.getByLabelText(/crear un nuevo grupo/i));
      await user.type(screen.getByLabelText(/nombre del grupo/i), 'Mi Grupo');

      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'juanperez',
          email: 'juan@example.com',
          password: 'password123',
          firstName: 'Juan',
          lastName: 'Pérez',
          createGroup: true,
          groupName: 'Mi Grupo'
        });
      });
    });
  });

  describe('Loading State', () => {
    test('disables all inputs when loading', () => {
      render(<RegisterForm {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText(/nombre$/i)).toBeDisabled();
      expect(screen.getByLabelText(/apellido/i)).toBeDisabled();
      expect(screen.getByLabelText(/nombre de usuario/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/contraseña$/i)).toBeDisabled();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /inicia sesión aquí/i })).toBeDisabled();
    });

    test('shows loading text on submit button', () => {
      render(<RegisterForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/creando cuenta.../i)).toBeInTheDocument();
      expect(screen.queryByText(/^crear cuenta$/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('calls onSwitchToLogin when link is clicked', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /inicia sesión aquí/i }));

      expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and ARIA attributes', () => {
      render(<RegisterForm {...defaultProps} />);

      // Check that all inputs have labels
      expect(screen.getByLabelText(/nombre$/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/apellido/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/nombre de usuario/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/contraseña$/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/confirmar contraseña/i)).toHaveAttribute('id');
    });

    test('form is submittable via Enter key', async () => {
      const user = userEvent.setup();
      render(<RegisterForm {...defaultProps} />);

      await fillForm(user, {
        nombre: 'Juan',
        apellido: 'Pérez',
        'nombre de usuario': 'juanperez',
        email: 'juan@example.com',
        contraseña: 'password123',
        'confirmar contraseña': 'password123'
      });

      // Press Enter on the last input
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });
});
