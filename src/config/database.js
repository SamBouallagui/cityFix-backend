//load environment variables from .env file to process.env
require('dotenv').config();
const { Sequelize } = require('sequelize');

// create a sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres', //tells Sequelize to use PostgreSQL
    logging: console.log, //logs SQL queries to the console
});

// export the sequelize instance
module.exports = sequelize;
