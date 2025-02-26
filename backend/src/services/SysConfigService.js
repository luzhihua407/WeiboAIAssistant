import SysConfig from '#root/models/SysConfig.js';
class SysConfigService {


  async update(sysConfig) {
    const data=await SysConfig.findByPk(sysConfig.id);
    if(data==null){
      await SysConfig.create(sysConfig);
    }else{  
      await SysConfig.update(sysConfig,{where:{id:sysConfig.id}});
    }
  }


  async get(id) {
    const sysConfig = await SysConfig.findByPk(id);
    return sysConfig;
  }


}

export default SysConfigService;
