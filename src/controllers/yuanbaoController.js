import YuanBaoAgent from '../agents/yuanbaoAgent.js';
import Playwright from '../utils/playwright.js';
import ResponseModel from '../models/responseModel.js';
import winston from 'winston';

const logger = winston; // or any logging library

const login = async (req, res) => {
    const agent = new YuanBaoAgent();
    try {
        await agent.openBrowser()
        const isLogined = await agent.isLogined();
        if (!isLogined) {
            agent.scanLogin();  // In real app, this would trigger QR code scan
        }
        const responseModel = new ResponseModel({ data: { is_logined: isLogined } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const refreshQRCode = async (req, res) => {
    const agent = new YuanBaoAgent();
    try {
        agent.scanLogin();  // Trigger QR code scan
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const test2 = async (req, res) => {
    try {
        const browser = await Playwright.getBrowser();
        const context = await Playwright.getBrowserContext(browser);
        const page = await Playwright.newPage(context);
        await page.goto("https://www.baidu.com");

        console.log(2, browser.isConnected());
        // Your operations go here...
        await page.close();
        console.log(3, browser.isConnected());

        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    }
};

const test3 = async (req, res) => {
    try {
        const browser = await Playwright.getBrowser();
        const context = await Playwright.getBrowserContext(browser);
        const page = await Playwright.newPage(context);
        await page.goto("https://www.baidu.com");

        console.log(4, browser.isConnected());
        // Your operations go here...
        await page.close();
        console.log(5, browser.isConnected());

        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    }
};

export {
    login,
    refreshQRCode,
    test2,
    test3
};
