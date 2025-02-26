// models/JdProductInfo.js
import { Model,DataTypes } from 'sequelize';
import sequelize from '#root/config/database.js';
import commonAttributes from '#root/models/CommonInfo.js';
class JdProductInfo extends Model {}

JdProductInfo.init({
  ...commonAttributes,
  item_id: { type: DataTypes.STRING(64), allowNull: true, unique: true },
  sku_name: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: true },
  wlprice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  purchase_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  material_url: { type: DataTypes.STRING, allowNull: true },
  elite_name: { type: DataTypes.STRING, allowNull: true },
  seckill_ori_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  seckill_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  coupon_link: { type: DataTypes.TEXT, allowNull: true },
  discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  commission_share: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
}, {
  sequelize,
  modelName: 'JdProductInfo',
  tableName: 'jd_product_info',
  timestamps: false,
  comment: '京东商品信息'
});

export default JdProductInfo;
