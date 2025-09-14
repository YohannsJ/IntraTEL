const request = require('supertest');
const path = require('path');

// Mock de la base de datos para tests
const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn().mockReturnValue({ 
      lastInsertRowid: 1, 
      changes: 1 
    })
  }),
  exec: jest.fn()
};

// Mock del módulo de base de datos
jest.mock('../../server/config/database', () => ({
  getInstance: () => mockDb
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 1 })
}));

const app = require('../../server/server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Authentication Endpoints', () => {
  let server;

  beforeAll(() => {
    // Configurar variables de entorno para tests
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    test('successfully registers a new user', async () => {
      // Mock que el usuario no existe
      mockDb.prepare().get.mockReturnValue(null);
      
      // Mock inserción exitosa
      mockDb.prepare().run.mockReturnValue({ 
        lastInsertRowid: 1, 
        changes: 1 
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('fake-jwt-token');
      expect(response.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1 }, 
        'test-secret', 
        { expiresIn: '7d' }
      );
    });

    test('rejects registration with existing email', async () => {
      // Mock que el usuario ya existe
      mockDb.prepare().get.mockReturnValue({
        id: 1,
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/email ya está registrado/i);
    });

    test('validates required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/requeridos/i);
    });

    test('validates email format', async () => {
      const invalidEmailData = {
        ...validRegisterData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/email inválido/i);
    });

    test('validates password length', async () => {
      const shortPasswordData = {
        ...validRegisterData,
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(shortPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/contraseña debe tener/i);
    });

    test('handles group code registration', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(null) // User doesn't exist
        .mockReturnValueOnce({ // Group exists
          id: 1,
          name: 'Test Group',
          invitation_code: 'TEST123'
        });

      const dataWithGroupCode = {
        ...validRegisterData,
        groupCode: 'TEST123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(dataWithGroupCode)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.group_id).toBe(1);
    });

    test('handles invalid group code', async () => {
      mockDb.prepare().get
        .mockReturnValueOnce(null) // User doesn't exist
        .mockReturnValueOnce(null); // Group doesn't exist

      const dataWithInvalidGroupCode = {
        ...validRegisterData,
        groupCode: 'INVALID'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(dataWithInvalidGroupCode)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/código de grupo inválido/i);
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password_hash: 'hashedpassword',
      name: 'Test User',
      role: 'student'
    };

    test('successfully logs in with valid credentials', async () => {
      mockDb.prepare().get.mockReturnValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('fake-jwt-token');
      expect(response.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1 }, 
        'test-secret', 
        { expiresIn: '7d' }
      );
    });

    test('rejects login with non-existent email', async () => {
      mockDb.prepare().get.mockReturnValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/credenciales inválidas/i);
    });

    test('rejects login with incorrect password', async () => {
      mockDb.prepare().get.mockReturnValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/credenciales inválidas/i);
    });

    test('validates required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/email y contraseña son requeridos/i);
    });
  });

  describe('GET /api/auth/verify', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      role: 'student'
    };

    test('successfully verifies valid token', async () => {
      mockDb.prepare().get.mockReturnValue(mockUser);
      jwt.verify.mockReturnValue({ userId: 1 });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com'
      });

      expect(jwt.verify).toHaveBeenCalledWith('fake-jwt-token', 'test-secret');
    });

    test('rejects request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token de acceso requerido/i);
    });

    test('rejects invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token inválido/i);
    });

    test('rejects token for non-existent user', async () => {
      mockDb.prepare().get.mockReturnValue(null);
      jwt.verify.mockReturnValue({ userId: 999 });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer fake-jwt-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token inválido/i);
    });
  });

  describe('PUT /api/auth/profile', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      role: 'student'
    };

    beforeEach(() => {
      // Mock middleware de autenticación
      mockDb.prepare().get.mockReturnValue(mockUser);
      jwt.verify.mockReturnValue({ userId: 1 });
    });

    test('successfully updates user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      mockDb.prepare().run.mockReturnValue({ changes: 1 });
      mockDb.prepare().get.mockReturnValue({
        ...mockUser,
        ...updateData
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.email).toBe('updated@example.com');
    });

    test('validates email format in update', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/email inválido/i);
    });

    test('requires authentication', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token de acceso requerido/i);
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });

    test('handles JWT signing errors', async () => {
      mockDb.prepare().get.mockReturnValue(null);
      mockDb.prepare().run.mockReturnValue({ lastInsertRowid: 1 });
      jwt.sign.mockImplementation(() => {
        throw new Error('JWT error');
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/error interno del servidor/i);
    });
  });
});
