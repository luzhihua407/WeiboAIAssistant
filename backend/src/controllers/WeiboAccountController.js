import WeiboAccountService from '#root/services/WeiboAccountService.js';
import ResponseModel from '#root/models/ResponseModel.js';


export const save = async (req, res) => {
    const weiboAccountData = req.body;
    const weiboAccount = await WeiboAccountService.save(weiboAccountData);
    const responseModel = new ResponseModel({ data: weiboAccount });
    return res.json(responseModel.modelDump());
}

export const update = async (req, res) => {
    const weiboAccountData = req.body;
    await WeiboAccountService.update(weiboAccountData);
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
}

export const getById = async (req, res) => {
    const weiboAccount = await WeiboAccountService.getById(req.params.id);
    const responseModel = new ResponseModel({ data: weiboAccount });
    return res.json(responseModel.modelDump());
}

export const get = async (req, res) => {
    const weiboAccount = await WeiboAccountService.findOne();
    const responseModel = new ResponseModel({ data: weiboAccount });
    return res.json(responseModel.modelDump());
}
