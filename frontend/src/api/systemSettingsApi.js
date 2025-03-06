import api from './http';

// WeiboAccount API
export async function saveWeiboAccount(data) {
    const url = '/weiboAccount/save';
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
    const url = '/weiboAccount/update';
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
    const url = `/weiboAccount/${id}`;
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
    const url = '/weiboAccount/get';
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
    const url = '/jdAppConfig';
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
    const url = `/jdAppConfig/${id}`;
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
    const url = `/jdAppConfig/updateOrCreateConfig`;
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
    const url = `/jdAppConfig/${id}`;
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
    const url = '/jdAppConfig';
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
    const url = `/jdAppConfig/key/${key}`;
    try {
        const response = await api.get(url);
        console.log('操作成功:', response);
        return response;
    } catch (error) {
        console.error('操作失败:', error);
        throw error;
    }
}
