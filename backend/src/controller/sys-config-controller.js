import SysConfigService from '#root/service/sys-config-service.js';
import ResponseModel from '#root/model/response-model.js'; // Corrected import

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