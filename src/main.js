import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入字体文件
import './assets/font/iconfont.css'
// 引入全局样式文件
import './assets/css/global.less'
import SocketService from '@/utils/socket_services'
// 对服务端进行WebSocket的连接
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance

// 将全局echarts的对象挂载到Vue的原型对象上
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
