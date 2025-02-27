import { chromium} from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Playwright {
    static browser = null;

    // Method to handle disconnected browser
    static handleDisconnected(browser) {
        console.log("Browser connection disconnected", browser);
    }

    // Get the browser instance, launch if not already done
    static async getBrowser(headless = true) {
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

        // Load custom stealth.js script if needed
        const filePath = path.join(process.cwd(), 'assets', 'stealth.min.js');
        await browserContext.addInitScript({ path: filePath });
        return browserContext;
    }

    // Create a new page in the browser context
    static async newPage(context) {
        if(context.pages.length>0){
            return context.pages[0]
        }
        const page = await context.newPage();
        return page;
    }

    // Initialize Playwright, get browser, context, and page
    static async initPlaywright(browserContextOptions) {
        const browser = await Playwright.getBrowser();
        const browserContext = await Playwright.getBrowserContext(browser, browserContextOptions);
        const page = await Playwright.newPage(browserContext);
        return page;
    }

    // Main function to demonstrate usage
    static async main() {
        try {
            const browser = await Playwright.getBrowser();
            const browserContext = await Playwright.getBrowserContext(browser);
            const page = await Playwright.newPage(browserContext);

            await page.goto('https://www.baidu.com');
            console.log(2, browser.isConnected());

            // Perform your actions here...

            await page.close();
            console.log(3, browser.isConnected());

            await browser.close();
            console.log(4, browser.isConnected());
        } catch (err) {
            console.error("Error during Playwright interaction:", err);
        }
    }
}

// // Run the main function to demonstrate usage
// Playwright.main().then(() => {
//     console.log("Playwright interaction completed.");
// }).catch((err) => {
//     console.error("Error running Playwright:", err);
// });

export default Playwright;
