// api.js
import api from './axios-util';
import { API_URLS } from './api-urls';

export async function generateText(data) {
    const url = API_URLS.generateText;
    try {
      const response = await api.post(url, data);
      console.log('操作成功:', response);
      return response;
    } catch (error) {
      console.error('操作失败:', error);
      throw error;
    }
  }
  
export async function getProductPage(data) {
  const url = API_URLS.jd.page;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}
export async function getProduct(data) {
  const url = API_URLS.jd.get;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}
export async function saveGoods(data) {
  const url = API_URLS.jd.saveGoods;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}
export async function sendWeibo(data) {
  const url = API_URLS.jd.sendToWeibo;
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}