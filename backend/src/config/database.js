import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置数据库路径
const dbPath = process.env.VITE_BASE_PATH
    ? path.join(process.env.VITE_BASE_PATH, 'config/phoenix.sqlite')
    : path.join(__dirname, 'phoenix.sqlite'); // 默认存储在当前目录

console.log('Database path:', dbPath);

// 初始化 Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath, // 数据库文件路径
    logging: console.log, // 启用日志
});

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