const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event');
const { BrowserRouter } = require('react-router-dom');
const { useAuth } = require('../../src/context/AuthContext');
const UserProfile = require('../../src/components/Profile/UserProfile');

// Mock del contexto de autenticación
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock de fetch para las llamadas API
global.fetch = jest.fn();

// Componente wrapper para las pruebas
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UserProfile Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    group_id: 1,
    group_name: 'Test Group',
    total_points: 150,
    role: 'student'
  };

  const mockUpdateProfile = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      logout: mockLogout,
      isLoading: false
    });

    fetch.mockClear();
  });

  describe('Profile Display', () => {
    test('renders user profile information', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument();
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('User')).toBeInTheDocument();
    });

    test('displays user statistics', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText('Puntos Totales')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    test('shows loading state when user is loading', () => {
      useAuth.mockReturnValue({
        user: null,
        updateProfile: mockUpdateProfile,
        logout: mockLogout,
        isLoading: true
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    test('handles missing user data gracefully', () => {
      useAuth.mockReturnValue({
        user: null,
        updateProfile: mockUpdateProfile,
        logout: mockLogout,
        isLoading: false
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument();
    });
  });

  describe('Profile Editing', () => {
    test('enables edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    test('updates form fields in edit mode', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Update first name
      const firstNameInput = screen.getByDisplayValue('Test');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');

      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });

    test('cancels edit mode and reverts changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Make changes
      const firstNameInput = screen.getByDisplayValue('Test');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      // Verify original value restored
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument();
    });
  });

  describe('Profile Update', () => {
    test('successfully updates profile', async () => {
      const user = userEvent.setup();
      const updatedUser = { ...mockUser, first_name: 'Updated' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: updatedUser
        })
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Update first name
      const firstNameInput = screen.getByDisplayValue('Test');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(updatedUser);
      });

      expect(screen.getByText(/perfil actualizado exitosamente/i)).toBeInTheDocument();
    });

    test('handles profile update error', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Error al actualizar perfil'
        })
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode and try to save
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error al actualizar perfil/i)).toBeInTheDocument();
      });
    });

    test('handles network error during update', async () => {
      const user = userEvent.setup();

      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode and try to save
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Clear required field
      const usernameInput = screen.getByDisplayValue('testuser');
      await user.clear(usernameInput);

      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      expect(screen.getByText(/nombre de usuario es requerido/i)).toBeInTheDocument();
    });

    test('validates email format', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Enter invalid email
      const emailInput = screen.getByDisplayValue('test@example.com');
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });

    test('validates username length', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Enter short username
      const usernameInput = screen.getByDisplayValue('testuser');
      await user.clear(usernameInput);
      await user.type(usernameInput, 'ab'); // Too short

      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      expect(screen.getByText(/nombre de usuario debe tener al menos 3 caracteres/i)).toBeInTheDocument();
    });

    test('validates name fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      // Clear first name
      const firstNameInput = screen.getByDisplayValue('Test');
      await user.clear(firstNameInput);

      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
    });
  });

  describe('Password Change', () => {
    test('shows password change form when requested', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      const changePasswordButton = screen.getByRole('button', { name: /cambiar contraseña/i });
      await user.click(changePasswordButton);

      expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toBeInTheDocument();
    });

    test('validates password change form', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Open password change form
      const changePasswordButton = screen.getByRole('button', { name: /cambiar contraseña/i });
      await user.click(changePasswordButton);

      // Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      expect(screen.getByText(/contraseña actual es requerida/i)).toBeInTheDocument();
    });

    test('validates password confirmation match', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Open password change form
      const changePasswordButton = screen.getByRole('button', { name: /cambiar contraseña/i });
      await user.click(changePasswordButton);

      // Fill form with mismatched passwords
      await user.type(screen.getByLabelText(/contraseña actual/i), 'oldpass');
      await user.type(screen.getByLabelText(/nueva contraseña/i), 'newpass123');
      await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'different123');

      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    test('successfully changes password', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Contraseña actualizada'
        })
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Open password change form
      const changePasswordButton = screen.getByRole('button', { name: /cambiar contraseña/i });
      await user.click(changePasswordButton);

      // Fill form correctly
      await user.type(screen.getByLabelText(/contraseña actual/i), 'oldpass');
      await user.type(screen.getByLabelText(/nueva contraseña/i), 'newpass123');
      await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'newpass123');

      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/contraseña actualizada exitosamente/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Statistics', () => {
    test('fetches and displays user statistics', async () => {
      const mockStats = {
        flags_solved: 5,
        games_completed: 2,
        total_time_played: 3600,
        ranking_position: 10,
        recent_activity: [
          {
            type: 'flag_solved',
            name: 'Test Flag',
            date: new Date().toISOString(),
            points: 10
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStats
        })
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // flags solved
        expect(screen.getByText('2')).toBeInTheDocument(); // games completed
        expect(screen.getByText('#10')).toBeInTheDocument(); // ranking
      });
    });

    test('handles statistics loading error', async () => {
      fetch.mockRejectedValueOnce(new Error('Stats error'));

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error al cargar estadísticas/i)).toBeInTheDocument();
      });
    });
  });

  describe('Group Management', () => {
    test('shows group information for group members', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    test('shows no group message for users without group', () => {
      useAuth.mockReturnValue({
        user: { ...mockUser, group_id: null, group_name: null },
        updateProfile: mockUpdateProfile,
        logout: mockLogout,
        isLoading: false
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText(/no perteneces a ningún grupo/i)).toBeInTheDocument();
    });

    test('allows leaving group', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Has salido del grupo'
        })
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      const leaveGroupButton = screen.getByRole('button', { name: /salir del grupo/i });
      await user.click(leaveGroupButton);

      // Confirm action
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/has salido del grupo exitosamente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Perfil de usuario');
      expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      
      // Tab to the button
      await user.tab();
      expect(editButton).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
    });

    test('provides proper form labels', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);

      expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    });
  });
});
