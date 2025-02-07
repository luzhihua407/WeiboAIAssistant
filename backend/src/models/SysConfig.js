import { Model,DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class SysConfig extends Model { }

SysConfig.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, comment: 'YAML数据' },
}, {
    sequelize,
    modelName: 'SysConfig',
    tableName: 'sys_config',
    timestamps: false,
    comment: '系统配置表',
});
export default SysConfig;
