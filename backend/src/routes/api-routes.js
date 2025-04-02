import express from 'express';
import * as jdController from '../controller/jd/jd-controller.js';
import * as weiboController from '../controller/weibo/weibo-controller.js';
import * as sysDictController from '../controller/system/sys-dict-controller.js';
import * as yuanbaoController from '../controller/yuanbao/yuanbao-controller.js';
import * as sysConfigController from '../controller/system/sys-config-controller.js';
import * as weiboAccountController from '../controller/weibo/weibo-account-controller.js';
import jdAppConfigController from '../controller/jd/jd-app-config-controller.js';
import { isWeiboLoggedIn } from '../middleware/auth-middleware.js'; // Import the middleware
import ResponseModel from '../model/response-model.js';
const router = express.Router();

// Middleware to check if the user is logged in to Weibo
router.use(async (req, res, next) => {
  // Skip middleware for refresh_qrcode routes
  if (req.path.includes('/login')) {
    return next();
  }

  const loggedIn = await isWeiboLoggedIn();
  if (!loggedIn) {
    const responseModel = new ResponseModel({ code: 401, msg: '请先登录微博' });
    return res.status(200).json(responseModel.modelDump());
  }
  next();
});

// Product Routes
router.get('/jd/page', jdController.page);
router.post('/jd/sendProductToWeibo', jdController.sendProductToWeibo);
router.get('/jd/save_goods', jdController.saveGoods);

// Weibo Routes
router.post('/delete_all_weibo', weiboController.deleteAllWeibo);
router.post('/weibo/send', weiboController.sendWeibo);
router.get('/weibo/page', weiboController.weiboPage);
router.get('/weibo/get_user', weiboController.getUser);
router.get('/weibo/login', weiboController.login);
router.post('/weibo/delete', weiboController.deleteWeibo);
router.get('/weibo/longtext', weiboController.longtext);
router.post('/weibo/modify_visible', weiboController.modifyVisible); // Added route for modifyVisible

// Yuanbao Routes
router.get('/yuanbao/login', yuanbaoController.login);
router.get('/yuanbao/checkLogin', yuanbaoController.checkLogin);
router.post('/yuanbao/generate_content', yuanbaoController.chat);

// SysDict Routes
router.get('/sysdict/page', sysDictController.page);
router.post('/sysdict/save', sysDictController.save);
router.post('/sysdict/update', sysDictController.update);
router.get('/sysdict/delete', sysDictController.deleteDict);
router.get('/sysdict/get', sysDictController.getDict);

// WeiboAccount Routes
router.post('/weiboAccount/save', weiboAccountController.save);
router.post('/weiboAccount/update', weiboAccountController.update);
router.get('/weiboAccount/get', weiboAccountController.get);

router.get('/sysconfig/get', sysConfigController.get);
router.post('/sysconfig/update', sysConfigController.update);
router.post('/system/logout', sysConfigController.logout);

// JdAppConfig Routes
router.post('/jdAppConfig/updateOrCreateConfig', jdAppConfigController.updateOrCreateConfig);
router.get('/jdAppConfig/:id', jdAppConfigController.getConfigById);

export default router;