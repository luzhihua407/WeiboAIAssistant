export const API_URLS = {
  generateText: '/generate_text',
  yuanbao: {
    checkLogin: '/yuanbao/checkLogin',
    login: '/yuanbao/login',
    refreshQrcode: '/yuanbao/refresh_qrcode',
    generateContent: '/yuanbao/generate_content',
  },
  weibo: {
    page: '/weibo/page',
    getUser: '/weibo/get_user',
    login: '/weibo/login',
    deleteById: '/weibo/delete',
    sendWeibo: '/weibo/send',
    refreshQrcode: '/weibo/refresh_qrcode',
    longtext: '/weibo/longtext',
  },
  weiboAccount: {
    save: '/weiboAccount/save',
    update: '/weiboAccount/update',
    getById: '/weiboAccount/',
    getAll: '/weiboAccount/get',
  },
  jdAppConfig: {
    create: '/jdAppConfig',
    getById: '/jdAppConfig/',
    updateOrCreate: '/jdAppConfig/updateOrCreateConfig',
    delete: '/jdAppConfig/',
    getAll: '/jdAppConfig',
    getByKey: '/jdAppConfig/key/',
  },
  jd: {
    page: '/jd/page',
    get: '/jd/get',
    saveGoods: '/jd/save_goods',
    sendToWeibo: '/jd/sendProductToWeibo',
  },
  sysdict: {
    page: '/sysdict/page',
    get: '/sysdict/get',
    save: '/sysdict/save',
    delete: '/sysdict/delete',
    update: '/sysdict/update',
  },
  sysconfig: {
    get: '/sysconfig/get',
    update: '/sysconfig/update',
  },
};
