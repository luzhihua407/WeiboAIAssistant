# 微博 AI 助手

一个基于 **Tauri** 和 **Vue 3** 的桌面应用程序，结合 **Playwright** 实现浏览器自动化操作。该工具支持微博平台的任务管理与自动化。

---

## 📖 项目概览

- **前端框架**: Vue 3 + Vite  
- **后端框架**: Node.js + Express  
- **自动化工具**: Playwright  
- **桌面应用框架**: Tauri  
- **数据库**: SQLite (通过 Sequelize 管理)  

---

## ✨ 功能

1. **用户登录**
   - 支持微博扫码登录。
2. **任务管理**
   - 发送微博并管理微博列表。
   - 自动化处理京东相关任务。
3. **系统设置**
   - 配置微博和京东的 API 密钥。
   - 管理用户的登录状态和 Cookies。
4. **实时通知**
   - 基于 WebSocket 的实时通知功能。
5. **跨平台支持**
   - 支持 Windows、macOS 和 Linux。

---

## ⚙️ 安装与运行

### 1. 克隆项目
```bash
git clone https://github.com/luzhihua407/WeiboAIAssistant.git
cd WeiboAIAssistant
```

### 2. 安装依赖

#### 前端
```bash
cd frontend
npm install
```

#### 后端
```bash
cd backend
npm install
```

### 3. 开发模式运行

#### 启动后端服务
```bash
cd backend
npm start
```

#### 启动前端服务
```bash
cd frontend
npm run tauri dev
```

---

## 📦 打包桌面应用

运行以下命令以打包桌面应用程序：
```bash
npm run tauri build
```

---

## 🌐 安装 Chromium 浏览器

本项目使用 **Playwright** 进行浏览器自动化操作。请运行以下命令安装 Chromium：
```bash
npx playwright install chromium
```

---

## 🤝 贡献指南

欢迎贡献代码！请按照以下步骤提交您的贡献：

1. **Fork** 本仓库。
2. 创建一个**新分支**以实现您的功能或修复问题。
3. 提交清晰且简洁的提交信息。
4. 提交 **Pull Request** 以供审查。

---

## 📄 许可证

本项目遵循 [MIT License](https://opensource.org/licenses/MIT) 开源协议。详情请参阅 `LICENSE` 文件。

---

## 💬 支持

如果您遇到任何问题或有建议，欢迎提交 **Issue** 或 **Pull Request**。