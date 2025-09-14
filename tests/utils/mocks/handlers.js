import { rest } from 'msw';

// Handlers para simular API responses en tests
export const handlers = [
  // Auth endpoints
  rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          success: true,
          token: 'fake-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'student'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Credenciales inválidas'
      })
    );
  }),

  rest.post('http://localhost:3001/api/auth/register', (req, res, ctx) => {
    const { email, username, password } = req.body;
    
    if (email === 'existing@example.com') {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: 'Email ya registrado'
        })
      );
    }
    
    return res(
      ctx.json({
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 2,
          email,
          name: username,
          role: 'student'
        }
      })
    );
  }),

  rest.get('http://localhost:3001/api/auth/verify', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.includes('fake-jwt-token')) {
      return res(
        ctx.json({
          success: true,
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'student'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Token inválido'
      })
    );
  }),

  // Groups endpoints
  rest.get('http://localhost:3001/api/groups', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 1,
            name: 'Grupo Test',
            description: 'Grupo de prueba',
            invitation_code: 'TEST123',
            member_count: 5
          }
        ]
      })
    );
  }),

  rest.post('http://localhost:3001/api/groups/join', (req, res, ctx) => {
    const { invitation_code } = req.body;
    
    if (invitation_code === 'INVALID') {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: 'Código de invitación inválido'
        })
      );
    }
    
    return res(
      ctx.json({
        success: true,
        message: 'Te has unido al grupo exitosamente',
        group: {
          id: 1,
          name: 'Grupo Test'
        }
      })
    );
  }),

  // Flags endpoints
  rest.get('http://localhost:3001/api/flags/user', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 1,
            name: 'Flag Test',
            description: 'Flag de prueba',
            points: 10,
            is_solved: false
          }
        ]
      })
    );
  }),

  rest.post('http://localhost:3001/api/flags/submit', (req, res, ctx) => {
    const { flag_id, flag_value } = req.body;
    
    if (flag_value === 'correct_flag') {
      return res(
        ctx.json({
          success: true,
          is_correct: true,
          points_earned: 10,
          message: '¡Flag correcta!'
        })
      );
    }
    
    return res(
      ctx.json({
        success: true,
        is_correct: false,
        points_earned: 0,
        message: 'Flag incorrecta'
      })
    );
  }),

  // Games endpoints
  rest.get('http://localhost:3001/api/games/progress', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            game_id: 'nand-game',
            level: 3,
            score: 150,
            progress_data: { completed_levels: [1, 2] }
          }
        ]
      })
    );
  }),

  rest.post('http://localhost:3001/api/games/save', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Progreso guardado'
      })
    );
  }),

  // Health check
  rest.get('http://localhost:3001/api/health', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'ok',
        timestamp: new Date().toISOString()
      })
    );
  })
];

export default handlers;
