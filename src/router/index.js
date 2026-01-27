import { createRouter, createWebHistory } from 'vue-router'

// 使用 import() 懒加载方式，避免引用错误
const routes = [
  { 
    path: '/', 
    name: 'Home',
    component: () => import('../views/Home.vue') 
  },
  { 
    path: '/user', 
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue') 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router