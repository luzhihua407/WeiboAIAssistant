import WeiboService from '../../service/weibo/weibo.js';
import ResponseModel from '../../model/response-model.js';
import PageParams from '../../model/page-params.js';
import WeiboTool from '../../webtool/weibo.js';

const deleteAllWeibo = async (req, res) => {
    await WeiboTool.deleteAllWeibo();
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};

const weiboPage = async (req, res) => {
    const params = req.query;  // Extract query parameters
    const pageParams = new PageParams(params);
    const pageNumber = pageParams.pageNo || 1;  // Default to page 1 if not provided
    const pageModel = await WeiboService.getWeiboPage(pageNumber);

    const responseModel = new ResponseModel({ data: pageModel });
    return res.json(responseModel.modelDump());
};

const deleteWeibo = async (req, res) => {
    const { ids } = req.body;  // Assuming 'ids' is an array of IDs
    const success = await WeiboTool.deleteWeibo(ids);

    const msg = success == true ? "删除成功" : "删除失败";
    const responseModel = new ResponseModel({ msg });

    return res.json(responseModel.modelDump());
};

const longtext = async (req, res) => {
    const data = await WeiboTool.longtext(req.query.id);
    const responseModel = new ResponseModel({ data });
    return res.json(responseModel.modelDump());
};

const sendWeibo = async (req, res) => {
    await WeiboTool.startBrowser();
    await WeiboTool.page.goto(WeiboTool.baseUrl);
    const params = req.body;
    await WeiboTool.send(params.content, params.img_list, params.is_self_see);
    await WeiboTool.stopBrowser();
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};

const getUser = async (req, res) => {
    try {
        const user = await WeiboService.getUser();

        if (user.userId == null) {
            console.error('用户信息为空');
            const responseModel = new ResponseModel({ code: 10000, msg: "用户信息为空" });
            return res.json(responseModel.modelDump());
        }

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
        await WeiboTool.startBrowser();
        WeiboTool.signin().then(() => {
        }).catch((error) => {
            console.error('登录失败:', error.message);
        }).finally(() => {
            console.log('登录流程结束');
            WeiboTool.stopBrowser().then(() => {
                console.log('浏览器已关闭');
            });
        });
        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (error) {
        logger.error(`捕获到异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};


const modifyVisible = async (req, res) => {
    const { ids, visible } = req.body; // Extract 'ids' and 'visible' from the request body
    const success = await WeiboTool.modifyVisible({ ids, visible });

    const msg = success ? "修改可见性成功" : "修改可见性失败";
    const responseModel = new ResponseModel({ msg });

    return res.json(responseModel.modelDump());
};

export {
    deleteAllWeibo,
    weiboPage,
    deleteWeibo,
    sendWeibo,
    getUser,
    longtext,
    login,
    modifyVisible
};