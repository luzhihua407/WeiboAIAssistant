import SysConfig from '../../model/system/sys-config.js';
import sequelize from '../../storage/database.js';
const SysConfigDao = SysConfig.init(sequelize);

class SysConfigService {

  async update(sysConfig) {
    const data = await SysConfigDao.findByPk(sysConfig.id);
    if (data == null) {
      await SysConfigDao.create(sysConfig);
    } else {
      await SysConfigDao.update(sysConfig, { where: { id: sysConfig.id } });
    }
  }

  async get(id) {
    const sysConfig = await SysConfigDao.findByPk(id);
    return sysConfig;
  }

}

export default SysConfigService;