class PageParams {
    constructor(params) {
        this.pageNo = params.pageNo || 1;
        this.pageSize = params.pageSize || 10;
    }
}

export default PageParams;
