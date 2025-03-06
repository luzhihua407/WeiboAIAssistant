import { Model, DataTypes } from 'sequelize';

class WeiboAccount extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            weibo_account_id: { type: DataTypes.STRING(50), comment: '微博账号ID' }, // 添加长度约束
            weibo_account_name: { type: DataTypes.STRING(100), comment: '微博账号名称' }, // 添加长度约束
        }, {
            sequelize,          // 注入sequelize实例
            modelName: 'WeiboAccount',
            tableName: 'weibo_account',
            timestamps: false,
            comment: '微博账号信息',
        });
    }
}

export default WeiboAccount;
