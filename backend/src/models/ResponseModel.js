class ResponseModel {
    constructor({ data = null, msg = '', code = 200 } = {}) {
        this.data = data;
        this.msg = msg;
        this.code = code;
    }

    modelDump() {
        return {
            data: this.data,
            msg: this.msg,
            code: this.code
        };
    }
}

export default ResponseModel;
