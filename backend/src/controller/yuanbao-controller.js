import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const EventSource = require('eventsource');

import YuanBaoAgent from '#root/agent/yuanbao-agent.js';
import ResponseModel from '#root/model/response-model.js';
import WeiboAccountService from '#root/service/weibo-account-service.js';
import Memory from '#root/utils/memory.js';
import { initializeBrowser, closeBrowser } from '#root/utils/browser-helper.js';
import SysDictService from '#root/service/sys-dict-service.js';

const login = async (req, res) => {
    try {
        const isLogined = await YuanBaoAgent.isLogined();
        if (!isLogined) {
            YuanBaoAgent.scanLogin();  // In real app, this would trigger QR code scan
        }
        const responseModel = new ResponseModel({ data: { is_logined: isLogined } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const checkLogin = async (req, res) => {
    try {
        const isLogined = await YuanBaoAgent.isLogined();
    
        const responseModel = new ResponseModel({ data: { is_logined: isLogined } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const refreshQRCode = async (req, res) => {
    const { browserContext, page } = await initializeBrowser("yuanbao_cookie");
    try {
        YuanBaoAgent.browserContext = browserContext;
        YuanBaoAgent.page = page;
        await YuanBaoAgent.scanLogin();  // Trigger QR code scan
        const responseModel = new ResponseModel();
        await closeBrowser(browserContext);
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        // 确保在发生错误时也关闭浏览器
        await closeBrowser(browserContext);
        return res.json(responseModel.modelDump());
    }
};

const chat = async (req, res) => {
    const { browserContext, page } = await initializeBrowser("yuanbao_cookie");
    try {
        const { input } = req.body;
        const weiboAccount = await WeiboAccountService.getById(1);

        // 初始化浏览器
        YuanBaoAgent.browserContext = browserContext;
        YuanBaoAgent.page = page;
        await page.goto("https://yuanbao.tencent.com/chat");

        // 设置响应头以支持 SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 拦截并中断 SSE 请求，获取其请求参数
        await page.route("**/api/chat/**", async (route) => {
            const originalRequest = route.request();
            const postData = originalRequest.postData();
            console.log('拦截到的 SSE 请求参数:', postData);

            // 中断原始请求
            await route.abort();

            // 使用 fetch 模拟 SSE 请求并实时处理数据
            const response = await fetch(originalRequest.url(), {
                method: originalRequest.method(),
                headers: originalRequest.headers(),
                body: originalRequest.postData()
            });

            if (!response.body) {
                throw new Error('SSE 请求未返回任何数据流');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('SSE 数据流已结束');
                            // 结束 SSE 响应
                    res.end();
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log('实时接收到的 SSE 数据:', chunk);

                // 将实时接收到的数据通过 SSE 响应给客户端
                res.write(`${chunk}\n\n`);
                res.flushHeaders(); // Ensure the headers are flushed to the client immediately
            }
        });

        // 执行操作
        await YuanBaoAgent.fillSubmit(input, weiboAccount.system_prompt);

        // 关闭浏览器
        await closeBrowser(browserContext);


    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);

        // 确保在发生错误时也关闭浏览器
        await closeBrowser(browserContext);

        // 发送错误信息到客户端
        res.write(`event: error\ndata: ${JSON.stringify({ code: error.code, msg: error.message })}\n\n`);
        res.end();
    }
};

export {
    login,
    refreshQRCode,
    chat,
    checkLogin
};