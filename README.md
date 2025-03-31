
```markdown
# RPA 应用 UI - Tauri + Vue 3

本项目是一个基于 Tauri 和 Vue 3 的桌面应用程序，结合 Playwright 实现浏览器自动化操作，支持微博、京东等平台的任务管理和操作。

---

## **项目简介**
- **前端框架**: Vue 3 + Vite
- **后端框架**: Node.js + Express
- **自动化工具**: Playwright
- **桌面应用框架**: Tauri
- **数据库**: SQLite (通过 Sequelize 管理)

---

## **功能**
1. **用户登录**
   - 支持微博和京东的自动化登录。
2. **任务管理**
   - 自动发送微博、管理微博列表。
   - 自动化处理京东相关任务。
3. **系统设置**
   - 配置微博和京东的 API 密钥。
   - 管理用户的登录状态和 Cookies。
4. **实时通知**
   - 使用 WebSocket 实现实时通知功能。

---


## **安装与运行**

### **1. 克隆项目**
```bash
git clone https://github.com/your-repo/rpa_app_ui.git
cd rpa_app_ui
```

### **2. 安装依赖**
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

### **3. 开发模式运行**
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

## **打包应用**
使用以下命令打包桌面应用程序：
```bash
npm run tauri build
```

---

## **安装 Chromium 浏览器**

本项目使用 Playwright 进行浏览器自动化操作。请按照以下步骤安装 Chromium：

### **1. 安装到指定路径**
在 PowerShell 中运行以下命令，将 Chromium 安装到自定义目录：
```powershell
$Env:PLAYWRIGHT_BROWSERS_PATH="D:\code\rpa_app_ui\backend\pw-browsers"
npx playwright install chromium
```

### **2. 配置 Playwright 使用已安装的 Chromium**
编辑 `utils/playwright.js` 文件，指定 Chromium 可执行文件的路径：
```javascript
launch({
  executablePath: "D:\\code\\rpa_app_ui\\backend\\pw-browsers\\chromium\\path\\to\\executable"
});
```

---


## **贡献指南**

欢迎贡献代码！请遵循以下步骤提交您的贡献：

1. Fork 本仓库。
2. 创建一个新分支以实现您的功能或修复问题。
3. 提交清晰且简洁的提交信息。
4. 提交 Pull Request 以供审查。

---

## **许可证**
本项目遵循 [MIT License](https://opensource.org/licenses/MIT) 开源协议。详情请参阅 `LICENSE` 文件。

---

如果有任何问题或建议，欢迎提交 Issue 或 Pull Request！
```