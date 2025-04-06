import WeiboAccountService from '../service/weibo/weibo-account.js';


export async function isWeiboLoggedIn() {
  const user = await WeiboAccountService.findOne();
  return user && user.weibo_account_id; // Check if user exists and has a valid weibo_user_id
}

