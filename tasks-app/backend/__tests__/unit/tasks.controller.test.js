const tasksController = require('../../api/controllers/tasks')();

// Mock the Tasks model
jest.mock('../../api/models', () => ({
  Tasks: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

const { Tasks } = require('../../api/models');

describe('Tasks Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task with English fields', () => {
      const taskData = { title: 'Test Task', day: '2024-01-01', important: false };
      req.body = taskData;

      Tasks.create.mockResolvedValue({ uuid: '123', ...taskData });

      tasksController.create(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(Tasks.create).toHaveBeenCalledWith(taskData);
        expect(res.send).toHaveBeenCalledWith({ uuid: '123', ...taskData });
      });
    });

    it('should create a task with Portuguese fields', () => {
      req.body = { titulo: 'Tarefa Teste', dia: '2024-01-01', importante: true };
      const expectedData = { title: 'Tarefa Teste', day: '2024-01-01', important: true };

      Tasks.create.mockResolvedValue({ uuid: '123', ...expectedData });

      tasksController.create(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(Tasks.create).toHaveBeenCalledWith(expectedData);
      });
    });

    it('should handle errors', () => {
      req.body = { title: 'Test', day: '2024-01-01', important: false };
      Tasks.create.mockRejectedValue(new Error('Database error'));

      tasksController.create(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database error',
        });
      });
    });
  });

  describe('findAll', () => {
    it('should return all tasks', () => {
      const mockTasks = [
        { uuid: '1', title: 'Task 1' },
        { uuid: '2', title: 'Task 2' },
      ];

      Tasks.findAll.mockResolvedValue(mockTasks);

      tasksController.findAll(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(Tasks.findAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(mockTasks);
      });
    });

    it('should handle errors', () => {
      Tasks.findAll.mockRejectedValue(new Error('Database error'));

      tasksController.findAll(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database error',
        });
      });
    });
  });

  describe('find', () => {
    it('should return a specific task', () => {
      const mockTask = { uuid: '123', title: 'Task 1' };
      req.params.uuid = '123';

      Tasks.findByPk.mockResolvedValue(mockTask);

      tasksController.find(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(Tasks.findByPk).toHaveBeenCalledWith('123');
        expect(res.send).toHaveBeenCalledWith(mockTask);
      });
    });

    it('should handle errors', () => {
      req.params.uuid = '123';
      Tasks.findByPk.mockRejectedValue(new Error('Not found'));

      tasksController.find(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('delete', () => {
    it('should delete a task', () => {
      req.params.uuid = '123';
      Tasks.destroy.mockResolvedValue(1);

      tasksController.delete(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(Tasks.destroy).toHaveBeenCalledWith({ where: { uuid: '123' } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
      });
    });

    it('should handle errors', () => {
      req.params.uuid = '123';
      Tasks.destroy.mockRejectedValue(new Error('Delete failed'));

      tasksController.delete(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('update_priority', () => {
    it('should update task priority', () => {
      const updatedTask = { uuid: '123', title: 'Task 1', important: true };
      req.params.uuid = '123';
      req.body = { important: true };

      Tasks.update.mockResolvedValue([1]);
      Tasks.findByPk.mockResolvedValue(updatedTask);

      tasksController.update_priority(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(Tasks.update).toHaveBeenCalledWith(
          { important: true },
          { where: { uuid: '123' } }
        );
        expect(Tasks.findByPk).toHaveBeenCalledWith('123');
        expect(res.send).toHaveBeenCalledWith(updatedTask);
      });
    });

    it('should handle errors', () => {
      req.params.uuid = '123';
      req.body = { important: true };
      Tasks.update.mockRejectedValue(new Error('Update failed'));

      tasksController.update_priority(req, res);

      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });
});
