import axios from 'axios';
import { format } from 'date-fns';
import Utils from '#root/utils/utils.js';
import WeiboAccountService from './WeiboAccountService.js';
import path from 'path';
import * as cheerio from 'cheerio';

class WeiboService {
    constructor() {
        this.storePath = '';
        this.xsrfToken = '';
        this.cookieHeader = '';
        this.cookies = '';
        this.storePath = path.join(process.cwd(), 'temp');
    }
    setCookies(cookies) {
        this.cookies = cookies
        this.cookieHeader = this.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');  
        this.xsrfToken = this.cookies.find(cookie => cookie.name === 'XSRF-TOKEN').value;
    }
    async getWeiboPage(pageNumber) {
      try {
          const url = 'https://www.weibo.com/ajax/statuses/mymblog';
          const headers = { Cookie: this.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ') };
          const account = await WeiboAccountService.findOne();
          const uid = account ? account.weibo_account_id : null;

          if (uid != null) {
              const params = {
                  uid: uid, // Example user ID
                  page: pageNumber,
                  feature: 0,
              };

              const response = await axios.get(url, { headers, params });
              const data = response.data;
              if (data.ok == -100) {
                  console.error('微博未登录');
                  throw new Error('微博未登录');
              }
              const total = data.data.total;
              const list = data.data.list;
              const result = list.map(item => {
                  const createdAt = format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss');
                  return {
                      id: item.idstr,
                      text: item.text,
                      pic_infos: item.pic_infos,
                      readsCount: item.reads_count,
                      commentsCount: item.comments_count,
                      visible: item.visible.type === 1 ? '仅自己可见' : '公开',
                      createdAt,
                  };
              });
              return { total, items: result };
          }
      } catch (err) {
          console.error('调用失败:', err);
      }
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
                const response = await axios.post(url, { id: idstr }, { headers });
                if (response.data.ok !== 1) {
                    throw new Error('Delete failed');
                }
            } catch (e) {
                console.error(`Error deleting Weibo: ${e.message}`);
            }
        }
    }

    async longtext(id) {
        const url = 'https://weibo.com/ajax/statuses/longtext';
        const headers = {
            'x-xsrf-token': this.xsrfToken,
            'Content-Type': 'application/json',
            'Cookie': this.cookieHeader
        };
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
                if (user != undefined) {
                    const id = user.id;
                    const screen_name = user.screen_name;
                    await WeiboAccountService.saveOrUpdate({ weibo_account_id: id.toString(), weibo_account_name: screen_name });
                    const profileImageUrl = `https://image.baidu.com/search/down?url=${user.profile_image_url}`;
                    const userImg = await Utils.downloadImage(profileImageUrl, this.storePath, 'avatar.png');
                    return { userId: user.idstr, userImg, screenName: user.screen_name, description: user.description };
                }else{
                    console.error("微博未登录");
                }
            }
        }
        
    }
}

export default new WeiboService;
