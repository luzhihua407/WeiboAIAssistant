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
      <!-- 
      <a-form-item>
        <a-button type="primary" html-type="submit">保存设置</a-button>
      </a-form-item>
      -->
    </a-form>
  </template>
  
  <script>
  import { reactive, watch, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import {
      getAllWeiboAccounts,
      getJdAppConfigById,
      updateOrCreateConfig,
      getAllJdAppConfigs,
  } from '../api/systemSettingsApi';
  
  export default {
    name: 'SystemSettings',
    setup() {
    const formState = reactive({
      weibo_account_id: '',
      weibo_account_name: '',
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
      };
  
      const loadSettings = async () => {
        try {
            const response = await getAllWeiboAccounts();
            if (response.code==200) {
                const weiboAccount = response.data;
                formState.weibo_account_id = weiboAccount.weibo_account_id;
                formState.weibo_account_name = weiboAccount.weibo_account_name;
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
      };
    },
  };
  </script>
  
  <style scoped>
  .mb-4 {
    margin-bottom: 16px;
  }
  </style>