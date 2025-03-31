import { createRouter, createMemoryHistory } from 'vue-router';
import Weibo from '../page/Weibo.vue';
import JD from '../page/JD.vue';
import WeiboList from '../page/WeiboList.vue';
import Dict from '../page/Dict.vue';
import SystemSettings from '../page/SystemSettings.vue';
import WeiboPage from '../page/WeiboPage.vue';
import { get_user } from '../api/weibo-api'; // Import the API to check login status
import { useStore } from 'vuex';

const routes = [
  { path: '/weibo', component: Weibo },
  { path: '/weibo_list', component: WeiboList },
  { path: '/jd', component: JD },
  { path: '/dict', component: Dict },
  { path: '/setting', component: SystemSettings },
  { path: '/weibo_page', name: 'WeiboPage', component: WeiboPage },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// Add a global navigation guard
router.beforeEach(async (to, from, next) => {
  const store = useStore();
  try {
    const response = await get_user();
    if (response.code === 200) {
      // User is logged in, proceed to the route
      next();
    } else if (response.code === 10000) {
      // User is not logged in, show the login modal
      store.dispatch('loginWin', { show: true });
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    store.dispatch('loginWin', { show: true });
  }
});

export default router;
