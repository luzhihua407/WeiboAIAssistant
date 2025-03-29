import Playwright from '#root/utils/playwright.js';

const initializeBrowser = async (cookies) => {
    let browser = await Playwright.getBrowser();
    if (!browser) {
        browser = await Playwright.launchBrowser();
    }

    const browserContext = await Playwright.getBrowserContext(browser, { storageState: cookies });
    const page = await Playwright.newPage(browserContext);
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    
    // 监听所有网络事件
    client.on('Network.requestWillBeSent', request => {
        const headers = request.request?.headers;
        if (headers && headers['x-requested-with'] === 'XMLHttpRequest') {
            console.log(`\n🚀 [XHR Request] ${request.request.method} ${request.request.url}`);
        }
    });

    client.on('Network.responseReceived', async response => {
        const request = await client.send('Network.getRequestPostData', { requestId: response.requestId }).catch(() => null);
        const headers = request?.headers;
        if (headers && headers['x-requested-with'] === 'XMLHttpRequest') {
            console.log(`\n📥 [XHR Response] ${response.response.status}`);
        }
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