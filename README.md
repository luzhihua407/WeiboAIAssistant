# Tauri + Vue 3

This template should help get you started developing with Tauri + Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
npm run tauri dev

## 平台后缀
rustc -Vv | Select-String "host:" | ForEach-Object {$_.Line.split(" ")[1]}

## 打包工具
npm run tauri build
## 安装浏览器chromium
### 指定路径安装
打开PowerShell，执行下面命令，
$Env:PLAYWRIGHT_BROWSERS_PATH="具体path"
npx playwright install chromium
### 指定playwright启动chromium浏览器路径
打开utils/playwright.js
修改launch部分配置项：executablePath