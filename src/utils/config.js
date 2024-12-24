import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Config {
    static load() {
        // const filePath = path.join(__dirname, 'resources', 'app.yaml');
        const filePath = path.resolve(__dirname, '..', 'resources', 'app.yaml');
        console.log('File Path:', filePath);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const configData = yaml.load(fileContent);
            return configData;
        } catch (error) {
            console.error('Error loading YAML file:', error);
            return null;
        }
    }
}

export default Config;
