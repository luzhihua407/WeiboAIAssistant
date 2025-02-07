import SysConfigService from '../services/SysConfigService.js';
import yaml from 'js-yaml';
const sysConfigService = new SysConfigService();



class Config {
    static async load() {
       const data= await sysConfigService.get(1)
       const config = yaml.load(data.content);
       return config;
    }
}

export default Config;
