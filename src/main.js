import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import { createMemoryHistory, createRouter } from 'vue-router'
import Weibo from './page/Weibo.vue'
import JD from './page/JD.vue'
import WeiboList from './page/WeiboList.vue';

const routes = [
//   { path: '/', component: HomeView },
  { path: '/weibo', component: Weibo },
  { path: '/weibo_list', component: WeiboList },
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