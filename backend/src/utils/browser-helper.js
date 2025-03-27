import Playwright from '#root/utils/playwright.js';
import SysDictService from '#root/service/system/sys-dict.js';

const initializeBrowser = async (cookieKey) => {
    let browser = await Playwright.getBrowser();
    if (!browser) {
        browser = await Playwright.launchBrowser();
    }
    const cookies = await SysDictService.getCookies(cookieKey);
    const browserContext = await Playwright.getBrowserContext(browser, { storageState: cookies });
    const page = await Playwright.newPage(browserContext);
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    
    // 监听所有网络事件
    client.on('Network.requestWillBeSent', request => {
        console.log(`\n🚀 [Request] ${request.request.method} ${request.request.url}`);
    });

    client.on('Network.responseReceived', async response => {
        console.log(`\n📥 [Response] ${response.response.status} ${response.response.url}`);
    });

    return { browserContext, page,cookies };
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