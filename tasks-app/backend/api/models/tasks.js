module.exports = (sequelize, DataTypes) => {
  const Tasks = sequelize.define("Tasks", {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    day: DataTypes.STRING,
    important: DataTypes.BOOLEAN,
  });

  return Tasks;
};
