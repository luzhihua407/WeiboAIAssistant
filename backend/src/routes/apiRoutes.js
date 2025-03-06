import express from 'express';
import * as jdController from '#root/controllers/JDController.js';
import * as weiboController from '#root/controllers/WeiboController.js';
import * as sysDictController from '#root/controllers/SysDictController.js';
import * as yuanbaoController from '#root/controllers/yuanbaoController.js';
import * as SysConfigController from '#root/controllers/SysConfigController.js';
import * as weiboAccountController from '#root/controllers/WeiboAccountController.js';
import JdAppConfigController from '../controllers/JdAppConfigController.js';

const router = express.Router();

// Product Routes
router.get('/jd/page', jdController.page);
router.get('/jd/get', jdController.get);
router.get('/jd/save_goods', jdController.saveGoods);

// Weibo Routes
router.post('/delete_all_weibo', weiboController.deleteAllWeibo);
router.post('/weibo/send', weiboController.sendWeibo);
router.get('/weibo/page', weiboController.weiboPage);
router.get('/weibo/get_user', weiboController.getUser);
router.get('/weibo/login', weiboController.login);
router.post('/weibo/delete', weiboController.deleteWeibo);
router.get('/weibo/refresh_qrcode', weiboController.refreshQRCode);
router.get('/weibo/longtext', weiboController.longtext);
// Yuanbao Routes
router.get('/yuanbao/login', yuanbaoController.login);
router.get('/yuanbao/refresh_qrcode', yuanbaoController.refreshQRCode);

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

router.get('/sysconfig/get', SysConfigController.get);
router.post('/sysconfig/update', SysConfigController.update);

// JdAppConfig Routes
router.post('/jdAppConfig/updateOrCreateConfig', JdAppConfigController.updateOrCreateConfig);
router.get('/jdAppConfig/:id', JdAppConfigController.getConfigById);
export default router;
