<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" theme="light" collapsible
      :style="{ overflow: 'auto', position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0 }">
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline" style="height: 100%">
        <a-sub-menu key="1">
          <template #title>
            <span>
              <user-outlined />
              <span>微博</span>
            </span>
          </template>
          <a-menu-item key="3">
            <RouterLink to="/weibo">发送微博</RouterLink>
          </a-menu-item>
          <a-menu-item key="4">
            <RouterLink to="/jd">京东</RouterLink>
          </a-menu-item>
          <a-menu-item key="5">
            <RouterLink to="/weibo_list">微博列表</RouterLink>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout :style="{ marginLeft: '200px' }">
      <a-layout-content :style="{ background: '#fff', overflow: 'initial', minHeight: '280px' }">
        <div :style="{ padding: '20px', background: '#fff' }">
          <Login />
          <RouterView />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import { ref, onMounted } from 'vue';
import Login from "./Login.vue";
import { convertFileSrc } from '@tauri-apps/api/core';
import { useStore } from 'vuex';
import { io } from 'socket.io-client';

const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(['1']);
const store = useStore();
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

  socket.on('not_login', (data) => {
    console.log('New message:', data);

    const qrcode = data.qrcode
    const channel = data.channel
    const assetUrl = convertFileSrc(qrcode);
    console.log(qrcode)
    console.log(assetUrl)
    store.dispatch('loginWin', { "show": true, "qrcode": assetUrl, "channel": channel });


  });
  socket.on('login_success', (data) => {
    console.log('New message:', data);
    const islogined = data.islogined
    if (islogined) {
      store.dispatch('loginWin', { "show": false });
    }
  });
}
onMounted(() => {
  initWebSocket()
});
</script>
<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: #fff;
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='light'] .site-layout .site-layout-background {
  background: #fff;
}
</style>
