const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event');
const { BrowserRouter } = require('react-router-dom');
const { useAuth } = require('../../src/context/AuthContext');
const { useData } = require('../../src/context/DataContext');
const GroupDashboard = require('../../src/components/Groups/GroupDashboard');

// Mock de los contextos
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/context/DataContext', () => ({
  useData: jest.fn()
}));

// Mock de fetch
global.fetch = jest.fn();

// Componente wrapper para las pruebas
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('GroupDashboard Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    group_id: 1,
    group_name: 'Test Group',
    role: 'student'
  };

  const mockGroupData = {
    id: 1,
    name: 'Test Group',
    description: 'A test group for testing',
    created_by: 2,
    member_count: 5,
    total_points: 500,
    created_at: '2024-01-01T00:00:00Z',
    members: [
      {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        total_points: 100,
        role: 'student'
      },
      {
        id: 2,
        username: 'leader',
        first_name: 'Group',
        last_name: 'Leader',
        total_points: 200,
        role: 'admin'
      }
    ]
  };

  const mockGroups = [
    mockGroupData,
    {
      id: 2,
      name: 'Another Group',
      description: 'Another test group',
      member_count: 3,
      total_points: 300
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    useData.mockReturnValue({
      groups: mockGroups,
      fetchGroups: jest.fn(),
      isLoading: false
    });

    fetch.mockClear();
  });

  describe('Group Display', () => {
    test('renders group dashboard with user group', () => {
      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Panel de Grupos')).toBeInTheDocument();
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('A test group for testing')).toBeInTheDocument();
    });

    test('shows loading state when groups are loading', () => {
      useData.mockReturnValue({
        groups: [],
        fetchGroups: jest.fn(),
        isLoading: true
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/cargando grupos/i)).toBeInTheDocument();
    });

    test('displays group statistics', () => {
      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('5')).toBeInTheDocument(); // member count
      expect(screen.getByText('500')).toBeInTheDocument(); // total points
    });

    test('shows no group message for users without group', () => {
      useAuth.mockReturnValue({
        user: { ...mockUser, group_id: null, group_name: null },
        isLoading: false
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/no perteneces a ningún grupo/i)).toBeInTheDocument();
      expect(screen.getByText(/únete a un grupo existente/i)).toBeInTheDocument();
    });
  });

  describe('Group Members', () => {
    test('displays group members list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGroupData
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Group Leader')).toBeInTheDocument();
      });
    });

    test('shows member points and roles', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGroupData
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('100 pts')).toBeInTheDocument();
        expect(screen.getByText('200 pts')).toBeInTheDocument();
        expect(screen.getByText('Administrador')).toBeInTheDocument();
      });
    });

    test('handles empty members list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockGroupData, members: [] }
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/no hay miembros en este grupo/i)).toBeInTheDocument();
      });
    });
  });

  describe('Group Actions', () => {
    test('allows leaving group', async () => {
      const user = userEvent.setup();

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockGroupData
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Has salido del grupo'
          })
        });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const leaveButton = screen.getByRole('button', { name: /salir del grupo/i });
      await user.click(leaveButton);

      // Confirm action
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/has salido del grupo exitosamente/i)).toBeInTheDocument();
      });
    });

    test('handles leave group error', async () => {
      const user = userEvent.setup();

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockGroupData
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            success: false,
            message: 'Error al salir del grupo'
          })
        });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const leaveButton = screen.getByRole('button', { name: /salir del grupo/i });
      await user.click(leaveButton);

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/error al salir del grupo/i)).toBeInTheDocument();
      });
    });

    test('cancels leave group action', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGroupData
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const leaveButton = screen.getByRole('button', { name: /salir del grupo/i });
      await user.click(leaveButton);

      // Cancel action
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      // Should still be in group
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('Join Group', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { ...mockUser, group_id: null, group_name: null },
        isLoading: false
      });
    });

    test('shows available groups to join', () => {
      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('Another Group')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /unirse/i })).toHaveLength(2);
    });

    test('successfully joins a group', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Te has unido al grupo'
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const joinButtons = screen.getAllByRole('button', { name: /unirse/i });
      await user.click(joinButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/te has unido al grupo exitosamente/i)).toBeInTheDocument();
      });
    });

    test('handles join group error', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'El grupo está lleno'
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const joinButtons = screen.getAllByRole('button', { name: /unirse/i });
      await user.click(joinButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/el grupo está lleno/i)).toBeInTheDocument();
      });
    });

    test('filters groups by search', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/buscar grupos/i);
      await user.type(searchInput, 'Test');

      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.queryByText('Another Group')).not.toBeInTheDocument();
    });
  });

  describe('Create Group', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { ...mockUser, group_id: null, group_name: null },
        isLoading: false
      });
    });

    test('shows create group form', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const createButton = screen.getByRole('button', { name: /crear nuevo grupo/i });
      await user.click(createButton);

      expect(screen.getByLabelText(/nombre del grupo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    });

    test('validates group creation form', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const createButton = screen.getByRole('button', { name: /crear nuevo grupo/i });
      await user.click(createButton);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /crear grupo/i });
      await user.click(submitButton);

      expect(screen.getByText(/nombre del grupo es requerido/i)).toBeInTheDocument();
    });

    test('successfully creates group', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          group: {
            id: 3,
            name: 'New Group',
            description: 'A new test group'
          }
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const createButton = screen.getByRole('button', { name: /crear nuevo grupo/i });
      await user.click(createButton);

      // Fill form
      await user.type(screen.getByLabelText(/nombre del grupo/i), 'New Group');
      await user.type(screen.getByLabelText(/descripción/i), 'A new test group');

      const submitButton = screen.getByRole('button', { name: /crear grupo/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/grupo creado exitosamente/i)).toBeInTheDocument();
      });
    });

    test('handles create group error', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Nombre de grupo ya existe'
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      const createButton = screen.getByRole('button', { name: /crear nuevo grupo/i });
      await user.click(createButton);

      // Fill form
      await user.type(screen.getByLabelText(/nombre del grupo/i), 'Existing Group');
      await user.type(screen.getByLabelText(/descripción/i), 'Test description');

      const submitButton = screen.getByRole('button', { name: /crear grupo/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nombre de grupo ya existe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Group Management (Admin)', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { ...mockUser, role: 'admin' },
        isLoading: false
      });
    });

    test('shows admin actions for group leader', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGroupData
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /editar grupo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /eliminar grupo/i })).toBeInTheDocument();
      });
    });

    test('allows editing group information', async () => {
      const user = userEvent.setup();

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockGroupData
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Grupo actualizado'
          })
        });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /editar grupo/i });
        return user.click(editButton);
      });

      // Update group name
      const nameInput = screen.getByDisplayValue('Test Group');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Group');

      const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/grupo actualizado exitosamente/i)).toBeInTheDocument();
      });
    });

    test('allows removing members from group', async () => {
      const user = userEvent.setup();

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockGroupData
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Miembro eliminado'
          })
        });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const removeButtons = screen.getAllByRole('button', { name: /eliminar miembro/i });
        return user.click(removeButtons[0]);
      });

      // Confirm removal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/miembro eliminado exitosamente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles network errors when fetching group data', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error al cargar datos del grupo/i)).toBeInTheDocument();
      });
    });

    test('handles API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: 'Error interno del servidor'
        })
      });

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error interno del servidor/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Panel de grupos');
      expect(screen.getByRole('button', { name: /salir del grupo/i })).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /salir del grupo/i })).toHaveFocus();
    });

    test('provides proper headings structure', () => {
      render(
        <TestWrapper>
          <GroupDashboard />
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { level: 1, name: /panel de grupos/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /mi grupo/i })).toBeInTheDocument();
    });
  });
});
