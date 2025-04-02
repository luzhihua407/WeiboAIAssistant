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


export async function chat(data, onMessage) {
  const url = API_URLS.yuanbao.chat;
  try {
    const response = await fetch('/api/'+url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        let chunk = decoder.decode(value, { stream: true });
        const match = chunk.match(/data: ({.+})/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          if (parsed.msg) {
              onMessage(parsed.msg);
          }
        }
      }
    }

    console.log('操作成功: SSE stream completed');
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}