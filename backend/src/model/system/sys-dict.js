import { Model, DataTypes } from 'sequelize';

class SysDict extends Model {
    static init(sequelize) {
        return super.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, comment: '配置名称' },
        code: { type: DataTypes.STRING, comment: '配置编码' },
        num_value: { type: DataTypes.DECIMAL(20, 2), comment: '数字值  数字类型基础数据' },
        value: { type: DataTypes.TEXT, comment: '字符串值 字符串类型基础数据' },
        remark: { type: DataTypes.STRING },
        parent: { type: DataTypes.INTEGER }
    }, {
        sequelize,          // 这里注入sequelize实例
        modelName: 'SysDict',
        tableName: 'sys_dict',
        timestamps: false,
        comment: '系统字典',
    });
    
}
}

export default SysDict;