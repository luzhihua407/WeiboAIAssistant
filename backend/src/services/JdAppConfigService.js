import JdAppConfig from '../models/JdAppConfig.js';

class JdAppConfigService {
    async createConfig(data) {
        const existingConfig = await JdAppConfig.findOne();
        if (existingConfig) {
            throw new Error('Only one configuration is allowed.');
        }
        return await JdAppConfig.create(data);
    }

    async getConfigById(id) {
        return await JdAppConfig.findByPk(id);
    }

    async updateConfig(id, data) {
        return await JdAppConfig.update(data, { where: { id } });
    }

    async deleteConfig(id) {
        return await JdAppConfig.destroy({ where: { id } });
    }

    async getAllConfigs() {
        return await JdAppConfig.findAll();
    }

    async getConfigByKey(key) {
        return await JdAppConfig.findOne({ where: { jd_app_key: key } });
    }
}

export default new JdAppConfigService();
