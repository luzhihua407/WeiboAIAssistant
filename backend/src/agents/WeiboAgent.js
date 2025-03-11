import path from 'path';
import sendNotification from '#root/utils/messageSender.js';
import Utils from '#root/utils/utils.js';
import BaseAgent from '#root/agents/BaseAgent.js';
import SysDictService from '#root/services/SysDictService.js';
import Playwright from '#root/utils/playwright.js';
import WeiboAccountService from '#root/services/WeiboAccountService.js';
const browser = await Playwright.getBrowser();
const cookies = await SysDictService.getCookies('weibo_cookie');
const browserContext = await Playwright.getBrowserContext(browser,{storageState: cookies});
const page = await Playwright.newPage(browserContext);
class WeiboAgent extends BaseAgent {
    constructor() {
        super();
        this.page = page;
        this.browserContext=browserContext;
        this.storePath = path.join(process.cwd(), 'temp');
        this.baseUrl = "https://weibo.com/";
    }
    async getLoginQRCode() {
        const qrcodePath = await this.getQRCodeImg();
        console.log("发起微博登录扫码");
        await sendNotification("not_login", { qrcode: qrcodePath, channel: '微博' });
    }

    async getQRCodeImg() {
        try {
            await this.page.goto('https://passport.weibo.com/sso/signin',{waitUntil: 'commit'});
            const qrcodePath = path.join(this.storePath, 'weibo_qrcode.jpg');
            await Utils.sleep(1000); // Delay to wait for QR code to appear
            const img = await this.page.locator('img.w-full');
            Utils.deleteFile(qrcodePath);
            await img.screenshot({ path: qrcodePath });
            return qrcodePath;
        } catch (error) {
            console.error(error);
        }
    }

    async scanLogin() {
        try {
            await this.getLoginQRCode();
            const responsePromise = this.page.waitForResponse('**/config/get_config', { timeout: 60000 });
            const response = await responsePromise;
            console.log("发送微博登录通知");
            if (response.status() === 200) {
                await this.saveCookie();
                await sendNotification("login_success", { islogined: true });
            }
        } catch (e) {
            console.log(`Error occurred: ${e}`);
            throw new Error('微博登录失败');
        }
    }

    async saveCookie() {
      try {
          const storageState = await this.browserContext.storageState();
          const cookieJson = JSON.stringify(storageState);
          await SysDictService.addOrUpdate("weibo_cookie", cookieJson);
          console.info(`Weibo Cookies saved`);
      } catch (error) {
          console.error(`Failed to save cookies: ${error.message}`);
      }
    }

    async isLogined() {
        await this.page.goto(this.baseUrl);
        const visible = await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').isVisible();
        if (visible) {
            await sendNotification("login_success", { islogined: true });
            console.log('微博已登录');
            return true;
        }
        console.log('微博没登录');
        return false;
    }

    async sendPost(content, imgList) {
        return await this.doSendPost(content, imgList, false);
    }

    async sendPrivatePost(content, imgList) {
        return await this.doSendPost(content, imgList, true);
    }

    async doSendPost(content, imgList, isSelfSee) {
        if (isSelfSee) {
            await this.page.locator('div[title="公开"]').click();
            await this.page.locator('div:text("仅自己可见")').click();
        }

        await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').fill(content);

        if (imgList) {
            const fileInput = await this.page.locator('input[type="file"]');
            for (let imgPath of imgList) {
                const filePath = path.resolve(imgPath);
                await fileInput.setInputFiles(filePath);
            }
        }
        await Utils.sleep(3000);
        await this.page.locator('span:text("发送")').click();
        return true;
    }

    async send(content, imgList, isSelfSee) {
        this.page.goto('https://weibo.com');
        console.log(content);
        if (isSelfSee) {
            await this.page.locator('div[title="公开"]').click();
            await this.page.locator('div:text("仅自己可见")').click();
        }

        await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').fill(content);

        if (imgList) {
            const fileInput = await this.page.locator('input[type="file"]');
            for (let item of imgList) {
                const base64ImageData = item.base64;
                const filename = item.name;
                const mimeType = item.type;

                // Decode Base64 data
                const base64Data = base64ImageData.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');

                // Upload the image from the buffer
                await fileInput.setInputFiles([{ buffer, name: filename, mimeType }]);
            }
        }

        await this.page.locator('span:text("发送")').click();
        return true;
    }

