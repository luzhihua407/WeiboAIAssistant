// api.js
import api from './http';
export async function login(data) {
  const url = '/yuanbao/login';
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}
export async function yuanbao_refresh_qrcode(data) {
  const url = '/yuanbao/refresh_qrcode';
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}