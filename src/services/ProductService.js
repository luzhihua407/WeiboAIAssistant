// services/productService.js
import JdProductInfo from '../models/JdProductInfo.js';
import JdProductImageInfo from '../models/JdProductImageInfo.js';
import JdCouponInfo from '../models/JdCouponInfo.js';
import { appinfo, UnionOpenGoodsCombinationpageGetRequest, UnionOpenGoodsRankQueryRequest, RankGoodsReq } from './JdApi.js';
import { MyCustomError } from '../exception/Exception.js';
class ProductService {
  app_key = "e23d84918d8ac7fa077d286b41bf1332";
  app_secret = "f40faeb3ad0444b9b7b78fa28970d7ef";
  url = 'https://api.jd.com/routerjson';
  constructor() {
    // Initialize withset_app_info your app-specific credentials (replace with actual values)
  }
  async getPageProducts(pageNumber, pageSize) {
    console.log(">>>",pageNumber,pageSize)
    try {
      const products = await JdProductInfo.findAll({
        order: [['id', 'ASC']],
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize
      });
      // 使用 count 方法获取总数
      const total = await JdProductInfo.count();

      const responseData = {
        products,
        page_number: pageNumber,
        has_previous: pageNumber > 1,
        has_next: total === pageSize,
        total_pages: Math.ceil(total / pageSize),
        total: total
      };
      return responseData;
    } catch (error) {
      console.log(error)
    }

  }

  // Move all functions inside the class as methods
  async saveProduct(productData) {
    const product = await JdProductInfo.create(productData);
    return product.id;
  }

  async saveImage(imageData) {
    const image = await JdProductImageInfo.create(imageData);
    return image.id;
  }

  async saveCoupon(couponData) {
    const coupon = await JdCouponInfo.create(couponData);
    return coupon.id;
  }

  async deleteCoupons() {
    await JdCouponInfo.destroy({ where: {} });
  }

  async deleteImages() {
    await JdProductImageInfo.destroy({ where: {} });
  }

  async deleteProducts() {
    await JdProductInfo.destroy({ where: {} });
  }

  async getImages(productId) {
    const images = await JdProductImageInfo.findAll({
      where: { product_id: productId }
    });
    return images;
  }

  async getProduct(id) {
    const product = await JdProductInfo.findByPk(id);
    return product;
  }

  async getCoupons(productId) {
    const coupons = await JdCouponInfo.findAll({
      where: { product_id: productId }
    });
    return coupons;
  }

  // Simulate setting default app info (like your API key and secret)
  setDefaultAppInfo(appKey, appSecret) {
    // Your app-specific initialization logic, if any
    console.log('App Info Initialized', appKey, appSecret);
  }

  // Fetching a product page (simulating the database call for page products)

  // Convert Buy URL for a specific product
  async convertBuyUrl(couponUrls, itemId) {
    try {
      const apiRequest = new UnionOpenGoodsCombinationpageGetRequest(this.url, 80);
      const req = {
        skuInfo: JSON.stringify([{ itemId: itemId, num: 1 }]),
        couponUrls: couponUrls
      };
      apiRequest.combinationGoodsPageReq = req;
      apiRequest.set_app_info(new appinfo(this.app_key, this.app_secret));
      const response = await apiRequest.getResponse();
      const result = JSON.parse(response.jd_union_open_goods_combinationpage_get_responce.getResult);

      if (result.code === 200) {
        return result.data.clickURL;
      } else {
        throw new MyCustomError(result.message, result.code);
      }
    } catch (err) {
      console.error('Error converting buy URL:', err);
      throw err;
    }
  }

  // Get goods rank from JD API
  async getGoodsRank(req) {
    try {
      const apiRequest = new UnionOpenGoodsRankQueryRequest(this.url, 80);
      apiRequest.set_app_info(new appinfo(this.app_key, this.app_secret));
      apiRequest.RankGoodsReq = req
      const response = await apiRequest.getResponse();
      console.log('API Response:', response);

      const result = JSON.parse(response.jd_union_open_goods_rank_query_responce.queryResult);

      if (result.code === 200) {
        return result.data;
      } else {
        throw new MyCustomError(result.message, result.code);
      }
    } catch (err) {
      console.error('Error fetching goods rank:', err);
      throw err;
    }
  }


}

export default ProductService;
