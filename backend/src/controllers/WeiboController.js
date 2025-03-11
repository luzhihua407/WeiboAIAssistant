import WeiboService from '#root/services/WeiboService.js';
import SysDictService from '#root/services/SysDictService.js';
import WeiboAgent from '#root/agents/WeiboAgent.js';
import ResponseModel from '#root/models/ResponseModel.js';
import PageParams from '#root/models/PageParams.js';

const deleteAllWeibo = async (req, res) => {
    await WeiboAgent.deleteAllWeibo();
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};

const weiboPage = async (req, res) => {
    const params = req.query;  // Extract query parameters
    const pageParams = new PageParams(params);
    const pageNumber = pageParams.pageNo || 1;  // Default to page 1 if not provided
    const cookies=await SysDictService.getCookies("weibo_cookie");
    WeiboService.setCookies(cookies.cookies);
    const pageModel = await WeiboService.getWeiboPage(pageNumber);

    const responseModel = new ResponseModel({ data: pageModel });
    return res.json(responseModel.modelDump());
};

const deleteWeibo = async (req, res) => {
    const { ids } = req.body;  // Assuming 'ids' is an array of IDs
    const cookies=await SysDictService.getCookies("weibo_cookie");
    WeiboService.setCookies(cookies.cookies);
    const success = await WeiboService.deleteWeibo(ids);

    const msg = success === 1 ? "删除成功" : "删除失败";
    const responseModel = new ResponseModel({ msg });

    return res.json(responseModel.modelDump());
};

const longtext = async (req, res) => {
    const cookies=await SysDictService.getCookies("weibo_cookie");
    WeiboService.setCookies(cookies.cookies);
    const data = await WeiboService.longtext(req.query.id);
    const responseModel = new ResponseModel({ data });
    return res.json(responseModel.modelDump());
};

const sendWeibo = async (req, res) => {

    const params = req.body;
    await WeiboAgent.send(params.content, params.img_list, params.is_self_see);

    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};

const getUser = async (req, res) => {
    try {
        const user = await WeiboService.getUser();
        const responseModel = new ResponseModel({ data: user });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: 10000, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const login = async (req, res) => {
    try {
        WeiboAgent.signin();
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const refreshQRCode = async (req, res) => {
    try {
        WeiboAgent.getLoginQRCode();
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到异常: ${error.message}`);
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
    longtext,
    login,
    refreshQRCode
};
