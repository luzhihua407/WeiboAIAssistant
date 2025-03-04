import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import { createMemoryHistory, createRouter } from 'vue-router'
import Weibo from './page/Weibo.vue'
import JD from './page/JD.vue'
import WeiboList from './page/WeiboList.vue';
import store from './store/index';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import YamlEditor from './page/YamlEditor.vue';
import Dict from './page/Dict.vue';
import VueLazyload from 'vue-lazyload';

const routes = [
  { path: '/weibo', component: Weibo },
  { path: '/weibo_list', component: WeiboList },
  { path: '/jd', component: JD },
  { path: '/sys_config', component: YamlEditor },
  { path: '/dict', component: Dict },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
const app = createApp(App);
app.component('QuillEditor', QuillEditor)
app.use(router)
app.use(Antd)
app.use(store)
app.use(VueLazyload, {
  preLoad: 1.3,
  loading: './public/placeholder.png',
});
app.mount('#app');