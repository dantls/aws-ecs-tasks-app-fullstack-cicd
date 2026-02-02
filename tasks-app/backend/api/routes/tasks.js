module.exports = (app) => {
  const controller = require("../controllers/tasks")();
  
  // CORS middleware for all routes
  const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  };

  // English routes
  app.route("/api/tasks").all(corsMiddleware).get(controller.findAll).post(controller.create);
  app.route("/api/tasks/:uuid").all(corsMiddleware).get(controller.find).delete(controller.delete);
  app.route("/api/tasks/update_priority/:uuid").all(corsMiddleware).put(controller.update_priority);

  // Portuguese routes (for backward compatibility)
  app.route("/api/tarefas").all(corsMiddleware).get(controller.findAll).post(controller.create);
  app.route("/api/tarefas/:uuid").all(corsMiddleware).get(controller.find).delete(controller.delete);
  app.route("/api/tarefas/update_priority/:uuid").all(corsMiddleware).put(controller.update_priority);
};
