import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

class ConfigLoader {
    static loadConfig() {
        let config;
        if (process.pkg && process.pkg.entrypoint) {
            const entrypointDir = path.dirname(process.pkg.entrypoint);
            const parentDir = path.dirname(entrypointDir);
            config = path.join(parentDir, 'assets/config.yaml');
        } else {
            config = path.join(process.cwd(), 'assets', 'config.yaml');
        }
        let configData;
        try {
            const fileContents = fs.readFileSync(config, 'utf8');
            configData = yaml.load(fileContents);
        } catch (e) {
            console.error("Error reading config file:", e);
            configData = {};
        }
        return configData;
    }
}

export default ConfigLoader;
