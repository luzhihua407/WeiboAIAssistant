import { format } from 'date-fns';
import Utils from '../../utils/utils.js';
import WeiboAccountService from './weibo-account.js';
import path from 'path';
import WeiboTool from '../../webtool/weibo.js';

class WeiboService {
    constructor() {
        this.storePath = path.join(process.cwd(), 'temp');
    }
    async getWeiboPage(pageNumber) {
      try {
          const account = await WeiboAccountService.findOne();
          const uid = account ? account.weibo_account_id : null;

          if (uid != null) {

              const response = await WeiboTool.mymblog(uid, pageNumber);
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


    // Request user details by ID
    async getUser() {
        const account = await WeiboAccountService.findOne();
        const uid = account ? account.weibo_account_id : null;
        try {
            const response = await WeiboTool.getUserDetails(uid);
            if (response.status === 200 && response.data) {
                if(response.data.ok == 1) {
                    const user = response.data.data?.user || {};
                    const id = user.id;
                    const screen_name = user.screen_name;
                    await WeiboAccountService.saveOrUpdate({ weibo_account_id: id.toString(), weibo_account_name: screen_name });
                    const profileImageUrl = `https://image.baidu.com/search/down?url=${user.profile_image_url}`;
                    const userImg = await Utils.downloadImage(profileImageUrl, this.storePath, 'avatar.png');
                    return { userId: user.idstr, userImg, screenName: user.screen_name, description: user.description };
                
                }
            } else {
                console.error('Failed to fetch user details:', response.statusText);
                return {};
            }
        } catch (error) {
            console.error('Error fetching user details:', error.message);
            return {};
        }
    }

    async sendWeiboAndComment(request) {
        try {
            await WeiboTool.startBrowser();
            await WeiboTool.page.goto(WeiboTool.baseUrl);
            await WeiboTool.doSendPost(request.content + "\n" + request.comment, request.img_list, request.is_self_see);
            await Utils.sleep(3000);
            // Send comment if provided
            if (request.comment) {
                const weiboAccount = await WeiboAccountService.getById(1);
                const weibo_account_name=weiboAccount.weibo_account_name;
                await WeiboTool.sendComment(weibo_account_name, request.comment);
                await WeiboTool.sendLike(weibo_account_name);
            }
            await WeiboTool.stopBrowser();
        } catch (e) {
            console.error(`Error occurred: ${e.message}`);
            await WeiboTool.stopBrowser();
        }
    }
}

export default new WeiboService;