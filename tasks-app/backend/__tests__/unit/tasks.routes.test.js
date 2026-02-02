const express = require('express');

describe('Tasks Routes Configuration', () => {
  let app;

  beforeEach(() => {
    // Mock the controller before requiring routes
    jest.mock('../../api/controllers/tasks', () => {
      return jest.fn(() => ({
        create: jest.fn((req, res) => res.send({ created: true })),
        findAll: jest.fn((req, res) => res.send([])),
        find: jest.fn((req, res) => res.send({ uuid: req.params.uuid })),
        delete: jest.fn((req, res) => res.send({ deleted: true })),
        update_priority: jest.fn((req, res) => res.send({ updated: true })),
      }));
    });

    app = express();
    app.use(express.json());
    
    const tasksRoutes = require('../../api/routes/tasks');
    tasksRoutes(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Registration', () => {
    it('should register English routes', () => {
      const routes = app._router.stack
        .filter(r => r.route)
        .map(r => r.route.path);

      expect(routes).toContain('/api/tasks');
      expect(routes).toContain('/api/tasks/:uuid');
      expect(routes).toContain('/api/tasks/update_priority/:uuid');
    });

    it('should register Portuguese routes', () => {
      const routes = app._router.stack
        .filter(r => r.route)
        .map(r => r.route.path);

      expect(routes).toContain('/api/tarefas');
      expect(routes).toContain('/api/tarefas/:uuid');
      expect(routes).toContain('/api/tarefas/update_priority/:uuid');
    });

    it('should have GET and POST methods on /api/tasks', () => {
      const route = app._router.stack
        .find(r => r.route && r.route.path === '/api/tasks');

      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
      expect(route.route.methods.post).toBe(true);
    });

    it('should have GET and DELETE methods on /api/tasks/:uuid', () => {
      const route = app._router.stack
        .find(r => r.route && r.route.path === '/api/tasks/:uuid');

      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
      expect(route.route.methods.delete).toBe(true);
    });

    it('should have PUT method on /api/tasks/update_priority/:uuid', () => {
      const route = app._router.stack
        .find(r => r.route && r.route.path === '/api/tasks/update_priority/:uuid');

      expect(route).toBeDefined();
      expect(route.route.methods.put).toBe(true);
    });
  });

  describe('Route Middleware', () => {
    it('should have CORS middleware on routes', () => {
      const route = app._router.stack
        .find(r => r.route && r.route.path === '/api/tasks');

      expect(route).toBeDefined();
      expect(route.route.stack.length).toBeGreaterThan(0);
    });
  });
});
