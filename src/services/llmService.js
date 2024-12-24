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
      const sysprompt = `
        禁止用语气词开头
        禁止用夸张的词语修饰
        禁止使用正式、重复和机械化、夸张的语气
        -禁止使用的词汇如下:
        -1. 然而 2. 此外 3. 总之 4. 因此 5. 综上所述 6. 例如 7. 基于此 8. 显而易见 9. 值得注意的是 10. 不可否认 11. 从某种程度上 12. 换句话说 13. 由于……原因 14. 尽管如此15. 由此可见 16. 因此可见 17. 不可避免地 18. 事实上 19. 一方面……另一方面 20. 显著 21. 通过……可以看出 22. 在此基础上 23. 尤其是 24. 根据…… 25. 基于以上分析 26. 毫无疑问 27. 值得一提的是 28. 相较于 29. 可见 30. 因此可以推断 31. 进一步而言 32. 如上所述 33. 结合实际情况 34. 综合考虑 35. 在此过程中 36. 进一步分析 37. 在一定程度上 38. 相反 39. 尤其值得关注 40. 从而 41. 上述 42. 这表明
        -避免出现以下词汇：
        -1. 首先 2. 其次 3. 最后 4. 第一 5. 第二 6. 第三 7. 另外 8. 再者 9. 接下来 10. 然后 11. 最终 12. 进一步 13. 由此 14. 因为 15. 所以 16. 由此可见 17. 总的来说 18. 总结一下 19. 简而言之 20. 结果是 21. 如前所述 22. 在此基础上 23. 总之 24. 说到最后 25. 当然
        用日常对话的方式表达，多用口语。
        独特性表达、独特的措辞。有立场鲜明的观点、视角。表现出多变的句子结构。
        细致入微的情感表达、转换。句子长短恰当。
        丰富细节描述，增强真实感。
      `;

      // Step 1: Generate basic reply
      const reply1 = await this.runWorkflow(
        new Prompt(prompt, "识别出重点词汇，不要包括数字的,直接返回需要的结果。")
      );

      // Step 2: Search and summarize content
      const reply2 = await this.runWorkflow(
        new Prompt(reply1, "联网搜索归纳知识，整理分享，要求:" + sysprompt + "，内容是")
      );

      // Step 3: Reword the result with a new format
      const responseData = await this.runWorkflow(
        new Prompt(reply2, "换另一种形式表达每一句话，直接输出结果,首尾段落不要提示、不要总结,加上微博话题，注意微博的排版")
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
    logger.info(`<<< ${promptObj.promptText} >>>`);
    // Simulate calling an agent's process
    await this.agent.setSseHandler()
    await this.agent.fillSubmit(promptObj.promptText, promptObj.sysPrompt);
    logger.info(`<<< ${this.agent.reply} >>>`);
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
