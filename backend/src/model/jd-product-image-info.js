import { Model, DataTypes } from 'sequelize';
import sequelize from '#root/storage/database.js';

class JdProductImageInfo extends Model {
    // ...existing code...
}
JdProductImageInfo.init({
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize,
  modelName: 'JdProductImageInfo',
  tableName: 'jd_product_image',
  timestamps: false,
  comment: '京东商品图片信息'
});

export default JdProductImageInfo;