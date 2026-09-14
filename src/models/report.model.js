const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT, //TEXT has no length limit
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('pothole', 'streetlight', 'garbage','other'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved'),
    allowNull: false,
    defaultValue: 'pending',
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true, //incase the upload fails
  },
  location: {
    type: DataTypes.GEOGRAPHY('POINT',4326), // points using the WGS 84 coordinate reference system to map the location
    allowNull: false,
  },
}, {
  tableName: 'reports',
  timestamps: true,
});

module.exports = Report;
