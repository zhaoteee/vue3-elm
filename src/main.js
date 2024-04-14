import { createApp } from 'vue'

import router from './router/router'
import store from './store/'
import App from './App.vue'
import './config/rem'
 

createApp(App).use(router).use(store).mount('#app')

