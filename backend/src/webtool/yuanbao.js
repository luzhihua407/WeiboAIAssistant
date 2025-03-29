import path from 'path';
import axios from 'axios';
import sendNotification from '#root/utils/message-sender.js';
import BaseTool from './base.js';
import SysDictService from '#root/service/system/sys-dict.js';
import Memory from '#root/utils/memory.js';
const COOKIE_KEY = 'yuanbao_cookie'; // Define as a constant class property
let cookies = await SysDictService.getCookies(COOKIE_KEY);
class YuanBaoTool extends BaseTool {

    constructor() {
        super(cookies); // Use the constant property
        this.storePath = path.join(process.cwd(), 'temp');
        this.baseUrl = "https://yuanbao.tencent.com/chat";
    }

    formatEventStreamMessage(text) {
        const sb = [];
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: {"type":"text"')) {
                let formattedJson = line.replace('data: {"type":"text"', '{"type":"text"');
                try {
                    const mapObj = JSON.parse(formattedJson);
                    if (mapObj.type === 'text') {
                        let msg = mapObj.msg;
                        if (msg && msg.startsWith('[](@replace=0)')) {
                            msg = msg.replace('[](@replace=0)', '');
                        }
                        if (msg) {
                            sb.push(msg);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
        return sb.join('');
    }

    async setSseHandler() {
        try {
            await this.page.route('**/api/chat/**', async route => {
                const response = await route.fetch();
                const text = await response.text();
                const formattedMessage = this.formatEventStreamMessage(text);
                console.log(formattedMessage);
                Memory.clear();
                // 使用记忆类存储最新的响应结果
                Memory.store(formattedMessage);

                await route.fulfill({ response });
            });
            // 监听网络响应
            await this.page.goto(this.baseUrl);
        } catch (error) {
            console.error('Error setting SSE handler:', error);
        }
    }

    async getCookiesDict() {
        try {
            const cookiesList =cookies==undefined?[]: cookies.cookies;
            const cookiesDict = {};
            cookiesList.forEach(cookie => {
                cookiesDict[cookie.name] = cookie.value;
            });
            return Object.entries(cookiesDict)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
        } catch (error) {
            console.error('Error getting cookies dictionary:', error);
            return '';
        }
    }

    async isLogined() {
        try {
            const url = "https://yuanbao.tencent.com/api/getuserinfo";
            const cookiesDict = await this.getCookiesDict();
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookiesDict
                }
            });
            const loggedIn = !response.data.error;
            await sendNotification("login_success", { islogined: true });
            console.log("元宝已登录");
            return loggedIn;
        } catch (error) {
            return false;
        }
    }

    async scanLogin() {
        try {
            await this.page.goto("https://yuanbao.tencent.com", { waitUntil: "commit" });
            await this.page.waitForTimeout(1000);
            const responseInfo = this.page.waitForResponse("**/api/joint/login", { timeout: 60000 });
            await this.page.locator('span[class="yb-icon iconfont-yb icon-yb-newchat2"]').click();
            const qrcodeResponse = await this.page.waitForResponse(response => response.url().includes("qrcode") && response.status() === 200, { timeout: 60000 });
            const qrcodeUrl = qrcodeResponse.url();
            console.log("QR Code URL:", qrcodeUrl);
            await sendNotification("not_login", { qrcode: qrcodeUrl, channel: "元宝" });
            const response = await responseInfo;
            if (response.status() === 200) {
                await this.saveCookie();
                await sendNotification("login_success", { islogined: true });
            }
            return true;
        } catch (error) {
            console.error('元宝登录失败:', error);
        }
    }
    async saveCookie() {
      try {
          const storageState = await this.browserContext.storageState();
          const cookieJson = JSON.stringify(storageState);
          await SysDictService.addOrUpdate(COOKIE_KEY, cookieJson);
          cookies = JSON.parse(cookieJson); // Update the class property with the new cookies

          console.info(`元宝cookies保存成功`);
      } catch (error) {
          console.error(`Failed to save cookies: ${error.message}`);
      }
    }
    async fillSubmit(prompt, sysPrompt = '') {
        try {
            await this.page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
            await this.page.locator('.ql-editor').fill(`${sysPrompt}\n${prompt}`);
            // const editorLocator = await this.page.locator("//div[@class='ql-editor']");
            // await editorLocator.press(' ');
            // // // 填写内容到输入框
            // await editorLocator.fill(`${sysPrompt}\n${prompt}`);
            // 点击发送按钮
            const sendButtonLocator = this.page.locator("//span[@class='hyc-common-icon iconfont icon-send']");
            await sendButtonLocator.click();
            // await this.page.waitForResponse("**/api/chat/**", { timeout: 60000 });
        } catch (error) {
            console.error('Error filling and submitting prompt:', error);
        }
    }
}

export default new YuanBaoTool();