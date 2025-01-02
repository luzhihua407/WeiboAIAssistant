import WeiboService from '../services/weiboService.js';
import WeiboAgent from '../agents/weiboAgent.js';
import ResponseModel from '../models/responseModel.js';
import PageParams from '../models/pageParams.js';
import winston from 'winston';

const logger = winston; // or any logging library

const deleteAllWeibo = async (req, res) => {
    const weiboService = new WeiboService();
    await weiboService.deleteAllWeibo();
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};

const weiboPage = async (req, res) => {
    const params = req.query;  // Extract query parameters
    const pageParams = new PageParams(params);
    const pageNumber = pageParams.pageNo || 1;  // Default to page 1 if not provided

    const weiboService = new WeiboService();
    const pageModel = await weiboService.getWeiboPage(pageNumber);

    const responseModel = new ResponseModel({ data: pageModel });
    return res.json(responseModel.modelDump());
};

const deleteWeibo = async (req, res) => {
    const { ids } = req.body;  // Assuming 'ids' is an array of IDs
    const weiboService = new WeiboService();
    const success = await weiboService.deleteWeibo(ids);

    const msg = success === 1 ? "删除成功" : "删除失败";
    const responseModel = new ResponseModel({ msg });

    return res.json(responseModel.modelDump());
};

const sendWeibo = async (req, res) => {
    const weiboService = new WeiboService();
    const params = req.body;
    await weiboService.sendWeibo(params);

    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};

const getUser = async (req, res) => {
    const weiboService = new WeiboService();
    try {
        const user = await weiboService.getUser();
        const responseModel = new ResponseModel({ data: user });
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: 10000, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const login = async (req, res) => {
    const weiboAgent = new WeiboAgent();
    try {
        await weiboAgent.openBrowser();
        weiboAgent.waitLogin();  // Use async function properly
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const refreshQRCode = async (req, res) => {
    const agent = new WeiboAgent();
    try {
        await agent.ready();
        agent.scanLogin();
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

export {
    deleteAllWeibo,
    weiboPage,
    deleteWeibo,
    sendWeibo,
    getUser,
    login,
    refreshQRCode
};
