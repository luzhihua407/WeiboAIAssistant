import fs from 'fs';
import path from 'path';

import winston from 'winston';
import Playwright from '#root/utils/playwright.js';
import WeiboService from '#root/services/WeiboService.js';
const logger = winston; // or any logging library

class BaseAgent {
    constructor(browserContextOptions = null) {
        this.browserContextOptions = browserContextOptions;

    }

    // Abstract methods (these should be implemented in subclasses)
    async fillSubmit(prompt, sysPrompt = null) {
        throw new Error("fillSubmit method not implemented");
    }

    async isLogined() {
        throw new Error("isLogined method not implemented");
    }

    async scanLogin() {
        throw new Error("scanLogin method not implemented");
    }



    async saveCookie() {
        const cookieCachePath = path.resolve(this.cookieCache);
        const storageState = await this.browserContext.storageState();
        fs.writeFileSync(cookieCachePath, JSON.stringify(storageState));
        logger.info(`保存cookie，${cookieCachePath}`);
    }

    async openBrowser() {
        const { browserContextOptions } = this;
        this.browser = await Playwright.getBrowser();
        this.browserContext = await Playwright.getBrowserContext(this.browser,browserContextOptions);
        this.page = await Playwright.newPage(this.browserContext);
        logger.info("Browser opened");
    }

    async ready() {
        await this.openBrowser();
        const isLoggedIn =await this.isLogined();
        if (!isLoggedIn) {
            logger.info("扫码登录...");
            await this.scanLogin();
        }else{
            const weiboService = new WeiboService(this);
            await weiboService.initialize();
            await weiboService.getUser();
        }
    }
}

export default BaseAgent;
