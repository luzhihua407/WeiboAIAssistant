// api.js
import api from './http';


export async function generateText(data) {
    const url = '/generate_text';
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
  const url = '/product/page';
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
  const url = '/product/get';
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
  const url = 'product/save_goods';
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}