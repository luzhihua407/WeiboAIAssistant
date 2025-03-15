import { createRouter, createMemoryHistory } from 'vue-router';
import Weibo from '../page/Weibo.vue';
import JD from '../page/JD.vue';
import WeiboList from '../page/WeiboList.vue';
import YamlEditor from '../page/YamlEditor.vue';
import Dict from '../page/Dict.vue';
import SystemSettings from '../page/SystemSettings.vue';
import WeiboPage from '../page/WeiboPage.vue';

const routes = [
  { path: '/weibo', component: Weibo },
  { path: '/weibo_list', component: WeiboList },
  { path: '/jd', component: JD },
  { path: '/sys_config', component: YamlEditor },
  { path: '/dict', component: Dict },
  { path: '/setting', component: SystemSettings },
  { path: '/weibo_page', name: 'WeiboPage', component: WeiboPage },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
