import YuanBaoTool from '../../webtool/yuanbao.js';
import ResponseModel from '../../model/response-model.js';
import WeiboAccountService from '../../service/weibo/weibo-account.js';
    
const login = async (req, res) => {
    try {
        await YuanBaoTool.startBrowser();
        const isLogined = await YuanBaoTool.isLogined();
        if (!isLogined) {
            YuanBaoTool.scanLogin();  // In real app, this would trigger QR code scan
        }
        await YuanBaoTool.stopBrowser();  // Close the browser after checking login status
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
        const isLogined = await YuanBaoTool.isLogined();
        const responseModel = new ResponseModel({ data: { is_logined: isLogined } });
        return res.json(responseModel.modelDump());
    } catch (error) {
        console.error(`捕获到自定义异常: ${error}`);
        const responseModel = new ResponseModel({ code: error.code, msg: error.message });
        return res.json(responseModel.modelDump());
    }
};

const chat = async (req, res) => {
    try {
        const { input } = req.body;
        const weiboAccount = await WeiboAccountService.getById(1);

        await YuanBaoTool.startBrowser();
        await YuanBaoTool.page.goto("https://yuanbao.tencent.com/chat");

        // 设置响应头以支持 SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 拦截并中断 SSE 请求，获取其请求参数
        await YuanBaoTool.page.route("**/api/chat/**", async (route) => {
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
        await YuanBaoTool.fillSubmit(input, weiboAccount.system_prompt);

        // 关闭浏览器
        await YuanBaoTool.stopBrowser();


    } catch (error) {
        console.error(`捕获到自定义异常: ${error.message}`);

        // 确保在发生错误时也关闭浏览器
        await YuanBaoTool.stopBrowser();
        // 发送错误信息到客户端
        res.write(`event: error\ndata: ${JSON.stringify({ code: error.code, msg: error.message })}\n\n`);
        res.end();
    }
};

export {
    login,
    chat,
    checkLogin
};