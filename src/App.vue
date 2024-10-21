<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" theme="light" collapsible :style="{ overflow: 'auto', height: '100vh', left: 0, top: 0, bottom: 0 }">
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys"  mode="inline" style="height: 100%">
        <a-menu-item key="1">
          <pie-chart-outlined />
          <span>启动服务</span>
        </a-menu-item>
        <a-menu-item key="2">
          <desktop-outlined />
          <span>Option 2</span>
        </a-menu-item>
        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <user-outlined />
              <span>微博</span>
            </span>
          </template>
          <a-menu-item key="3"><RouterLink to="/weibo">发送</RouterLink></a-menu-item>
          <a-menu-item key="4"><RouterLink to="/jd">点赞</RouterLink></a-menu-item>
          <a-menu-item key="5">Alex</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="sub2">
          <template #title>
            <span>
              <team-outlined />
              <span>Team</span>
            </span>
          </template>
          <a-menu-item key="6">Team 1</a-menu-item>
          <a-menu-item key="8">Team 2</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="9">
          <file-outlined />
          <span>File</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{background: '#fff', overflow: 'initial',minHeight: '280px'}">
        <div :style="{ padding: '24px', background: '#fff', textAlign: 'center'}">

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
import { ref } from 'vue';

const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(['1']);
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
