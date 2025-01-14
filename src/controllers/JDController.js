import JDService from '../services/JDService.js';
import WeiboService from '../services/WeiboService.js';
import LLMService from '../services/LLMService.js';
import ResponseModel from '../models/ResponseModel.js';
import Utils  from '../utils/utils.js';
import WeiboAgent from '../agents/WeiboAgent.js';
import YuanBaoAgent from '../agents/YuanbaoAgent.js';
import SysDictService from '../services/SysDictService.js';
const page = async (req, res) => {
    const pageParams = req.query;  // Assuming query parameters for pagination
    const pageNumber = parseInt(pageParams.pageNo) || 1;
    const pageSize = parseInt(pageParams.pageSize) || 10;

    try {
        const sysDictService = new SysDictService();
        const dicts = await sysDictService.getChildDict('jd_api');
        let app_key;
        let app_secret;
        dicts.forEach(item=>{
            if(item.code=='app_key'){
              app_key=item.value;
            }
            if(item.code=='app_secret'){
              app_secret=item.value;
            }
          })
        const jdService = new JDService(app_key,app_secret);
        const responseData = await jdService.getPageProducts(pageNumber, pageSize);
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
    const sysDictService = new SysDictService();
    const dicts = await sysDictService.getChildDict('jd_api');
    let app_key;
    let app_secret;
    dicts.forEach(item=>{
        if(item.code=='app_key'){
          app_key=item.value;
        }
        if(item.code=='app_secret'){
          app_secret=item.value;
        }
      })
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
        const responseModel = new ResponseModel({ msg: 'Error saving goods', code: 500 });
        return res.status(500).json(responseModel.modelDump());
    }
};

const get = async (req, res) => {
    const productId = req.query.id;
    const sysDictService = new SysDictService();
    const dicts = await sysDictService.getChildDict('jd_api');
    let app_key;
    let app_secret;
    dicts.forEach(item=>{
        if(item.code=='app_key'){
          app_key=item.value;
        }
        if(item.code=='app_secret'){
          app_secret=item.value;
        }
      })
    const jdService = new JDService(app_key,app_secret);
    const weiboAgent = new WeiboAgent();
    const llmaAgent = new YuanBaoAgent();
    try {
        await weiboAgent.ready();
        const weiboService = new WeiboService(weiboAgent);
        await llmaAgent.ready();
        const llmService = new LLMService(llmaAgent);
        const product = await jdService.getProduct(productId);
        const coupons = await jdService.getCoupons(product.id);
        const couponUrls = coupons.map(coupon => coupon.link);
        const images = await jdService.getImages(product.id);
        const imgList = [];

        for (const image of images) {
            const imgPath = await Utils.downloadImage(image.image_url, './images');
            imgList.push(imgPath);
        }

        const buyUrl = await jdService.convertBuyUrl(couponUrls, product.item_id);
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
