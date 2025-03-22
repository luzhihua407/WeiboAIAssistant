import Playwright from '#root/utils/playwright.js';
import SysDictService from '#root/service/sys-dict-service.js';

const initializeBrowser = async (cookieKey) => {
    let browser = await Playwright.getBrowser();
    if (!browser) {
        browser = await Playwright.launchBrowser();
    }
    const cookies = await SysDictService.getCookies(cookieKey);
    const browserContext = await Playwright.getBrowserContext(browser, { storageState: cookies });
    const page = await Playwright.newPage(browserContext);
    return { browserContext, page };
};

const closeBrowser = async (browserContext) => {
    try {
        if (browserContext) {
            await browserContext.close(); // 关闭浏览器上下文
        }
    } catch (error) {
        console.error('Error closing browser context:', error);
    }
};
export { initializeBrowser, closeBrowser };