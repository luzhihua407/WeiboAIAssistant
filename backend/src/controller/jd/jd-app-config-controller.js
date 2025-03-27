import JdAppConfigService from '../../service/jd/jd-app-config.js';
import ResponseModel from '../../model/response-model.js';
class JdAppConfigController {
    async createConfig(req, res) {
        try {
            const config = await JdAppConfigService.createConfig(req.body);
            const responseModel = new ResponseModel({ data: config });
            return res.json(responseModel.modelDump());
        } catch (error) {
            const responseModel = new ResponseModel({ error: error.message });
            return res.json(responseModel.modelDump());
        }
    }

    async getConfigById(req, res) {
        try {
            const config = await JdAppConfigService.getConfigById(req.params.id);
            if (config) {
                const responseModel = new ResponseModel({ data: config });
                return res.json(responseModel.modelDump());
            } else {
                const responseModel = new ResponseModel({ error: 'Config not found' });
                return res.status(404).json(responseModel.modelDump());
            }
        } catch (error) {
            const responseModel = new ResponseModel({ error: error.message });
            return res.json(responseModel.modelDump());
        }
    }

    async updateOrCreateConfig(req, res) {
        try {
            const [updated] = await JdAppConfigService.updateConfig(req.body.id, req.body);
            if (updated > 0) {
                const responseModel = new ResponseModel({ message: '配置更新成功' });
                return res.json(responseModel.modelDump());
            } else {
                const config = await JdAppConfigService.createConfig(req.body);
                const responseModel = new ResponseModel({ message: '配置创建成功', data: config });
                return res.json(responseModel.modelDump());
            }
        } catch (error) {
            const responseModel = new ResponseModel({ error: error.message });
            return res.json(responseModel.modelDump());
        }
    }

    async deleteConfig(req, res) {
        try {
            const deleted = await JdAppConfigService.deleteConfig(req.params.id);
            if (deleted) {
                const responseModel = new ResponseModel({ message: 'Config deleted successfully' });
                return res.json(responseModel.modelDump());
            } else {
                const responseModel = new ResponseModel({ error: 'Config not found' });
                return res.status(404).json(responseModel.modelDump());
            }
        } catch (error) {
            const responseModel = new ResponseModel({ error: error.message });
            return res.json(responseModel.modelDump());
        }
    }

    async getAllConfigs(req, res) {
        try {
            const configs = await JdAppConfigService.getAllConfigs();
            const responseModel = new ResponseModel({ data: configs });
            return res.json(responseModel.modelDump());
        } catch (error) {
            const responseModel = new ResponseModel({ error: error.message });
            return res.json(responseModel.modelDump());
        }
    }

    async getConfigByKey(req, res) {
        try {
            const config = await JdAppConfigService.getConfigByKey(req.params.key);
            if (config) {
                const responseModel = new ResponseModel({ data: config });
                return res.json(responseModel.modelDump());
            } else {
                const responseModel = new ResponseModel({ error: 'Config not found' });
                return res.status(404).json(responseModel.modelDump());
            }
        } catch (error) {
            const responseModel = new ResponseModel({ error: error.message });
            return res.json(responseModel.modelDump());
        }
    }
}

export default new JdAppConfigController();