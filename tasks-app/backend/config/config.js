module.exports = {
  development: {
    username: "postgres",
    password: "postgres",
    database: "tasks",
    host: "database",
    port: 5432,
    dialect: "postgres"
  },
  production: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "tasks",
    host: process.env.DB_HOST || "database",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: false
    }
  }
};
