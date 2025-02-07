export class MyCustomError extends Error {
    static CODE_NOTLOGIN = 10000;
  
    constructor(message, errorCode) {
      super(message); // 调用父类 Error 的构造函数
      this.errorCode = errorCode; // 自定义错误码
      this.message = message; // 错误信息
      this.name = 'MyCustomError'; // 错误名称
    }
  }