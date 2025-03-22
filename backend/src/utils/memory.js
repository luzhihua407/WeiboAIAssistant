class Memory {
    constructor() {
        this.latestResponse = null;
    }

    // 存储最新的响应结果
    store(response) {
        this.latestResponse = response;
    }
    // 清除最新的响应结果
    clear() {
        this.latestResponse = null;
    }
    // 提取最新的响应结果
    retrieve() {
        return this.latestResponse;
    }
}

export default new Memory();