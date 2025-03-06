import yaml from 'js-yaml';
import path from 'path';
import Utils from '#root/utils/utils.js';
import { cwd } from 'node:process';
class Config {
    static async load() {
    try {
        let filePath;
        // 读取文件内容（异步方式）
        if (process.pkg && process.pkg.entrypoint) {
               // 获取可执行文件的目录
            const entrypointDir = path.dirname(process.pkg.entrypoint);
            // 获取上一级目录
            const parentDir = path.dirname(entrypointDir);
            // 打包后的环境
            filePath=path.join(parentDir, 'assets/app.yaml');
          } else {
            // 开发环境
            filePath=path.join(process.cwd(), 'assets', 'app.yaml');
          }

        
        console.log("filePath",filePath)
        const fileContent = Utils.readFile(filePath);
        const config = yaml.load(fileContent);
        return config;
    } catch (error) {
        console.error(error)
    }
   
    }
}

export default Config;
