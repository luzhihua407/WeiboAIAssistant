import express from 'express';
import * as productController from '../controllers/productController.js';
import * as weiboController from '../controllers/weiboController.js';
import * as yuanbaoController from '../controllers/yuanbaoController.js';

const router = express.Router();

// Product Routes
router.get('/product/page', productController.page);
router.get('/product/get', productController.get);
router.get('/product/save_goods', productController.saveGoods);

// Weibo Routes
router.post('/delete_all_weibo', weiboController.deleteAllWeibo);
router.post('/weibo/send', weiboController.sendWeibo);
router.get('/weibo/page', weiboController.weiboPage);
router.get('/weibo/get_user', weiboController.getUser);
router.get('/weibo/login', weiboController.login);
router.post('/weibo/delete', weiboController.deleteWeibo);
router.get('/weibo/refresh_qrcode', weiboController.refreshQRCode);

// Yuanbao Routes
router.get('/yuanbao/login', yuanbaoController.login);
router.get('/yuanbao/refresh_qrcode', yuanbaoController.refreshQRCode);

export default router;
