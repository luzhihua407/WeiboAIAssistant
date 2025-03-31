<template>
    <a-form layout="vertical" :model="formState" :rules="rules">
      <!-- 微博设置 -->
      <a-card title="微博设置" class="mb-4">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="微博账号ID" name="weibo_account_id">
              <a-input
                v-model:value="formState.weibo_account_id" readonly
                placeholder="请输入微博账号ID"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="微博账号名称" name="weibo_account_name">
              <a-input
                v-model:value="formState.weibo_account_name" readonly
                placeholder="请输入微博账号名称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
            <a-col :span="24">
                <a-form-item label="系统提示词" name="system_prompt">
                    <a-textarea
                        v-model:value="formState.system_prompt"
                        placeholder="请输入系统提示词"
                        rows="10"
                    />
                </a-form-item>
            </a-col>
        </a-row>
      </a-card>
  
      <!-- 京东设置 -->
      <a-card title="京东设置" class="mb-4">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="京东app_key" name="jd_app_key">
              <a-input
                v-model:value="formState.jd_app_key"
                placeholder="请输入京东app_key"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="京东app_secret" name="jd_app_secret">
              <a-input-password
                v-model:value="formState.jd_app_secret"
                placeholder="请输入京东app_secret"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
  
      <!-- 提交按钮（可选，如果需要手动保存） -->
      <a-form-item>
        <a-button type="primary" html-type="submit">保存设置</a-button>
      </a-form-item>
    </a-form>
    <a-button type="danger" @click="handleLogout">退出登录</a-button>
  </template>
  
  <script>
  import { reactive, watch, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import {
      getAllWeiboAccounts,
      getJdAppConfigById,
      updateOrCreateConfig,
      updateWeiboAccount,
      logout,
  } from '../api/system-settings-api';
  
  export default {
    name: 'SystemSettings',
    setup() {
    const formState = reactive({
      weibo_account_id: '',
      weibo_account_name: '',
      system_prompt: '',
      jd_app_key: '',
      jd_app_secret: '',
    });
      const rules = {
        weibo_account_id: [
          { required: true, message: '请输入微博账号ID' },
        ],
        weibo_account_name: [
          { required: true, message: '请输入微博账号名称' },
        ],
        jd_app_key: [
          { required: true, message: '请输入京东app_key' },
        ],
        jd_app_secret: [
          { required: true, message: '请输入京东app_secret' },
        ],
        system_prompt: [
            { required: true, message: '请输入系统提示词' },
        ],
      };
  
      const loadSettings = async () => {
        try {
            const response = await getAllWeiboAccounts();
            if (response.code==200) {
                const weiboAccount = response.data;
                formState.weibo_account_id = weiboAccount.weibo_account_id;
                formState.weibo_account_name = weiboAccount.weibo_account_name;
                formState.system_prompt = weiboAccount.system_prompt;
            }
  
            const resp = await getJdAppConfigById(1);
            if (resp.code==200) {
                const jdAppConfig = resp.data;
                formState.jd_app_key = jdAppConfig.jd_app_key;
                formState.jd_app_secret = jdAppConfig.jd_app_secret;
            }
        } catch (error) {
            message.error('加载设置失败');
            console.error(error);
        }
      };
  
      const autoSave = async () => {
        try {
            if (formState.system_prompt) {
                await updateWeiboAccount({
                    id: 1,
                    system_prompt: formState.system_prompt,
                });
            }
            if (formState.jd_app_key) {
                await updateOrCreateConfig({
                    id: 1,
                    jd_app_key: formState.jd_app_key,
                    jd_app_secret: formState.jd_app_secret,
                });
            }
        } catch (error) {
            message.error('保存设置失败');
            console.error(error);
        }
      };

      const handleLogout = async () => {
        try {
          await logout();
          message.success('退出成功');
          formState.weibo_account_id = '';
          formState.weibo_account_name = '';
          formState.system_prompt = '';
          formState.jd_app_key = '';
          formState.jd_app_secret = '';
        } catch (error) {
          message.error('退出失败');
          console.error(error);
        }
      };
  
      watch(
        () => JSON.parse(JSON.stringify(formState)), // 深拷贝以监听整个对象
        () => {
          autoSave();
        },
        { deep: true }
      );
  
      onMounted(() => {
        loadSettings();
      });
  
      return {
        formState,
        rules,
        handleLogout,
      };
    },
  };
  </script>
  
  <style scoped>
  .mb-4 {
    margin-bottom: 16px;
  }
  </style>