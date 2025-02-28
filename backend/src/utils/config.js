import yaml from 'js-yaml';
import path from 'path';
import Utils from '#root/utils/utils.js';
class Config {
    static async load() {
    try {
        // 读取文件内容（异步方式）
        const filePath=path.join(process.cwd(), 'assets', 'app.yaml');
        console.log("filePath",filePath)
        const fileContent = Utils.readFile(filePath);
        console.log("fileContent",fileContent)
        const config = yaml.load(fileContent);
        return config;
    } catch (error) {
        console.error(error)
    }
   
    }
}

export default Config;
