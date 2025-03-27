import { initializeBrowser, closeBrowser } from '#root/utils/browser-helper.js';

class BaseTool {
    constructor(cookies) {
        if (this.constructor === BaseTool) {
            throw new TypeError('Abstract class "BaseAgent" cannot be instantiated directly.');
        }
        this.browserContext = null;
        this.page = null;
        this.cookies = cookies;
    }

    async startBrowser() {
        try {
            const { browserContext, page } = await initializeBrowser(this.cookies);
            this.browserContext = browserContext;
            this.page = page;
        } catch (error) {
            console.error('Error initializing browser:', error);
        }
    }

    async stopBrowser() {
        try {
            await closeBrowser(this.browserContext);
        } catch (error) {
            console.error('Error closing browser context:', error);
        }
    }

    /**
     * Abstract method to fill and submit a form.
     * @abstract
     * @param {string} prompt - The prompt to fill.
     * @param {string} [sysPrompt=null] - The system prompt.
     * @throws {Error} Must be implemented in derived classes.
     */
    async fillSubmit(prompt, sysPrompt = null) {
        this._throwIfAbstract('fillSubmit');
    }

    /**
     * Abstract method to check if the user is logged in.
     * @abstract
     * @returns {Promise<boolean>}
     * @throws {Error} Must be implemented in derived classes.
     */
    async isLogined() {
        this._throwIfAbstract('isLogined');
    }

    /**
     * Abstract method to perform scan login.
     * @abstract
     * @returns {Promise<void>}
     * @throws {Error} Must be implemented in derived classes.
     */
    async scanLogin() {
        this._throwIfAbstract('scanLogin');
    }

    /**
     * Abstract method to save cookies to the database.
     * @abstract
     * @returns {Promise<void>}
     * @throws {Error} Must be implemented in derived classes.
     */
    async saveCookie() {
        this._throwIfAbstract('saveCookie');
    }

    /**
     * Helper method to throw errors for abstract methods
     * @private
     * @param {string} methodName - Name of the abstract method
     * @throws {Error} Abstract method error
     */
    _throwIfAbstract(methodName) {
        throw new Error(`Abstract method "${methodName}" must be implemented in derived class "${this.constructor.name}"`);
    }

    /**
     * Prepare the agent by opening the browser and checking login status.
     * @returns {Promise<void>}
     */
    async signin() {
        try {
            const isLoggedIn = await this.isLogined();
            if (!isLoggedIn) {
                console.info("Performing scan login...");
                await this.scanLogin();
            }
        } catch (error) {
            console.error(`Error during signin: ${error.message}`);
        }
    }

}

export default BaseTool;