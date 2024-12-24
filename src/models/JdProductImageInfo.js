// models/JdProductImageInfo.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class JdProductImageInfo extends Model {}
JdProductImageInfo.init({
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize,
  modelName: 'JdProductImageInfo',
  tableName: 'jd_product_image',
  timestamps: false
});

export default JdProductImageInfo;
