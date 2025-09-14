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

const app = require('../../server/server');

describe('Games Endpoints', () => {
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

  const mockGameProgress = {
    id: 1,
    user_id: 1,
    game_type: 'nand_gates',
    level: 5,
    progress_data: JSON.stringify({
      completed_levels: [1, 2, 3, 4, 5],
      current_score: 100
    }),
    points_earned: 50,
    is_completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.prepare().get.mockReturnValue(mockUser);
  });

  describe('GET /api/games/progress', () => {
    test('returns user game progress', async () => {
      const userProgress = [
        mockGameProgress,
        {
          id: 2,
          user_id: 1,
          game_type: 'circuit_builder',
          level: 3,
          progress_data: JSON.stringify({
            completed_levels: [1, 2, 3],
            current_score: 75
          }),
          points_earned: 30,
          is_completed: 1
        }
      ];

      mockDb.prepare().all.mockReturnValue(userProgress);

      const response = await request(app)
        .get('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        game_type: 'nand_gates',
        level: 5,
        points_earned: 50
      });
      expect(response.body.data[1].is_completed).toBe(true);
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .get('/api/games/progress')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token de acceso requerido/i);
    });

    test('handles user with no game progress', async () => {
      mockDb.prepare().all.mockReturnValue([]);

      const response = await request(app)
        .get('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/games/progress/:gameType', () => {
    test('returns specific game progress', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(mockGameProgress); // Game progress

      const response = await request(app)
        .get('/api/games/progress/nand_gates')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        game_type: 'nand_gates',
        level: 5,
        points_earned: 50
      });
      expect(response.body.data.progress_data).toBeInstanceOf(Object);
    });

    test('returns null for game not started', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null); // No progress found

      const response = await request(app)
        .get('/api/games/progress/new_game')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });

    test('validates game type parameter', async () => {
      const response = await request(app)
        .get('/api/games/progress/invalid-game-type!')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/tipo de juego inválido/i);
    });
  });

  describe('POST /api/games/progress', () => {
    const progressData = {
      game_type: 'nand_gates',
      level: 6,
      progress_data: {
        completed_levels: [1, 2, 3, 4, 5, 6],
        current_score: 120,
        time_spent: 1800
      },
      points_earned: 10
    };

    test('creates new game progress', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(null); // No existing progress

      mockDb.prepare().run.mockReturnValue({ lastInsertRowid: 3 });

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(progressData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.progress).toMatchObject({
        id: 3,
        game_type: 'nand_gates',
        level: 6
      });
    });

    test('updates existing game progress', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(mockGameProgress); // Existing progress

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(progressData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/progreso actualizado/i);
    });

    test('validates required fields', async () => {
      const incompleteData = {
        game_type: 'nand_gates'
        // Missing level and progress_data
      };

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/game_type, level y progress_data son requeridos/i);
    });

    test('validates game type format', async () => {
      const invalidData = {
        ...progressData,
        game_type: 'invalid-game!'
      };

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/tipo de juego inválido/i);
    });

    test('validates level range', async () => {
      const invalidData = {
        ...progressData,
        level: 0 // Invalid level
      };

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/nivel debe ser mayor a 0/i);
    });

    test('validates points earned', async () => {
      const invalidData = {
        ...progressData,
        points_earned: -10 // Negative points
      };

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/puntos deben ser mayor o igual a 0/i);
    });

    test('automatically marks game as completed at max level', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null);

      const completionData = {
        ...progressData,
        level: 20 // Max level for most games
      };

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(completionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.progress.is_completed).toBe(true);
    });
  });

  describe('DELETE /api/games/progress/:gameType', () => {
    test('successfully resets game progress', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser) // Auth check
        .mockReturnValueOnce(mockGameProgress); // Game exists

      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/games/progress/nand_gates')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/progreso del juego eliminado/i);
    });

    test('handles resetting non-existent game progress', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null); // No progress exists

      const response = await request(app)
        .delete('/api/games/progress/nonexistent_game')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/progreso del juego no encontrado/i);
    });

    test('validates game type parameter', async () => {
      const response = await request(app)
        .delete('/api/games/progress/invalid-game!')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/tipo de juego inválido/i);
    });
  });

  describe('GET /api/games/leaderboard/:gameType', () => {
    test('returns game leaderboard', async () => {
      const leaderboardData = [
        {
          user_id: 1,
          username: 'player1',
          level: 10,
          points_earned: 100,
          completion_time: 3600,
          is_completed: 1
        },
        {
          user_id: 2,
          username: 'player2',
          level: 8,
          points_earned: 80,
          completion_time: null,
          is_completed: 0
        }
      ];

      mockDb.prepare().all.mockReturnValue(leaderboardData);

      const response = await request(app)
        .get('/api/games/leaderboard/nand_gates')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        username: 'player1',
        level: 10,
        points_earned: 100
      });
    });

    test('handles empty leaderboard', async () => {
      mockDb.prepare().all.mockReturnValue([]);

      const response = await request(app)
        .get('/api/games/leaderboard/new_game')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    test('validates game type parameter', async () => {
      const response = await request(app)
        .get('/api/games/leaderboard/invalid-game!')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/tipo de juego inválido/i);
    });
  });

  describe('GET /api/games/stats', () => {
    test('returns overall game statistics', async () => {
      const gameStats = [
        {
          game_type: 'nand_gates',
          total_players: 25,
          average_level: 6.5,
          completion_rate: 0.4,
          total_points: 1250
        },
        {
          game_type: 'circuit_builder',
          total_players: 15,
          average_level: 4.2,
          completion_rate: 0.6,
          total_points: 800
        }
      ];

      mockDb.prepare().all.mockReturnValue(gameStats);

      const response = await request(app)
        .get('/api/games/stats')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        game_type: 'nand_gates',
        total_players: 25,
        completion_rate: 0.4
      });
    });
  });

  describe('Admin Endpoints', () => {
    describe('GET /api/games/admin/all-progress', () => {
      test('returns all user progress for admin', async () => {
        mockDb.prepare().get.mockReturnValue(mockAdmin);
        
        const allProgress = [
          {
            ...mockGameProgress,
            username: 'player1'
          },
          {
            id: 2,
            user_id: 2,
            username: 'player2',
            game_type: 'circuit_builder',
            level: 3,
            points_earned: 30
          }
        ];

        mockDb.prepare().all.mockReturnValue(allProgress);

        const response = await request(app)
          .get('/api/games/admin/all-progress')
          .set('Authorization', 'Bearer fake-jwt-token')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toHaveProperty('username');
      });

      test('rejects access for non-admin', async () => {
        const response = await request(app)
          .get('/api/games/admin/all-progress')
          .set('Authorization', 'Bearer fake-jwt-token')
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/no tienes permisos/i);
      });
    });

    describe('DELETE /api/games/admin/progress/:userId/:gameType', () => {
      test('admin can reset any user progress', async () => {
        mockDb.prepare().get.mockReturnValue(mockAdmin);
        mockDb.prepare().run.mockReturnValue({ changes: 1 });

        const response = await request(app)
          .delete('/api/games/admin/progress/1/nand_gates')
          .set('Authorization', 'Bearer fake-jwt-token')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toMatch(/progreso del usuario eliminado/i);
      });

      test('rejects access for non-admin', async () => {
        const response = await request(app)
          .delete('/api/games/admin/progress/1/nand_gates')
          .set('Authorization', 'Bearer fake-jwt-token')
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/no tienes permisos/i);
      });

      test('validates user ID parameter', async () => {
        mockDb.prepare().get.mockReturnValue(mockAdmin);

        const response = await request(app)
          .delete('/api/games/admin/progress/invalid/nand_gates')
          .set('Authorization', 'Bearer fake-jwt-token')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/ID de usuario inválido/i);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles database errors in progress creation', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null);

      // Mock database error
      mockDb.prepare().run.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({
          game_type: 'test_game',
          level: 1,
          progress_data: {}
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });

    test('handles invalid JSON in progress_data', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null);

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({
          game_type: 'test_game',
          level: 1,
          progress_data: 'invalid json'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/progress_data debe ser un objeto/i);
    });

    test('handles extremely large progress data', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null);

      // Create a large object to test size limits
      const largeData = {};
      for (let i = 0; i < 10000; i++) {
        largeData[`key_${i}`] = `value_${i}`.repeat(100);
      }

      const response = await request(app)
        .post('/api/games/progress')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({
          game_type: 'test_game',
          level: 1,
          progress_data: largeData
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/datos de progreso demasiado grandes/i);
    });
  });
});
