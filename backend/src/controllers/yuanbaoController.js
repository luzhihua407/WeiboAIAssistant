import YuanBaoAgent from '../agents/YuanbaoAgent.js';
import ResponseModel from '../models/ResponseModel.js';
import winston from 'winston';
import Config from '../utils/config.js';

const logger = winston; // or any logging library

const login = async (req, res) => {
    const config= await Config.load();
    const agent = new YuanBaoAgent(config);
    try {
        await agent.openBrowser()
        const isLogined = await agent.isLogined();
        if (!isLogined) {
            agent.scanLogin();  // In real app, this would trigger QR code scan
        }else{
            await agent.browserContext.close();
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
    const config= await Config.load();
    const agent = new YuanBaoAgent(config);
    try {
        await agent.ready();
        agent.scanLogin();  // Trigger QR code scan
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

export {
    login,
    refreshQRCode
};
