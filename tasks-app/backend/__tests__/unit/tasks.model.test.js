const { Sequelize, DataTypes } = require('sequelize');

describe('Tasks Model', () => {
  let sequelize;
  let Tasks;

  beforeAll(() => {
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
    });

    Tasks = require('../../api/models/tasks')(sequelize, DataTypes);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(Tasks.name).toBe('Tasks');
    });

    it('should have uuid as primary key', () => {
      const attributes = Tasks.rawAttributes;
      expect(attributes.uuid.primaryKey).toBe(true);
      expect(attributes.uuid.type).toBeInstanceOf(DataTypes.UUID);
    });

    it('should have title field', () => {
      const attributes = Tasks.rawAttributes;
      expect(attributes.title).toBeDefined();
      expect(attributes.title.type).toBeInstanceOf(DataTypes.STRING);
    });

    it('should have day field', () => {
      const attributes = Tasks.rawAttributes;
      expect(attributes.day).toBeDefined();
      expect(attributes.day.type).toBeInstanceOf(DataTypes.STRING);
    });

    it('should have important field', () => {
      const attributes = Tasks.rawAttributes;
      expect(attributes.important).toBeDefined();
      expect(attributes.important.type).toBeInstanceOf(DataTypes.BOOLEAN);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a task', async () => {
      const taskData = {
        title: 'Test Task',
        day: '2024-01-01',
        important: false,
      };

      const task = await Tasks.create(taskData);

      expect(task.uuid).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.day).toBe(taskData.day);
      expect(task.important).toBe(taskData.important);
    });

    it('should find all tasks', async () => {
      await Tasks.create({ title: 'Task 1', day: '2024-01-01', important: false });
      await Tasks.create({ title: 'Task 2', day: '2024-01-02', important: true });

      const tasks = await Tasks.findAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    it('should find task by primary key', async () => {
      const created = await Tasks.create({
        title: 'Find Me',
        day: '2024-01-01',
        important: false,
      });

      const found = await Tasks.findByPk(created.uuid);

      expect(found).toBeDefined();
      expect(found.uuid).toBe(created.uuid);
      expect(found.title).toBe('Find Me');
    });

    it('should update a task', async () => {
      const task = await Tasks.create({
        title: 'Original',
        day: '2024-01-01',
        important: false,
      });

      await Tasks.update(
        { important: true },
        { where: { uuid: task.uuid } }
      );

      const updated = await Tasks.findByPk(task.uuid);
      expect(updated.important).toBe(true);
    });

    it('should delete a task', async () => {
      const task = await Tasks.create({
        title: 'Delete Me',
        day: '2024-01-01',
        important: false,
      });

      await Tasks.destroy({ where: { uuid: task.uuid } });

      const found = await Tasks.findByPk(task.uuid);
      expect(found).toBeNull();
    });
  });

  describe('Validations', () => {
    it('should generate UUID automatically', async () => {
      const task = await Tasks.create({
        title: 'Auto UUID',
        day: '2024-01-01',
        important: false,
      });

      expect(task.uuid).toBeDefined();
      expect(typeof task.uuid).toBe('string');
    });

    it('should allow creating task with minimal data', async () => {
      const task = await Tasks.create({
        title: 'Minimal Task',
      });

      expect(task.uuid).toBeDefined();
      expect(task.title).toBe('Minimal Task');
    });
  });
});
