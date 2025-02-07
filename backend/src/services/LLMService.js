import winston from 'winston';
// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

class LLMService {
  constructor(agent) {
    this.agent = agent;
  }

  async generateWeiboPost(prompt) {
    try {
      const sysprompt = `你是一名社交媒体文案专家，请根据用户需求生成文案 文案要求：
1. 突出产品卖点和用户痛点,不要出现“卖点”、“痛点”等字样
2. 包含明确的行动号召（CTA）。
3. 语言简洁、吸引人，尽量口语化，适合微博平台。
4. 适当使用 emoji 增强视觉效果。
5. 直接输出结果,首尾段落不要提示、不要总结,注意微博的排版`;  


      // Step 2: Search and summarize content
      const responseData = await this.runWorkflow(
        new Prompt(prompt, sysprompt)
      );

      return responseData;
    } catch (error) {
      logger.error("发生异常: " + error.message);
    } finally {
      await this.agent.page.close();
    }
  }

  // Simulating the `Workflow` class in Python
  async runWorkflow(promptObj) {
    // Simulate calling an agent's process
    await this.agent.setSseHandler()
    await this.agent.fillSubmit(promptObj.promptText, promptObj.sysPrompt);
    console.log(`<<< ${this.agent.reply} >>>`);
    return this.agent.reply;
  }

}



class Prompt {
  constructor(promptText, sysPrompt) {
    this.promptText = promptText;
    this.sysPrompt = sysPrompt;
  }

  getPrompt() {
    return this.promptText + " " + this.sysPrompt;
  }
}

export default LLMService;
