import axios from 'axios';
import fs from 'fs';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import Utils from '../utils/utils.js';
import Config from '../utils/config.js';
import WeiboAgent from '../agents/WeiboAgent.js';
import store from '../store/index.js';
class WeiboService {
  constructor(weiboAgent) {
    const config = Config.load();
    const cookieFile = 'weibo.json';
    this.storePath = config.weibo.storePath;
    const cookieText = fs.readFileSync(this.storePath + cookieFile, 'utf8');
    const cookieJson = JSON.parse(cookieText);
    this.cookies = cookieJson.cookies;
    this.cookieHeader = this.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    this.xsrfToken = this.cookies.find(cookie => cookie.name === 'XSRF-TOKEN').value;
    this.weiboAgent = weiboAgent;
  }

  // Delete all Weibo posts
  async deleteAllWeibo() {
    await this.weiboAgent.page.setCookie(...this.cookies.map(cookie => ({ name: cookie.name, value: cookie.value, domain: 'weibo.com' })));
    await this.weiboAgent.page.goto('https://weibo.com', { waitUntil: 'networkidle0' });

    try {
      await this.weiboAgent.page.click('img[alt="profile"]');
      await this.weiboAgent.page.waitForTimeout(5000);
      let deltaY = 600;

      while (true) {
        const moreButton = await this.weiboAgent.page.locator('i[title="更多"]');
        if (!moreButton) break;

        console.log(`Found visible Weibo: ${await this.weiboAgent.page.$$eval('i[title="更多"]', els => els.length)}`);
        const isVisible = await moreButton.isIntersectingViewport();
        if (!isVisible) {
          deltaY += 100;
          await this.weiboAgent.page.evaluate(deltaY => { window.scrollBy(0, deltaY); }, deltaY);
        }

        await moreButton.click();
        await this.weiboAgent.page.click('div[text="删除"]');
        await this.weiboAgent.page.click('button[text="确定"]');
        await this.weiboAgent.page.waitForTimeout(3000);
        await this.weiboAgent.page.evaluate(deltaY => { window.scrollBy(0, deltaY); }, deltaY);
      }
    } catch (e) {
      console.error(`Error occurred: ${e.message}`);
    }
  }

  // Post Weibo with comment
  async sendWeiboAndComment(request) {
    
    try {
      await this.weiboAgent.doSendPost(request.content+"\n"+request.comment, request.img_list, request.is_self_see);
      await Utils.sleep(3000)
      // Send comment if provided
      if (request.comment) {
        await this.weiboAgent.sendComment("我要省购",request.comment);
        await this.weiboAgent.sendLike("我要省购");
      }
    } catch (e) {
      console.error(`Error occurred: ${e.message}`);
    } finally {
      await this.weiboAgent.page.close();
    }
  }

  // Get Weibo page (your posts)
  async getWeiboPage(pageNumber) {
    const url = 'https://weibo.com/ajax/statuses/mymblog';
    const headers = { Cookie: this.cookieHeader };
    const uid = store.getters.weiboUserId;
    const params = {
      uid: uid, // Example user ID
      page: pageNumber,
      feature: 0,
    };

      const response = await axios.get(url, { headers, params });
      const data = response.data;
      if(data.ok==-100){
        const agent = new WeiboAgent();
        await agent.ready();
        agent.scanLogin();
        return null;
      }
      const total = data.data.total;
      const list = data.data.list;
      const result = list.map(item => {
        const createdAt = format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss');
        return {
          id: item.idstr,
          text: item.text_raw,
          readsCount: item.reads_count,
          commentsCount: item.comments_count,
          visible: item.visible.type === 1 ? '仅自己可见' : '公开',
          createdAt,
        };
      });
      return { total, items: result };
  }

  // Delete Weibo by IDs
  async deleteWeibo(ids) {
    const url = 'https://weibo.com/ajax/statuses/destroy';
    const headers = {
      'x-xsrf-token': this.xsrfToken,
      'Content-Type': 'application/json',
      'Cookie': this.cookieHeader
    };

    for (let idstr of ids) {
      try {
        const response = await axios.post(url, { id: idstr }, { headers});
        if (response.data.ok !== 1) {
          throw new Error('Delete failed');
        }
      } catch (e) {
        console.error(`Error deleting Weibo: ${e.message}`);
      }
    }
  }

  // Get user profile
  async getUser() {
    const url = 'https://weibo.com/';
    const headers = { Cookie: this.cookieHeader };

      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data);
      const script = $('script').toArray().find(s => s.children[0] && s.children[0].data.includes('window.$CONFIG'));

      if (script) {
        const jsonMatch = /window\.\$CONFIG\s*=\s*(\{.*?\});/s.exec(script.children[0].data);
        if (jsonMatch) {
          const config = JSON.parse(jsonMatch[1]);
          const user = config.user;
          if(user!=undefined){

            const profileImageUrl = `https://image.baidu.com/search/down?url=${user.profile_image_url}`;
            const userImg = await Utils.downloadImage(profileImageUrl, this.storePath, 'avatar.png');
            store.dispatch('setWeiboUserId', { "weiboUserId": user.idstr });
            return { userId: user.idstr, userImg };
          }
        }
      }
      throw new Error('User not logged in');

  }
}

export default WeiboService;
