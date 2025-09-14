const request = require('supertest');

// Mock de la base de datos
const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn().mockReturnValue({ 
      lastInsertRowid: 1, 
      changes: 1 
    })
  })
};

jest.mock('../../server/config/database', () => ({
  getInstance: () => mockDb
}));

// Mock de JWT para middleware de auth
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 1 })
}));

const app = require('../../server/server');

describe('Groups Endpoints', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'student'
  };

  const mockTeacher = {
    id: 2,
    email: 'teacher@example.com',
    role: 'teacher'
  };

  const mockGroup = {
    id: 1,
    name: 'Test Group',
    description: 'A test group',
    invitation_code: 'TEST123',
    created_by: 2,
    created_at: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock usuario autenticado por defecto
    mockDb.prepare().get.mockReturnValue(mockUser);
  });

  describe('GET /api/groups', () => {
    test('returns list of available groups', async () => {
      mockDb.prepare().all.mockReturnValue([
        {
          ...mockGroup,
          member_count: 5
        }
      ]);

      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: 1,
        name: 'Test Group',
        member_count: 5
      });
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .get('/api/groups')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token de acceso requerido/i);
    });

    test('handles empty groups list', async () => {
      mockDb.prepare().all.mockReturnValue([]);

      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/groups', () => {
    const validGroupData = {
      name: 'New Group',
      description: 'A new test group'
    };

    test('successfully creates group as teacher', async () => {
      // Mock teacher user
      mockDb.prepare().get.mockReturnValue(mockTeacher);
      
      // Mock group creation
      mockDb.prepare().run.mockReturnValue({ lastInsertRowid: 1 });
      
      // Mock invitation code generation and verification
      mockDb.prepare().get
        .mockReturnValueOnce(mockTeacher) // Auth check
        .mockReturnValueOnce(null) // Code doesn't exist (first call)
        .mockReturnValueOnce({ // Return created group
          id: 1,
          ...validGroupData,
          invitation_code: 'ABC123',
          created_by: 2
        });

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(validGroupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.group).toMatchObject({
        name: 'New Group',
        description: 'A new test group'
      });
      expect(response.body.group.invitation_code).toMatch(/^[A-Z0-9]{6}$/);
    });

    test('rejects group creation by student', async () => {
      // Mock student user (default mockUser)
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(validGroupData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no tienes permisos/i);
    });

    test('validates required group name', async () => {
      mockDb.prepare().get.mockReturnValue(mockTeacher);

      const invalidData = {
        description: 'A group without name'
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/nombre del grupo es requerido/i);
    });

    test('validates group name length', async () => {
      mockDb.prepare().get.mockReturnValue(mockTeacher);

      const invalidData = {
        name: 'AB', // Too short
        description: 'Test'
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/nombre debe tener al menos/i);
    });

    test('generates unique invitation codes', async () => {
      mockDb.prepare().get.mockReturnValue(mockTeacher);
      
      // Mock that first generated code exists, second doesn't
      mockDb.prepare().get
        .mockReturnValueOnce(mockTeacher) // Auth check
        .mockReturnValueOnce({ id: 1 }) // First code exists
        .mockReturnValueOnce(null) // Second code doesn't exist
        .mockReturnValueOnce({ // Return created group
          id: 1,
          ...validGroupData,
          invitation_code: 'DEF456'
        });

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(validGroupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.group.invitation_code).toBeDefined();
    });
  });

  describe('POST /api/groups/join', () => {
    const joinData = {
      invitation_code: 'TEST123'
    };

    test('successfully joins group with valid code', async () => {
      // Mock group exists
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(mockGroup); // Group exists

      const response = await request(app)
        .post('/api/groups/join')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(joinData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/te has unido al grupo/i);
      expect(response.body.group).toMatchObject({
        id: 1,
        name: 'Test Group'
      });
    });

    test('rejects invalid invitation code', async () => {
      // Mock group doesn't exist
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(null); // Group doesn't exist

      const response = await request(app)
        .post('/api/groups/join')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({ invitation_code: 'INVALID' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/código de invitación inválido/i);
    });

    test('rejects if user already in group', async () => {
      const userInGroup = {
        ...mockUser,
        group_id: 1
      };

      mockDb.prepare().get.mockReturnValue(userInGroup);

      const response = await request(app)
        .post('/api/groups/join')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(joinData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/ya perteneces a un grupo/i);
    });

    test('validates invitation code format', async () => {
      const response = await request(app)
        .post('/api/groups/join')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({ invitation_code: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/código de invitación es requerido/i);
    });

    test('handles database errors during join', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(mockGroup);

      // Mock database error on update
      mockDb.prepare().run.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/groups/join')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(joinData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });
  });

  describe('POST /api/groups/leave', () => {
    test('successfully leaves group', async () => {
      const userInGroup = {
        ...mockUser,
        group_id: 1
      };

      mockDb.prepare().get.mockReturnValue(userInGroup);
      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .post('/api/groups/leave')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/has salido del grupo/i);
    });

    test('rejects if user not in group', async () => {
      const response = await request(app)
        .post('/api/groups/leave')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no perteneces a ningún grupo/i);
    });

    test('handles database errors during leave', async () => {
      const userInGroup = {
        ...mockUser,
        group_id: 1
      };

      mockDb.prepare().get.mockReturnValue(userInGroup);
      mockDb.prepare().run.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/groups/leave')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });
  });

  describe('GET /api/groups/:id/members', () => {
    test('returns group members for group creator', async () => {
      const groupCreator = {
        ...mockTeacher,
        id: 2
      };

      mockDb.prepare().get
        .mockReturnValueOnce(groupCreator) // Auth check
        .mockReturnValueOnce(mockGroup); // Group exists and user is creator

      mockDb.prepare().all.mockReturnValue([
        {
          id: 1,
          username: 'student1',
          name: 'Student One',
          email: 'student1@example.com'
        },
        {
          id: 3,
          username: 'student2',
          name: 'Student Two',
          email: 'student2@example.com'
        }
      ]);

      const response = await request(app)
        .get('/api/groups/1/members')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.members).toHaveLength(2);
      expect(response.body.members[0]).toMatchObject({
        username: 'student1',
        name: 'Student One'
      });
    });

    test('rejects access for non-creator', async () => {
      const otherGroup = {
        ...mockGroup,
        created_by: 999 // Different creator
      };

      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(otherGroup); // Group exists but user is not creator

      const response = await request(app)
        .get('/api/groups/1/members')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no tienes permisos/i);
    });

    test('returns 404 for non-existent group', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(null); // Group doesn't exist

      const response = await request(app)
        .get('/api/groups/999/members')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/grupo no encontrado/i);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    test('successfully deletes group as creator', async () => {
      const groupCreator = {
        ...mockTeacher,
        id: 2
      };

      mockDb.prepare().get
        .mockReturnValueOnce(groupCreator) // Auth check
        .mockReturnValueOnce(mockGroup); // Group exists and user is creator

      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/groups/1')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/grupo eliminado/i);
    });

    test('rejects deletion by non-creator', async () => {
      const otherGroup = {
        ...mockGroup,
        created_by: 999
      };

      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(otherGroup);

      const response = await request(app)
        .delete('/api/groups/1')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no tienes permisos/i);
    });
  });
});
