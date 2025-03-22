// api.js
import api from './axios-util';
import { API_URLS } from './api-urls';

export async function page(data) {
  const url = API_URLS.weibo.page;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function get_user(data) {
  const url = API_URLS.weibo.getUser;
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
  const url = API_URLS.weibo.login;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function delete_by_id(data) {
  const url = API_URLS.weibo.deleteById;
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function send_weibo(data) {
  const url = API_URLS.weibo.sendWeibo;
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function weibo_refresh_qrcode(data) {
  const url = API_URLS.weibo.refreshQrcode;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export async function longtext(data) {
  const url = API_URLS.weibo.longtext;
  try {
    const response = await api.get(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}