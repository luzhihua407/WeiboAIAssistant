import path from 'path';
import axios from 'axios';
import sendNotification from '#root/utils/messageSender.js';
import Utils from '#root/utils/utils.js';
import BaseAgent from './BaseAgent.js';

class YuanBaoAgent extends BaseAgent {
    constructor() {
        super();
        this.storePath = path.join(process.cwd(), 'temp');
        this.cookieCache = path.join(process.cwd(), 'cookies', 'yuanbao.json');
        super.browserContextOptions = {
            storageState: this.cookieCache
        }
        Utils.createJsonFile(this.cookieCache);
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
                    const type = mapObj.type;
                    if (type === 'text') {
                        let msg = mapObj.msg;
                        if (msg && msg.startsWith('[](@replace=0)')) {
                            msg = msg.replace('[](@replace=0)', '');
                        }
                        if (msg) {
                            sb.push(msg);
                        }
                    }
                } catch (error) {
                    // Ignore JSON parsing errors
                }
            }
        }
        return sb.join('');
    }

    async setSseHandler() {
        await this.page.route('**/api/chat/**', async route => {
            const response = await route.fetch();
            const text = await response.text();
            const formattedMessage = this.formatEventStreamMessage(text);
            console.log(formattedMessage)
            this.reply = formattedMessage;
            await route.fulfill({ response });
          });
        await this.page.goto(this.baseUrl);
    }

    getCookiesDict() {
        const cookieText = Utils.readFile(this.cookieCache);
        const cookieJson = JSON.parse(cookieText);
        const cookiesList = cookieJson.cookies || [];
        const cookiesDict = {};
        cookiesList.forEach(cookie => {
            cookiesDict[cookie.name] = cookie.value;
        });
        const cookiesString = Object.entries(cookiesDict)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
        return cookiesString;
    }

    async isLogined() {
        try {
            const url = "https://yuanbao.tencent.com/api/getuserinfo";
            const cookiesDict = this.getCookiesDict();
            const response = await axios.get(url, {
                headers: {
                'Content-Type': 'application/json' ,
                'Cookie': cookiesDict
                }
              });
            const json = response.data;
            const loggedIn = !json.error;
            await sendNotification("login_success",{islogined: true });
            console.log("元宝已登录")
            return loggedIn;
        } catch (error) {
            console.log("元宝报错",error)
            return false;
        }
    }

    async scanLogin() {
        try {
            await this.page.goto("https://yuanbao.tencent.com");
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
            console.log("Sent login QR code notification.");
            await sendNotification("not_login",{qrcode: qrcodePath, channel: "元宝" });
            const response = await responseInfo;
            if (response.status() === 200) {
                await this.saveCookie();
                await sendNotification("login_success",{islogined: true });
            }
        } catch (error) {
            console.log("元宝扫描登录报错：",error)
            this.scanLogin();
        }
        
    }

    async fillSubmit(prompt, sysPrompt = '') {
        const editorLocator = await this.page.locator("//div[@class='ql-editor ql-blank']");
        await editorLocator.fill(`${sysPrompt}\n${prompt}`);
        const sendButtonLocator = this.page.locator("//span[@class='hyc-common-icon iconfont icon-send']");
        await sendButtonLocator.click();
        const response = await this.page.waitForResponse("**/api/chat/**", { timeout: 60000 });
        console.log("Sent prompt request.");
    }

}

export default YuanBaoAgent;