    async sendComment(weiboName, content) {
        const child = await this.page.locator(`span[title="${weiboName}"]`).first();
        const article = await this.page.locator('article').filter({ has: child }).first();
        const comment = await article.locator('i[title="评论"]').first();
        await comment.click();
        const inputComment = await article.locator('textarea[placeholder="发布你的评论"]').first();
        await inputComment.fill(content);
        await article.locator('span.woo-button-content').click();
    }

    async sendLike(weiboName) {
        const child = await this.page.locator(`span[title="${weiboName}"]`).first();
        const article = await this.page.locator('article').filter({ has: child }).first();
        const likeButton = await article.locator('button[title="赞"]').first();
        await likeButton.click();
    }

    async sendLikeTop(top) {
        for (let i = 0; i < top; i++) {
            try {
                const article = await this.page.locator('article').nth(i);
                await article.locator('button[title="赞"]').click();
                await Utils.sleep(1000); // Wait for like to complete
            } catch (e) {
                console.log(`Error liking Weibo: ${i}, ${e}`);
                continue; // Continue on error
            }
        }
    }

    async hotSearch() {
        try {
            await this.page.goto('https://weibo.com/hot/search');
            const response = await this.page.waitForResponse('https://weibo.com/ajax/side/hotSearch');
            if (response.status() === 200) {
                const data = await response.json();
                if (data.ok === 1) {
                    const notes = data.data.realtime.map(item => item.note);
                    notes.forEach(note => console.log(note));
                    return notes;
                } else {
                    console.error('Request failed or incomplete data');
                    return [];
                }
            }
        } catch (e) {
            console.error(`Error occurred: ${e}`);
        }
    }

    async deletePost(ids) {
        const cookies=await SysDictService.getCookies("weibo_cookie");
        console.log('Deleting posts:', ids);
        const url = 'https://weibo.com/ajax/statuses/destroy';
        const xsrfToken = Utils.getCookie(cookies, 'XSRF-TOKEN');
        const headers = { 'x-xsrf-token': xsrfToken };

        for (let idstr of ids) {
            const data = { id: idstr };
            try {
                const response = await this.page.request.post(url, { data, headers });
                const json = await response.json();
                if (!json.ok) {
                    console.log(`Failed to delete post: ${idstr}`);
                }
            } catch (e) {
                console.log(`Error deleting post: ${e}`);
            }
        }
    }

    async deleteAllWeibo() {
        const cookies=await SysDictService.getCookies("weibo_cookie");
        await this.page.setCookie(...cookies.map(cookie => ({ name: cookie.name, value: cookie.value, domain: 'weibo.com' })));
        await this.page.goto('https://weibo.com', { waitUntil: 'commit' });

        try {
            await this.page.click('img[alt="profile"]');
            await this.page.waitForTimeout(5000);
            let deltaY = 600;

            while (true) {
                const moreButton = await this.page.locator('i[title="更多"]');
                if (!moreButton) break;

                console.log(`Found visible Weibo: ${await this.page.$$eval('i[title="更多"]', els => els.length)}`);
                const isVisible = await moreButton.isIntersectingViewport();
                if (!isVisible) {
                    deltaY += 100;
                    await this.page.evaluate(deltaY => { window.scrollBy(0, deltaY); }, deltaY);
                }

                await moreButton.click();
                await this.page.click('div[text="删除"]');
                await this.page.click('button[text="确定"]');
                await this.page.waitForTimeout(3000);
                await this.page.evaluate(deltaY => { window.scrollBy(0, deltaY); }, deltaY);
            }
        } catch (e) {
            console.error(`Error occurred: ${e.message}`);
        }
    }

    async sendWeiboAndComment(request) {
        try {
            await this.doSendPost(request.content + "\n" + request.comment, request.img_list, request.is_self_see);
            await Utils.sleep(3000);
            // Send comment if provided
            if (request.comment) {
                const weiboAccount = await WeiboAccountService.getById(1);
                const weibo_account_name=weiboAccount.weibo_account_name;
                await this.sendComment(weibo_account_name, request.comment);
                await this.sendLike(weibo_account_name);
            }
        } catch (e) {
            console.error(`Error occurred: ${e.message}`);
        }
    }

   

}

export default new WeiboAgent;
