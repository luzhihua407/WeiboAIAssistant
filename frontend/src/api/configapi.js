// api.js
import api from './http';

export async function get(data) {
  const url = '/sysconfig/get';
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
  const url = '/sysconfig/update';
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}
