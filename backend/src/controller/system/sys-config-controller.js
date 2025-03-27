import SysConfigService from '../../service/system/sys-config.js';
import ResponseModel from '../../model/response-model.js';

const sysConfigService = new SysConfigService();

export const update = async (req, res) => {
    const sysConfig = req.body;
    await sysConfigService.update(sysConfig);
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
}
 
export const get = async (req, res) => {
    const id = req.query.id;
    const sysConfig = await sysConfigService.get(id);
    const responseModel = new ResponseModel({data:sysConfig});
    return res.json(responseModel.modelDump());
}