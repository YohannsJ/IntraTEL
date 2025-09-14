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

// Mock de JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 1 })
}));

// Mock de crypto para flag encryption
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('hashed_flag_value')
    })
  })
}));

const app = require('../../server/server');

describe('Flags Endpoints', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'student'
  };

  const mockAdmin = {
    id: 2,
    email: 'admin@example.com',
    role: 'admin'
  };

  const mockFlag = {
    id: 1,
    name: 'Test Flag',
    description: 'A test flag for students',
    flag_value: 'hashed_flag_value',
    points: 10,
    category: 'testing',
    difficulty: 'easy',
    created_by: 2,
    is_active: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.prepare().get.mockReturnValue(mockUser);
  });

  describe('GET /api/flags/user', () => {
    test('returns available flags for user', async () => {
      const availableFlags = [
        {
          id: 1,
          name: 'Test Flag',
          description: 'A test flag',
          points: 10,
          category: 'testing',
          difficulty: 'easy',
          is_solved: 0
        },
        {
          id: 2,
          name: 'Solved Flag',
          description: 'Already solved',
          points: 15,
          category: 'networking',
          difficulty: 'medium',
          is_solved: 1
        }
      ];

      mockDb.prepare().all.mockReturnValue(availableFlags);

      const response = await request(app)
        .get('/api/flags/user')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        name: 'Test Flag',
        points: 10,
        is_solved: false
      });
      expect(response.body.data[1].is_solved).toBe(true);
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .get('/api/flags/user')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token de acceso requerido/i);
    });

    test('handles empty flags list', async () => {
      mockDb.prepare().all.mockReturnValue([]);

      const response = await request(app)
        .get('/api/flags/user')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/flags/submit', () => {
    const submitData = {
      flag_id: 1,
      flag_value: 'correct_flag'
    };

    test('successfully submits correct flag', async () => {
      // Mock flag exists and user hasn't solved it
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(mockFlag) // Flag exists
        .mockReturnValueOnce(null); // User hasn't solved it

      // Mock correct flag value
      const crypto = require('crypto');
      crypto.createHash().update().digest.mockReturnValue('hashed_flag_value');

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(submitData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.is_correct).toBe(true);
      expect(response.body.points_earned).toBe(10);
      expect(response.body.message).toMatch(/flag correcta/i);
    });

    test('handles incorrect flag submission', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(mockFlag)
        .mockReturnValueOnce(null);

      // Mock incorrect flag value
      const crypto = require('crypto');
      crypto.createHash().update().digest.mockReturnValue('wrong_hash');

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({ ...submitData, flag_value: 'wrong_flag' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.is_correct).toBe(false);
      expect(response.body.points_earned).toBe(0);
      expect(response.body.message).toMatch(/flag incorrecta/i);
    });

    test('rejects submission for non-existent flag', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null); // Flag doesn't exist

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({ ...submitData, flag_id: 999 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/flag no encontrada/i);
    });

    test('rejects submission for already solved flag', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(mockFlag)
        .mockReturnValueOnce({ // User already solved it
          id: 1,
          user_id: 1,
          flag_id: 1,
          is_correct: 1
        });

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(submitData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/ya has resuelto esta flag/i);
    });

    test('validates required fields', async () => {
      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({ flag_id: 1 }) // Missing flag_value
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/flag_id y flag_value son requeridos/i);
    });

    test('handles inactive flags', async () => {
      const inactiveFlag = {
        ...mockFlag,
        is_active: 0
      };

      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(inactiveFlag);

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(submitData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/flag no está activa/i);
    });
  });

  describe('GET /api/flags/admin/all', () => {
    test('returns all flags for admin', async () => {
      mockDb.prepare().get.mockReturnValue(mockAdmin);
      
      const allFlags = [
        mockFlag,
        {
          id: 2,
          name: 'Another Flag',
          description: 'Another test flag',
          points: 15,
          is_active: 0
        }
      ];

      mockDb.prepare().all.mockReturnValue(allFlags);

      const response = await request(app)
        .get('/api/flags/admin/all')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('flag_value'); // Admin sees encrypted values
    });

    test('rejects access for non-admin', async () => {
      const response = await request(app)
        .get('/api/flags/admin/all')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no tienes permisos/i);
    });
  });

  describe('POST /api/flags/admin/create', () => {
    const createFlagData = {
      name: 'New Flag',
      description: 'A new test flag',
      flag_value: 'new_flag_answer',
      points: 20,
      category: 'new_category',
      difficulty: 'hard'
    };

    test('successfully creates flag as admin', async () => {
      mockDb.prepare().get.mockReturnValue(mockAdmin);
      mockDb.prepare().run.mockReturnValue({ lastInsertRowid: 3 });

      const response = await request(app)
        .post('/api/flags/admin/create')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(createFlagData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.flag).toMatchObject({
        id: 3,
        name: 'New Flag',
        points: 20
      });
    });

    test('rejects flag creation by non-admin', async () => {
      const response = await request(app)
        .post('/api/flags/admin/create')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(createFlagData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no tienes permisos/i);
    });

    test('validates required fields', async () => {
      mockDb.prepare().get.mockReturnValue(mockAdmin);

      const incompleteData = {
        name: 'Incomplete Flag'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/flags/admin/create')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/todos los campos son requeridos/i);
    });

    test('validates flag name length', async () => {
      mockDb.prepare().get.mockReturnValue(mockAdmin);

      const invalidData = {
        ...createFlagData,
        name: 'AB' // Too short
      };

      const response = await request(app)
        .post('/api/flags/admin/create')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/nombre debe tener al menos/i);
    });

    test('validates points value', async () => {
      mockDb.prepare().get.mockReturnValue(mockAdmin);

      const invalidData = {
        ...createFlagData,
        points: -5 // Negative points
      };

      const response = await request(app)
        .post('/api/flags/admin/create')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/puntos deben ser un número positivo/i);
    });

    test('validates difficulty level', async () => {
      mockDb.prepare().get.mockReturnValue(mockAdmin);

      const invalidData = {
        ...createFlagData,
        difficulty: 'invalid'
      };

      const response = await request(app)
        .post('/api/flags/admin/create')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/dificultad debe ser/i);
    });
  });

  describe('PUT /api/flags/admin/:id/toggle', () => {
    test('successfully toggles flag status as admin', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockAdmin) // Auth check
        .mockReturnValueOnce(mockFlag); // Flag exists

      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .put('/api/flags/admin/1/toggle')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/estado de la flag actualizado/i);
    });

    test('rejects toggle by non-admin', async () => {
      const response = await request(app)
        .put('/api/flags/admin/1/toggle')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/no tienes permisos/i);
    });

    test('returns 404 for non-existent flag', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockAdmin)
        .mockReturnValueOnce(null); // Flag doesn't exist

      const response = await request(app)
        .put('/api/flags/admin/999/toggle')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/flag no encontrada/i);
    });
  });

  describe('GET /api/flags/stats', () => {
    test('returns flag statistics', async () => {
      const flagStats = [
        {
          flag_id: 1,
          flag_name: 'Test Flag',
          total_attempts: 25,
          correct_attempts: 15,
          success_rate: 0.6
        }
      ];

      mockDb.prepare().all.mockReturnValue(flagStats);

      const response = await request(app)
        .get('/api/flags/stats')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        flag_name: 'Test Flag',
        total_attempts: 25,
        success_rate: 0.6
      });
    });
  });

  describe('Error Handling', () => {
    test('handles database errors in flag submission', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(mockFlag)
        .mockReturnValueOnce(null);

      // Mock database error
      mockDb.prepare().run.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({
          flag_id: 1,
          flag_value: 'test'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });

    test('handles encryption errors', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(mockFlag)
        .mockReturnValueOnce(null);

      // Mock crypto error
      const crypto = require('crypto');
      crypto.createHash.mockImplementation(() => {
        throw new Error('Crypto error');
      });

      const response = await request(app)
        .post('/api/flags/submit')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({
          flag_id: 1,
          flag_value: 'test'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });
  });
});
