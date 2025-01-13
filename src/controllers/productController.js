import ProductService from '../services/ProductService.js';
import WeiboService from '../services/weiboService.js';
import LLMService from '../services/llmService.js';
import ResponseModel from '../models/responseModel.js';
import Utils  from '../utils/utils.js';
import WeiboAgent from '../agents/weiboAgent.js';
import YuanBaoAgent from '../agents/yuanbaoAgent.js';
const page = async (req, res) => {
    const pageParams = req.query;  // Assuming query parameters for pagination
    const pageNumber = parseInt(pageParams.pageNo) || 1;
    const pageSize = parseInt(pageParams.pageSize) || 10;

    try {
        const productService = new ProductService();
        const responseData = await productService.getPageProducts(pageNumber, pageSize);
        const responseModel = new ResponseModel({ data: responseData });
        return res.json(responseModel.modelDump());
    } catch (err) {
        console.log(err);
        const responseModel = new ResponseModel({ msg: 'Error fetching products', code: 500 });
        return res.status(500).json(responseModel.modelDump());
    }
};

const saveGoods = async (req, res) => {
    const rankId = req.query.rankId;
    const productService = new ProductService();

    try {
        await productService.deleteCoupons();
        await productService.deleteImages();
        await productService.deleteProducts();

        for (let idx = 1; idx <= 5; idx++) {
            const req={
                "rankId" : rankId,
                "sortType" : 2,
                "pageIndex" : idx,
                "pageSize" : 20
            }
            const goods = await productService.getGoodsRank(req);

            for (const item of goods) {
                const { purchasePriceInfo, imgList, couponList } = item;
                const product = {
                    item_id: item.itemId,
                    sku_name: item.skuName,
                    image_url: item.imageUrl,
                    wlprice: item.wlprice,
                    purchase_price: purchasePriceInfo.purchasePrice
                };

                const productId = await productService.saveProduct(product);

                for (const img of imgList) {
                    await productService.saveImage({ product_id: productId, image_url: img });
                }
                if(couponList !=undefined){
                    for (const coupon of couponList) {
                        const couponObj = {
                            product_id: productId,
                            link: coupon.link,
                            discount: coupon.discount,
                            coupon_status: coupon.couponStatus || null
                        };
                        await productService.saveCoupon(couponObj);
                    }
                }
         
            }
        }

        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (err) {
        const responseModel = new ResponseModel({ msg: 'Error saving goods', code: 500 });
        return res.status(500).json(responseModel.modelDump());
    }
};

const get = async (req, res) => {
    const productId = req.query.id;
    const productService = new ProductService();
    const weiboAgent = new WeiboAgent();
    const llmaAgent = new YuanBaoAgent();
    try {
        await weiboAgent.ready();
        const weiboService = new WeiboService(weiboAgent);
        await llmaAgent.ready();
        const llmService = new LLMService(llmaAgent);
        const product = await productService.getProduct(productId);
        const coupons = await productService.getCoupons(product.id);
        const couponUrls = coupons.map(coupon => coupon.link);
        const images = await productService.getImages(product.id);
        const imgList = [];

        for (const image of images) {
            const imgPath = await Utils.downloadImage(image.image_url, './images');
            imgList.push(imgPath);
        }

        const buyUrl = await productService.convertBuyUrl(couponUrls, product.item_id);
        const content = await llmService.generateWeiboPost(product.sku_name);

        const weiboReq = {
            content,
            is_self_see: false,
            img_list: imgList,
            comment: `限时优惠：${buyUrl}`
        };

        await weiboService.sendWeiboAndComment(weiboReq);

        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (err) {
        const responseModel = new ResponseModel({ msg: 'Error fetching product details', code: 500 });
        return res.status(500).json(responseModel.modelDump());
    }finally{
        await weiboAgent.browserContext.close();
        await llmaAgent.browserContext.close();
    }   
};

export { page, saveGoods, get };
