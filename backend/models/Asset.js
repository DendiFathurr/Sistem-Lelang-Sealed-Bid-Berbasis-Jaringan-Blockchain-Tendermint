import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  views: {
    type: DataTypes.STRING,
    defaultValue: '0'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  standard: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentBid: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  biddingEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  revealEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Asset;
