const sequelize = require('../config/database');
const User = require('./user.model');
const Report = require('./report.model');
const Zone = require('./zone.model');
//Association between tables
User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'reporter' })

module.exports = { sequelize, User, Report, Zone };
