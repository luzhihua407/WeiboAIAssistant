import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import router from './router';
import store from './store/index';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import VueLazyload from 'vue-lazyload';

const app = createApp(App);
app.component('QuillEditor', QuillEditor);
app.use(router);
app.use(Antd);
app.use(store);
app.use(VueLazyload, {
  preLoad: 1.3,
  loading: './public/placeholder.png',
});
app.mount('#app');