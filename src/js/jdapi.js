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