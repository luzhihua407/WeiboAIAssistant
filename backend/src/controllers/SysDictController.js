import SysDictService from '#root/services/SysDictService.js';
import ResponseModel from '#root/models/ResponseModel.js';
import PageParams from '#root/models/PageParams.js';
const sysDictService = new SysDictService();

export const page = async (req, res) => {
    const params = req.query;  // Extract query parameters
    const pageParams = new PageParams(params);
    const pageNumber = pageParams.pageNo || 1;  // Default to page 1 if not provided
    const pageSize = pageParams.pageSize || 10;  // Default to page 1 if not provided
    const sysDicts = await sysDictService.page(pageNumber, pageSize);
    const responseModel = new ResponseModel({ data: sysDicts });
    return res.json(responseModel.modelDump());
}
export const save = async (req, res) => {
    const sysDictData = req.body;
    const sysDict = await sysDictService.save(sysDictData);
    const responseModel = new ResponseModel({data:sysDict});
    return res.json(responseModel.modelDump());
}
export const update = async (req, res) => {
    const sysDictData = req.body;
    await sysDictService.update(sysDictData);
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
}
export const deleteDict = async (req, res) => {
    const id = req.query.id;
    await sysDictService.deleteDict(id);
    const responseModel = new ResponseModel();
    return res.json(responseModel.modelDump());
}   
export const getDict = async (req, res) => {
    const id = req.query.id;
    const sysDict = await sysDictService.getDict(id);
    const responseModel = new ResponseModel({data:sysDict});
    return res.json(responseModel.modelDump());
}   
