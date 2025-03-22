import api from './axios-util';
import { API_URLS } from './api-urls';

// WeiboAccount API
export async function saveWeiboAccount(data) {
    const url = API_URLS.weiboAccount.save;
    try {
        const response = await api.post(url, data);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function updateWeiboAccount(data) {
    const url = API_URLS.weiboAccount.update;
    try {
        const response = await api.post(url, data);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function getWeiboAccountById(id) {
    const url = `${API_URLS.weiboAccount.getById}${id}`;
    try {
        const response = await api.get(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function getAllWeiboAccounts() {
    const url = API_URLS.weiboAccount.getAll;
    try {
        const response = await api.get(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

// JdAppConfig API
export async function createJdAppConfig(data) {
    const url = API_URLS.jdAppConfig.create;
    try {
        const response = await api.post(url, data);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function getJdAppConfigById(id) {
    const url = `${API_URLS.jdAppConfig.getById}${id}`;
    try {
        const response = await api.get(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function updateOrCreateConfig(data) {
    const url = API_URLS.jdAppConfig.updateOrCreate;
    try {
        const response = await api.post(url, data);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function deleteJdAppConfig(id) {
    const url = `${API_URLS.jdAppConfig.delete}${id}`;
    try {
        const response = await api.delete(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function getAllJdAppConfigs() {
    const url = API_URLS.jdAppConfig.getAll;
    try {
        const response = await api.get(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}

export async function getJdAppConfigByKey(key) {
    const url = `${API_URLS.jdAppConfig.getByKey}${key}`;
    try {
        const response = await api.get(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}