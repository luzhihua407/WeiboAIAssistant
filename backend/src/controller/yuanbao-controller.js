import YuanBaoAgent from '#root/agent/yuanbao-agent.js';
import ResponseModel from '#root/model/response-model.js';
import WeiboAccountService from '#root/service/weibo-account-service.js';
import Memory from '#root/utils/memory.js';
import { initializeBrowser, closeBrowser } from '#root/utils/browser-helper.js';
import SysDictService from '#root/service/sys-dict-service.js';
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
    const {browserContext,page} = await initializeBrowser("yuanbao_cookie");
    try {
        const { input } = req.body;
        const weiboAccount = await WeiboAccountService.getById(1);

        // 初始化浏览器
        YuanBaoAgent.browserContext = browserContext;
        YuanBaoAgent.page = page;

        // 执行操作
        await YuanBaoAgent.setSseHandler();
        await YuanBaoAgent.fillSubmit(input, weiboAccount.system_prompt);

        // 从记忆类中提取最新的响应结果
        const content = Memory.retrieve();

        // 关闭浏览器
        await closeBrowser(browserContext);

        const responseModel = new ResponseModel({ data: { content: content } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);

        // 确保在发生错误时也关闭浏览器
        await closeBrowser(browserContext);

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