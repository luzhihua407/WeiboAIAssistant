import { DataTypes } from 'sequelize';

const commonAttributes = {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  create_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  last_update_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  create_user: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  last_update_user: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  orderno: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  valid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}

export default commonAttributes;