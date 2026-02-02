const { Tasks } = require("../models");

module.exports = () => {
  const controller = {};

  controller.create = (req, res) => {
    console.log('CREATE body:', req.body);
    let task = {
      title: req.body.titulo || req.body.title,
      day: req.body.dia || req.body.day,
      important: req.body.importante || req.body.important,
    };

    Tasks.create(task)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error creating task.",
        });
      });
  };

  controller.find = (req, res) => {
    let uuid = req.params.uuid;
    Tasks.findByPk(uuid)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error finding task.",
        });
      });
  };

  controller.delete = (req, res) => {
    console.log('DELETE params:', req.params);
    let { uuid } = req.params;

    Tasks.destroy({
      where: {
        uuid: uuid,
      },
    })
      .then(() => {
        res.status(200).send({ message: "Task deleted successfully" });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error deleting task.",
        });
      });
  };

  controller.update_priority = (req, res) => {
    let { uuid } = req.params;

    Tasks.update(req.body, {
      where: {
        uuid: uuid,
      },
    })
      .then(() => {
        Tasks.findByPk(uuid).then((data) => {
          res.send(data);
        });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error updating task.",
        });
      });
  };

  controller.findAll = (req, res) => {
    Tasks.findAll()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error fetching tasks.",
        });
      });
  };
  return controller;
};
