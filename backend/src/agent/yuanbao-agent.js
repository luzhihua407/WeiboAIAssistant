import path from 'path';
import axios from 'axios';
import sendNotification from '#root/utils/message-sender.js';
import Utils from '#root/utils/utils.js';
import BaseAgent from './base-agent.js';
import SysDictService from '#root/service/sys-dict-service.js';
import Playwright from '#root/utils/playwright.js';

const browser = await Playwright.getBrowser();
const cookies = await SysDictService.getCookies('yuanbao_cookie');
const browserContext = await Playwright.getBrowserContext(browser,{storageState: cookies});
const page = await Playwright.newPage(browserContext);
class YuanBaoAgent extends BaseAgent {
    constructor() {
        super();
        this.page = page;
        this.browserContext=browserContext;
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
                this.reply = formattedMessage;
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
            await this.page.locator("//span[text()='登录']").click();
            await this.page.waitForTimeout(5000);
            const iframeLocator = this.page.locator(".hyc-wechat-login");
            await iframeLocator.waitFor({ timeout: 60000 });
            const iframe = iframeLocator.frameLocator("iframe");
            const img = iframe.locator(".wrp_code").locator("img");
            const qrcodePath = path.join(this.storePath, "yuanbao_qrcode.jpg");
            Utils.deleteFile(qrcodePath);
            await Utils.screenshot(img, qrcodePath);
            console.log("Sent Yuanbao login QR code notification.");
            await sendNotification("not_login", { qrcode: qrcodePath, channel: "元宝" });
            const response = await responseInfo;
            if (response.status() === 200) {
                await this.saveCookie();
                await sendNotification("login_success", { islogined: true });
            }
        } catch (error) {
            console.error('Error during scan login:', error);
            throw new Error('元宝登录失败');
        }
    }
    async saveCookie() {
      try {
          const storageState = await this.browserContext.storageState();
          const cookieJson = JSON.stringify(storageState);
          await SysDictService.addOrUpdate("yuanbao_cookie", cookieJson);
          console.info(`Yuanbao Cookies saved`);
      } catch (error) {
          console.error(`Failed to save cookies: ${error.message}`);
      }
    }
    async fillSubmit(prompt, sysPrompt = '') {
        try {
            console.log(prompt,sysPrompt);
            const editorLocator = await this.page.locator("//div[@class='ql-editor ql-blank']");
            await editorLocator.fill(`${sysPrompt}\n${prompt}`);
            const sendButtonLocator = this.page.locator("//span[@class='hyc-common-icon iconfont icon-send']");
            await sendButtonLocator.click();
            await this.page.waitForResponse("**/api/chat/**", { timeout: 60000 });
        } catch (error) {
            console.error('Error filling and submitting prompt:', error);
        }
    }
}

export default new YuanBaoAgent;