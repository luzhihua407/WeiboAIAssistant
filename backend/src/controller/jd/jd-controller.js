import JDService from '../../service/jd/jd.js';
import ResponseModel from '../../model/response-model.js';
import Utils from '../../utils/utils.js';
import JdAppConfigService from '../../service/jd/jd-app-config.js';
import ConfigLoader from '../../utils/config-loader.js';

const page = async (req, res) => {
    const pageParams = req.query;  // Assuming query parameters for pagination
    const pageNumber = parseInt(pageParams.pageNo) || 1;
    const pageSize = parseInt(pageParams.pageSize) || 10;

    try {
        const jdConfig = await JdAppConfigService.getConfigById(1);
        if (!jdConfig) {
            const responseModel = new ResponseModel({ msg: '京东app_key没配置', code: 404 });
            return res.status(200).json(responseModel.modelDump());
        }
        const app_key=jdConfig.jd_app_key;
        const app_secret=jdConfig.jd_app_secret;
        const jdService = new JDService(app_key,app_secret);
        const responseData = await jdService.getPageProducts(pageNumber, pageSize);
        const responseModel = new ResponseModel({ data: responseData });
        return res.json(responseModel.modelDump());
    } catch (err) {
        console.log(err);
        const responseModel = new ResponseModel({ msg: err.message, code: 500 });
        return res.status(200).json(responseModel.modelDump());
    }
};

const saveGoods = async (req, res) => {
    const rankId = req.query.rankId;
    const jdConfig = await JdAppConfigService.getConfigById(1);
    const app_key=jdConfig.jd_app_key;
    const app_secret=jdConfig.jd_app_secret;
    const jdService = new JDService(app_key,app_secret);

    try {
        await jdService.deleteCoupons();
        await jdService.deleteImages();
        await jdService.deleteProducts();

        for (let idx = 1; idx <= 5; idx++) {
            const req={
                "rankId" : rankId,
                "sortType" : 2,
                "pageIndex" : idx,
                "pageSize" : 20
            }
            const goods = await jdService.getGoodsRank(req);

            for (const item of goods) {
                const { purchasePriceInfo, imgList, couponList } = item;
                const product = {
                    item_id: item.itemId,
                    sku_name: item.skuName,
                    image_url: item.imageUrl,
                    wlprice: item.wlprice,
                    purchase_price: purchasePriceInfo.purchasePrice
                };

                const productId = await jdService.saveProduct(product);

                for (const img of imgList) {
                    await jdService.saveImage({ product_id: productId, image_url: img });
                }
                if(couponList !=undefined){
                    for (const coupon of couponList) {
                        const couponObj = {
                            product_id: productId,
                            link: coupon.link,
                            discount: coupon.discount,
                            coupon_status: coupon.couponStatus || null
                        };
                            await jdService.saveCoupon(couponObj);
                    }
                }
         
            }
        }

        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (err) {
        const responseModel = new ResponseModel({ msg: err, code: 500 });
        return res.status(200).json(responseModel.modelDump());
    }
};

const sendProductToWeibo = async (req, res) => {
    const productId = req.body.id;
    const content = req.body.content;
    const jdConfig = await JdAppConfigService.getConfigById(1);
    const app_key=jdConfig.jd_app_key;
    const app_secret=jdConfig.jd_app_secret;
    const jdService = new JDService(app_key,app_secret);
    try {
        const product = await jdService.getProduct(productId);
        const coupons = await jdService.getCoupons(product.id);
        const couponUrls = coupons.map(coupon => coupon.link);
        const images = await jdService.getImages(product.id);
        const imgList = [];

        for (const image of images) {
            const imgPath = await Utils.downloadImage(image.image_url, './temp');
            imgList.push(imgPath);
        }

        const buyUrl = await jdService.convertBuyUrl(couponUrls, product.item_id);
        const configData = ConfigLoader.loadConfig();

        const weiboReq = {
            content,
            is_self_see: configData.weibo.is_self_see,
            img_list: imgList,
            comment: `限时优惠：${buyUrl}`
        };

        await WeiboService.sendWeiboAndComment(weiboReq);

        const responseModel = new ResponseModel();
        return res.json(responseModel.modelDump());
    } catch (err) {
        console.error(err);
        const responseModel = new ResponseModel({ msg: err.message, code: 500 });
        return res.status(200).json(responseModel.modelDump());
    }
};

export { page, saveGoods, sendProductToWeibo };