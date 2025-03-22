// api.js
import api from './axios-util';
import { API_URLS } from './api-urls';

export async function get(data) {
  const url = API_URLS.sysconfig.get;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function update(data) {
  const url = API_URLS.sysconfig.update;
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}