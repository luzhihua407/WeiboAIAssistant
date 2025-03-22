import YuanBaoAgent from '#root/agent/yuanbao-agent.js';
import ResponseModel from '#root/model/response-model.js';
import WeiboAccountService from '#root/service/weibo-account-service.js';
const login = async (req, res) => {
    try {
        const isLogined = await YuanBaoAgent.isLogined();
        if (!isLogined) {
            YuanBaoAgent.scanLogin();  // In real app, this would trigger QR code scan
        }
        const responseModel = new ResponseModel({ data: { is_logined: isLogined } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const checkLogin = async (req, res) => {
    try {
        const isLogined = await YuanBaoAgent.isLogined();
    
        const responseModel = new ResponseModel({ data: { is_logined: isLogined } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const refreshQRCode = async (req, res) => {
    try {
        await YuanBaoAgent.scanLogin();  // Trigger QR code scan
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const generateContent = async (req, res) => {
    try {
        const { input } = req.body;
        const weiboAccount = await WeiboAccountService.getById(1);
        await YuanBaoAgent.setSseHandler()
        await YuanBaoAgent.fillSubmit(input, weiboAccount.system_prompt);
        const content = YuanBaoAgent.reply;
        const responseModel = new ResponseModel({ data: { content:content } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

export {
    login,
    refreshQRCode,
    generateContent,
    checkLogin
};