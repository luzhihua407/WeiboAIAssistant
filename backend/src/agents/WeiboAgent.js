import path from 'path';
import sendNotification from '#root/utils/messageSender.js';
import Utils from '#root/utils/utils.js';
import BaseAgent from '#root/agents/BaseAgent.js';
import Playwright from '#root/utils/playwright.js';
class WeiboAgent extends BaseAgent {
  constructor(config) {
    super();
    this.storePath = path.join(process.cwd(), 'temp');
    this.cookieCache = path.join(process.cwd(), 'cookies', 'weibo.json');
    super.browserContextOptions = {
      storageState: this.cookieCache
    }
    Utils.createJsonFile(this.cookieCache);
    this.baseUrl = config.weibo.baseUrl;
  }

  async getLoginQRCode() {
    const qrcodePath = await this.getQRCodeImg();
    console.log("发起微博登录扫码")
    await sendNotification("not_login", { qrcode: qrcodePath, channel: '微博' });
  }

  async getQRCodeImg() {
    try {
      await this.page.goto('https://passport.weibo.com/sso/signin');
      const qrcodePath = path.join(this.storePath, 'weibo_qrcode.jpg');
      await Utils.sleep(1000); // Delay to wait for QR code to appear
      const img = await this.page.locator('img.w-full');
      Utils.deleteFile(qrcodePath);
      await img.screenshot({ path: qrcodePath });
      return qrcodePath;
    } catch (error) {
      console.error(error)
    }
  
  }


  async scanLogin() {
    try {
      await this.getLoginQRCode();
      const responsePromise  = this.page.waitForResponse('**/config/get_config', { timeout: 60000 });
      // await Utils.sleep(1000);
      const response = await responsePromise;
      console.log("发送微博登录通知")
      if (response.status() === 200) {
        await this.saveCookie();
        await sendNotification("login_success",{islogined: true });
    }
    } catch (e) {
      console.log(`Error occurred: ${e}`);
    } finally {
      await this.page.close();
    }
  }

  async isLogined() {
    await this.page.goto(this.baseUrl);
    const visible = await this.page.locator('textarea[placeholder="有什么新鲜事想分享给大家？"]').isVisible();
    if (visible) {
      await sendNotification("login_success",{islogined: true });
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
    console.log(content);
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
    await Utils.sleep(3000)
    await this.page.locator('span:text("发送")').click();
    return true;
  }

  async send(content, imgList, isSelfSee) {
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
    } finally {
      await this.page.close();
    }
  }

  async deletePost(ids) {
    console.log('Deleting posts:', ids);
    page=await Playwright.initPlaywright();
    const url = 'https://weibo.com/ajax/statuses/destroy';
    const cookies = await page.context().cookies();
    const xsrfToken = Utils.getCookie(cookies, 'XSRF-TOKEN');
    const headers = { 'x-xsrf-token': xsrfToken };

    for (let idstr of ids) {
      const data = { id: idstr };
      try {
        const response = await page.request.post(url, { data, headers });
        const json = await response.json();
        if (!json.ok) {
          console.log(`Failed to delete post: ${idstr}`);
        }
      } catch (e) {
        console.log(`Error deleting post: ${e}`);
      }
    }
    await page.close();
  }


}

export default WeiboAgent;
