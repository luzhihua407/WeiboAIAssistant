import SysDictService from '../services/SysDictService.js';

class Config {
    static load() {
        const sysDictService=new SysDictService();
        const configData=sysDictService.getDictByCode('app_config');
        console.log(configData)
        return configData;
    }
}

export default Config;
