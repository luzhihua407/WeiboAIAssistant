import axios from 'axios';

const AxiosUtil = (baseUrl) => ({
  instance: axios.create({
    baseURL: baseUrl,
    timeout: 120000,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // 添加请求拦截器
  initRequestInterceptor() {
    this.instance.interceptors.request.use(
      function (config) {
        // 打印请求数据
        console.log('Request Data:', config.data);
        console.log('Request Params:', config.params);

        // 在发送请求之前做些什么，例如添加认证信息
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
      }
    );
  },

  // 添加响应拦截器
  initResponseInterceptor() {
    this.instance.interceptors.response.use(
      function (response) {
        // 打印响应数据
        console.log('Response Data:', response.data);
        console.log('Response Status:', response.status);

        // 对响应数据做点什么，例如将数据转换为特定格式
        return response.data;
      },
      function (error) {
        // 对响应错误做点什么，例如处理错误
        if (error.response) {
          console.error('Response Error Data:', error.response.data);
          console.error('Response Error Status:', error.response.status);
        } else {
          console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  },

  async request(method, url, data = {}, params = {}) {
    try {
      const response = await this.instance({
        method,
        url,
        data,
        params,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async get(url, params) {
    return this.request('get', url, {}, params);
  },

  async post(url, data) {
    return this.request('post', url, data);
  },

  async put(url, data) {
    return this.request('put', url, data);
  },

  async delete(url) {
    return this.request('delete', url);
  },
});
const baseUrl = '/api';
// 直接添加拦截器
const api = AxiosUtil(baseUrl);
api.initRequestInterceptor();
api.initResponseInterceptor();

export default api;