import path from 'path';
import { Sequelize } from 'sequelize';
import SysDict from '#root/models/SysDict.js';

// 当前工作目录
  // 构建 assets 目录的完整路径（假设 assets 在项目根目录）
const dbPath = path.join(process.cwd(), 'assets', 'phoenix.sqlite');

console.log('dbPath:',dbPath);
// 初始化 Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath, // 数据库文件路径
    logging: console.log, // 启用日志
});
// 导入模型
const sysDict=SysDict.init(sequelize);

// 定义初始数据
const dictData = [
  { id: 3, name: '京东', code: 'jd_api', parent_id: null },
  { id: 4, name: '京东app_key', code: 'app_key', value: '', parent_id: 3 },
  { id: 5, name: '京东app_secret', code: 'app_secret', value: '', parent_id: 3 },
  { id: 9, name: '微博账号ID', code: 'weiboUserId', parent_id: null },
];
sequelize.sync({ force: false })
  .then(() => {
    console.log('表创建成功');
    // 插入初始数据
    sysDict.bulkCreate(dictData, {
      updateOnDuplicate: ['name', 'code', 'num_value', 'value', 'remark', 'parent_id'], // 如果 id 存在则更新
    });
    console.log('初始数据已成功插入.');
  })
  .catch((error) => {
    console.error('表创建失败:', err);
  });
// 测试连接
sequelize.authenticate()
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch((err) => {
        console.error('数据库连接失败:', err);
    });


export default sequelize;