class BaseAgent {

    /**
     * Abstract method to fill and submit a form.
     * @param {string} prompt - The prompt to fill.
     * @param {string} [sysPrompt=null] - The system prompt.
     * @throws Will throw an error if the method is not implemented.
     */
    async fillSubmit(prompt, sysPrompt = null) {
        throw new Error("fillSubmit method not implemented");
    }

    /**
     * Abstract method to check if the user is logged in.
     * @throws Will throw an error if the method is not implemented.
     */
    async isLogined() {
        throw new Error("isLogined method not implemented");
    }

    /**
     * Abstract method to perform scan login.
     * @throws Will throw an error if the method is not implemented.
     */
    async scanLogin() {
        throw new Error("scanLogin method not implemented");
    }

    /**
     * Save cookies to the database.
     */
    async saveCookie() {
    
    }

    /**
     * Prepare the agent by opening the browser and checking login status.
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

export default BaseAgent;