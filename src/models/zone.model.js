const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('Zone', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING, allowNull: false, defaultValue: '#2563eb' },
  boundary: {
    type: DataTypes.GEOGRAPHY('POLYGON', 4326),
    allowNull: false,
  },
}, {
  tableName: 'zones',
  timestamps: true,
});

module.exports = Zone;
