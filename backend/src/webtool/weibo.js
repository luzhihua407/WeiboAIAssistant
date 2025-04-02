import path from 'path';
import sendNotification from '#root/utils/message-sender.js';
import Utils from '#root/utils/utils.js';
import BaseTool from '#root/webtool/base.js';
import SysDictService from '#root/service/system/sys-dict.js';
import axios from 'axios';
import WeiboAccountService from '#root/service/weibo/weibo-account.js';
const COOKIE_KEY = 'weibo_cookie'; // Define as a constant class property
let cookies = await SysDictService.getCookies(COOKIE_KEY);
let cookiesList=cookies==undefined?[]: cookies.cookies;
class WeiboTool extends BaseTool {

    constructor() {
        super(cookies); // Use the constant property
        this.storePath = path.join(process.cwd(), 'temp');
        this.baseUrl = "https://weibo.com/";
    }

    createHeaders() {
        const xsrfToken = cookiesList.find(cookie => cookie.name === 'XSRF-TOKEN')?.value;
        if (!xsrfToken) {
            throw new Error('XSRF-TOKEN not found in cookies');
        }
        return {
            'x-xsrf-token': xsrfToken,
            'Content-Type': 'application/json',
            'Cookie': cookiesList.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
        };
    }

    async getLoginQRCode() {
        const qrcodePath = await this.getQRCodeImg();
        console.log("发起微博登录扫码");
        await sendNotification("qrcode", { qrcode: qrcodePath, channel: '微博' });
    }

    async getQRCodeImg() {
        try {
            await this.page.goto('https://passport.weibo.com/sso/signin',{waitUntil: 'domcontentloaded'});
            const response = await this.page.waitForResponse(response => response.url().includes('/inf/gen') && response.status() === 200, { timeout: 8000 });
            const url = response.url();
            console.log(`inf/gen request URL: ${url}`);
            return url;
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
            console.log(`微博登录失败: ${e}`);
            await sendNotification("login_success", { islogined: false });
            throw new Error(`微博登录失败: ${e}`);
          
        }
    }

    async saveCookie() {
      try {
          const storageState = await this.browserContext.storageState();
          const cookieJson = JSON.stringify(storageState);
          await SysDictService.addOrUpdate(COOKIE_KEY, cookieJson);
          const localStorageData = storageState.origins[0].localStorage;
          
          const autoplaySigns = localStorageData.find(item => item.name === 'autoplaySigns')?.value;
          console.log('autoplaySigns:', autoplaySigns);
          const userId = autoplaySigns ? Object.keys(JSON.parse(autoplaySigns))[0] : null;
          console.log('userId:', userId);
            if (userId) {
                await WeiboAccountService.saveOrUpdate({id: 1, weibo_account_id: userId.toString()});
            }
          cookies = JSON.parse(cookieJson);
          cookiesList=cookies==undefined?[]: cookies.cookies;
          console.log("微博cookies保存成功");
      } catch (error) {
          console.error(`Failed to save cookies: ${error.message}`);
      }
    }

    async isLogined() {
        try {
            await this.page.goto(this.baseUrl);
            const visible = await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').isVisible();
            if (visible) {
                await sendNotification("login_success", { islogined: true });
                console.log('微博已登录');
                return true;
            }
            console.log('微博没登录');
            return false;
        } catch (error) {
            console.error(`Error occurred: ${error.message}`);
            return false;
            
        }
  
    }

    async doSendPost(content, imgPathList, isSelfSee) {
        if (isSelfSee) {
            await this.page.locator('div[title="公开"]').click();
            await this.page.locator('div:text("仅自己可见")').click();
        }

        await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').fill(content);

        if (imgPathList) {
            const fileInput = await this.page.locator('input[type="file"]');
            for (let imgPath of imgPathList) {
                const filePath = path.resolve(imgPath);
                await fileInput.setInputFiles(filePath);
            }
            let uploadedImagesCount = 0;
            const totalImages = imgPathList.length;

            this.page.on('response', response => {
                if (response.url().includes('bmiddle') && response.status() === 200) {
                    uploadedImagesCount++;
                }
            });

            while (uploadedImagesCount < totalImages) {
                await Utils.sleep(1000); // Wait for all images to be uploaded
            }
        }
        await this.page.locator('span:text("发送")').click();
        return true;
    }

