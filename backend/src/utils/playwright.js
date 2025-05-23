import { chromium } from 'playwright';
import path from 'path';
import ConfigLoader from './config-loader.js';
class Playwright {
    static browser = null;

    // Method to handle disconnected browser
    static handleDisconnected(browser) {
        console.log("Browser connection disconnected", browser);
    }

    // Get the browser instance, launch if not already done
    static async getBrowser() {
        const configData = ConfigLoader.loadConfig();

        const headless = configData.headless !== undefined ? configData.headless : true;
        if (!Playwright.browser) {
            console.log(">>> browser is none");

            Playwright.browser = await chromium.launch({
                headless: headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--window-size=1280,720',  // Set window size
                    '--disable-gpu'  // Disable GPU acceleration
                ]
            });

            Playwright.browser.on("disconnected", Playwright.handleDisconnected);
        } else {
            console.log("Browser connection status", Playwright.browser.isConnected());
        }
        return Playwright.browser;
    }

    // Handle browser context closed event
    static handleClose(browserContext) {
        console.log("Browser context closed", browserContext);
    }

    // Handle new page event
    static handlePage(page) {
        console.log("New page opened", page);
    }

    // Get browser context, create if not exists
    static async getBrowserContext(browser, options = {}) {
        const contextOptions = {
            ...options,
            serviceWorkers: 'block',
            locale: 'zh-CN',
            deviceScaleFactor: 1,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        };
        const browserContext = await browser.newContext(contextOptions);
        const filePath = Playwright.getStealthScriptPath();
        await browserContext.addInitScript({ path: filePath });
        return browserContext;
    }

    // Create a new page in the browser context
    static async newPage(context) {
        
        if (context.pages().length > 0) {
            return context.pages()[0];
        }
        const page = await context.newPage();
        return page;
    }

   
    // Get the path to the stealth script
    static getStealthScriptPath() {
        let filePath;
        if (process.pkg && process.pkg.entrypoint) {
            const entrypointDir = path.dirname(process.pkg.entrypoint);
            const parentDir = path.dirname(entrypointDir);
            filePath = path.join(parentDir, 'assets/stealth.min.js');
        } else {
            filePath = path.join(process.cwd(), 'assets', 'stealth.min.js');
        }
        return filePath;
    }
}


export default Playwright;
