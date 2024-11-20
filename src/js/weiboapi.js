// api.js
import api from './http';
export async function page(data) {
  const url = '/weibo/page';
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
  const url = '/weibo/get_user';
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
  const url = '/weibo/delete';
  try {
    const response = await api.post(url, data);
    console.log('操作成功:', response);
    return response;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}