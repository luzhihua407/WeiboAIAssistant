import { Model, DataTypes } from 'sequelize';
import sequelize from '#root/storage/database.js';
import commonAttributes from '#root/model/common-info.js';

class JdCouponInfo extends Model {}
JdCouponInfo.init({
  ...commonAttributes,
  bind_type: { type: DataTypes.INTEGER, allowNull: true },
  discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  link: { type: DataTypes.STRING, allowNull: true },
  platform_type: { type: DataTypes.INTEGER, allowNull: true },
  quota: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  get_start_time: { type: DataTypes.DATE, allowNull: true },
  get_end_time: { type: DataTypes.DATE, allowNull: true },
  use_start_time: { type: DataTypes.BIGINT, allowNull: true },
  use_end_time: { type: DataTypes.BIGINT, allowNull: true },
  is_best: { type: DataTypes.INTEGER, allowNull: true },
  hot_value: { type: DataTypes.INTEGER, allowNull: true },
  coupon_style: { type: DataTypes.INTEGER, allowNull: true },
  coupon_status: { type: DataTypes.INTEGER, allowNull: true },
  product_id: { type: DataTypes.BIGINT, allowNull: true }
}, {
  sequelize,
  modelName: 'JdCouponInfo',
  tableName: 'jd_coupon_info',
  timestamps: false,
  comment: '京东优惠券信息'
});

export default JdCouponInfo;