import { Model, DataTypes } from 'sequelize';

class JdAppConfig extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            jd_app_key: { type: DataTypes.STRING(100), defaultValue: '', comment: '京东应用密钥' }, // 添加长度约束
            jd_app_secret: { type: DataTypes.STRING(100), defaultValue: '', comment: '京东应用密钥' } // 添加长度约束
        }, {
            sequelize,          // 注入sequelize实例
            modelName: 'JdAppConfig',
            tableName: 'jd_app_config',
            timestamps: false,
            comment: '京东应用配置',
        });
    }
}

export default JdAppConfig;