    async send(content, base64ImgList, isSelfSee) {
        this.page.goto('https://weibo.com');
        if (isSelfSee) {
            await this.page.locator('div[title="公开"]').click();
            await this.page.locator('div:text("仅自己可见")').click();
        }
        await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').fill(content);

        if (base64ImgList) {
            const fileInput = await this.page.locator('input[type="file"]');
            for (let item of base64ImgList) {
                const base64ImageData = item.base64;
                const filename = item.name;
                const mimeType = item.type;

                // Decode Base64 data
                const base64Data = base64ImageData.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');

                // Upload the image from the buffer
                await fileInput.setInputFiles([{ buffer, name: filename, mimeType }]);
            }
            let uploadedImagesCount = 0;
            const totalImages = base64ImgList.length;

            this.page.on('response', response => {
                if (response.url().includes('bmiddle') && response.status() === 200) {
                    uploadedImagesCount++;
                }
            });

            while (uploadedImagesCount < totalImages) {
                await Utils.sleep(1000); // Wait for all images to be uploaded
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
        console.log('Deleting posts:', ids);
        const url = 'https://weibo.com/ajax/statuses/destroy';
        const xsrfToken = cookiesList.find(cookie => cookie.name === 'XSRF-TOKEN').value;
   
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

    async deleteWeibo(ids) {
        const url = 'https://weibo.com/ajax/statuses/destroy';
        let headers;
        try {
            headers = this.createHeaders();
        } catch (error) {
            console.error(error.message);
            return;
        }

        for (let idstr of ids) {
            try {
                const response = await axios.post(url, { id: idstr }, { headers });
                if (response.data.ok !== 1) {
                    console.log(`Failed to delete post: ${idstr}`);
                    return false;
                } else {
                    console.log(`Successfully deleted post: ${idstr}`);
                    return true;
                }
            } catch (e) {
                console.error(`Error deleting post ${idstr}: ${e.message}`);
            }
        }
    }

    async longtext(id) {
        const url = 'https://weibo.com/ajax/statuses/longtext';
        let headers;
        try {
            headers = this.createHeaders();
        } catch (error) {
            console.error(error.message);
            return;
        }
        const params = {
            id: id, // Example user ID
        };

        try {
            const response = await axios.get(url, { headers, params });
            if (response.data.ok !== 1) {
                throw new Error('longtext failed');
            } else {
                return response.data;
            }
        } catch (e) {
            console.error(`Error fetching longtext: ${e.message}`);
        }
    }

    async mymblog(userId,pageNumber) {
        try {
            const url = 'https://www.weibo.com/ajax/statuses/mymblog';
            const headers = { Cookie: cookiesList.map(cookie => `${cookie.name}=${cookie.value}`).join('; ') };
  
            if (userId != null) {
                const params = {
                    uid: userId, // Example user ID
                    page: pageNumber,
                    feature: 0,
                };
  
                const response = await axios.get(url, { headers, params });
                return response;
            }
        } catch (err) {
            console.error('调用失败:', err);
        }
    }
  
       async getUserDetails(userId) {
            const url = 'https://weibo.com/ajax/profile/info';
            const params = { uid: userId };
            let headers;
            try {
                headers = this.createHeaders();
            } catch (error) {
                console.error(error.message);
                return {};
            }
            try {
                const response = await axios.get(url, { headers, params });
                return response;
            } catch (error) {
                console.error('Error fetching user details:', error.message);
                return {};
            }
        }
    
    async deleteAllWeibo() {
        await this.page.setCookie(...cookiesList.map(cookie => ({ name: cookie.name, value: cookie.value, domain: 'weibo.com' })));
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

    async modifyVisible({ ids, visible }) {
        const url = 'https://www.weibo.com/ajax/statuses/modifyVisible';
        let headers;
        try {
            headers = this.createHeaders();
        } catch (error) {
            console.error(error.message);
            return false;
        }

        const data = { ids, visible };

        try {
            const response = await axios.post(url, data, { headers });
            if (response.data.ok !== 1) {
                console.error(`Failed to modify visibility for post: ${ids}`);
                return false;
            } else {
                console.log(`Successfully modified visibility for post: ${ids}`);
                return true;
            }
        } catch (error) {
            console.error(`Error modifying visibility for post ${ids}: ${error.message}`);
            return false;
        }
    }

}

export default new WeiboTool();