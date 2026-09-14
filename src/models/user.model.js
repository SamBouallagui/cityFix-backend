const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

//sequelize model for the database table user
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: { //for the password bcrypt hash
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('citizen', 'agent'),
    allowNull: false,
    defaultValue: 'citizen',
  },
}, {
  tableName: 'users',
  timestamps: true,
});
module.exports = User;
