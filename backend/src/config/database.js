import path from 'path';
import { Sequelize } from 'sequelize';
import JdAppConfig from '#root/models/JdAppConfig.js';
import WeiboAccount from '#root/models/WeiboAccount.js';

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
JdAppConfig.init(sequelize);
WeiboAccount.init(sequelize);

sequelize.sync({ force: false })
  .then(() => {
    console.log('表创建成功');
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