// api.js
import api from './axios-util';
import { API_URLS } from './api-urls';

export async function checkLogin(data) {
  const url = API_URLS.yuanbao.checkLogin;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function login(data) {
  const url = API_URLS.yuanbao.login;
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
  const url = API_URLS.yuanbao.refreshQrcode;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function generateContent(data) {
  const url = API_URLS.yuanbao.generateContent;
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}