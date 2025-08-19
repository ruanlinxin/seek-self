/* eslint-disable simple-import-sort/imports */
import './style/index.less'
import '@arco-design/web-vue/dist/arco.css';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import { createApp } from 'vue';

import App from './App.vue';
import { store } from './store';


const app = createApp(App);
app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(store);
app.mount('#app');
