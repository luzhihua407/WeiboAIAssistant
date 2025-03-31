import SysConfigService from '../../service/system/sys-config.js';
import ResponseModel from '../../model/response-model.js';
import WeiboAccountService from '../../service/weibo/weibo-account.js';
import SysDictService from '../../service/system/sys-dict.js';

const sysConfigService = new SysConfigService();

export const update = async (req, res) => {
    const sysConfig = req.body;
    await sysConfigService.update(sysConfig);
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
};
 
export const get = async (req, res) => {
    const id = req.query.id;
    const sysConfig = await sysConfigService.get(id);
    const responseModel = new ResponseModel({data:sysConfig});
    return res.json(responseModel.modelDump());
};

export const logout = async (req, res) => {
    try {
        await WeiboAccountService.deleteAll(); // Delete all weibo_account records
        await SysDictService.deleteAll(); // Delete all sys_dict records
        const responseModel = new ResponseModel({ message: '删除成功' });
        return res.json(responseModel.modelDump());
    } catch (error) {
        const responseModel = new ResponseModel({ error: error.message });
        return res.status(500).json(responseModel.modelDump());
    }
};