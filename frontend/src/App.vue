<template>
  <a-layout style="min-height: 100vh; background: #f5f5f7;">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" theme="light" collapsible
      :style="{ overflow: 'auto', position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, background: '#d3d3d3' }">
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline" style="height: 100%; border-right: 0;">
        <a-sub-menu key="1">
          <template #title>
            <span>
              <user-outlined />
              <span>功能</span>
            </span>
          </template>
          <a-menu-item key="3">
            <RouterLink to="/weibo"><WeiboCircleOutlined />发送微博</RouterLink>
          </a-menu-item>
          <a-menu-item key="4">
            <RouterLink to="/jd"><ShoppingOutlined />京东</RouterLink>
          </a-menu-item>
          <a-menu-item key="5"> 
              <RouterLink to="/weibo_list"><WeiboOutlined />微博列表</RouterLink>
            </a-menu-item>
        </a-sub-menu>
      </a-menu>
      <div style="position: absolute; bottom: 0; width: 100%; padding: 10px; background: #d3d3d3; text-align: center;">
        <RouterLink to="/setting" @click="clearSelectedKeys">
          <a-avatar :src="user_pic" v-if="isLogined == true" />
          <a-avatar v-if="isLogined == false">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
          <span style="margin-left: 10px;">{{ user?.screenName || '未登录' }}</span>
        </RouterLink>
      </div>
    </a-layout-sider>
    <a-layout :style="{ marginLeft: '200px' }">
      <a-layout-content :style="{ padding: '24px', background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'}">
        <a-config-provider :theme="{ token: { fontSize: 15 } }">
          <Login />
          <RouterView />
        </a-config-provider>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import {
  WeiboCircleOutlined,
  UserOutlined,
  ShoppingOutlined,
  WeiboOutlined,
  TableOutlined
} from '@ant-design/icons-vue';
import { ref, onMounted, watch } from 'vue';
import Login from "./page/Login.vue";
import { RouterLink, RouterView } from 'vue-router';
import { get_user, login } from './api/weibo-api'; // Corrected import path
import { convertFileSrc } from '@tauri-apps/api/core';
import { useStore } from 'vuex';
import { io } from 'socket.io-client';
const user_pic = ref<string>();
const user = ref<{ screenName: string; userImg: string }>({ screenName: '', userImg: '' });

const collapsed = ref<boolean>(false);
const isLogined = ref<boolean>(false);
const selectedKeys = ref<string[]>(['1']);
const openKeys = ref<string[]>(['1']);
const store = useStore();
async function handleLoginSuccess(data: { islogined: boolean }) {
  if (data.islogined) {
    store.dispatch('loginWin', { "show": false });
    console.log('Login successful');
    const response=await get_user()
    if (response.code==200) {
      user.value=response.data
      const assetUrl = convertFileSrc(user.value.userImg);
      console.log(assetUrl)
      user_pic.value=assetUrl
      isLogined.value=true

    }
  } else {
    console.log('Login failed');
  }
}
async function loginIfNotLoggedIn() {
  const response = await get_user();
  if (response.code == 200) {
    user.value = response.data;
    const assetUrl = convertFileSrc(user.value.userImg);
    console.log(assetUrl);
    user_pic.value = assetUrl;
    isLogined.value = true;
  } else if (response.code == 10000) {
    login();
  }
  console.log("登录状态", isLogined);
}
function initWebSocket() {
  const socket = io('http://localhost:3000', {
    withCredentials: false // 或者 true，取决于你的服务器配置
  });
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('qrcode', (data) => {
    const qrcode = data.qrcode
    const channel = data.channel
    store.dispatch('loginWin', { "show": true, "qrcode": qrcode, "channel": channel });
    store.dispatch('setQRcodeStatus', { "qrcodeStatus": "active" });
  });
  socket.on('login_success', (data) => {
    console.log('login_success:', data);
    const islogined = data.islogined
    if (islogined) {
       handleLoginSuccess({ islogined: islogined });
    }else {
      console.log('Login failed');
      //设置二维码过期
      store.dispatch('setQRcodeStatus', { "qrcodeStatus": 'expired' });
    }
  });
}
function clearSelectedKeys() {
  selectedKeys.value = [];
  // Force reactivity update
  setTimeout(() => {
    selectedKeys.value = [];
  }, 0);
}
onMounted(() => {
  initWebSocket();
  loginIfNotLoggedIn();

  // Watch for logout action in the store
  watch(
    () => store.state.isLoggedOut,
    (isLoggedOut) => {
      if (isLoggedOut) {
        user.value = { screenName: '', userImg: '' };
        user_pic.value = '';
        isLogined.value = false;
        store.commit('resetLogoutState'); // Reset the logout state in the store
        loginIfNotLoggedIn(); // Re-login after logout
      }
    }
  );
});
</script>

<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='light'] .site-layout .site-layout-background {
  background: #fff;
}

a-layout-sider {
  background: #d3d3d3;
}

a-menu {
  background: #2d2d2d;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

a-menu-item, a-sub-menu-title {
  color: #fff;
  font-size: 12px;
}

a-menu-item:hover, a-menu-item-active, a-menu-item-selected {
  background: #007aff;
  color: #fff;
}

a-menu-item-selected {
  font-weight: bold;
}
</style>
