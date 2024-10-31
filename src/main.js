import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import { createMemoryHistory, createRouter } from 'vue-router'
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import Weibo from './page/Weibo.vue'
import JD from './page/JD.vue'

const routes = [
//   { path: '/', component: HomeView },
  { path: '/weibo', component: Weibo },
  { path: '/jd', component: JD },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
const app = createApp(App);

app.use(router)
app.use(Antd)
app.mount('#app');
const menu = await Menu.new({
  items: [
    {
      id: 'quit',
      text: 'Quit',
    },
  ],
});

const options = {
  menu,
  menuOnLeftClick: true,
};

const tray = await TrayIcon.new(options);