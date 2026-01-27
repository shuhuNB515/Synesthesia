// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    meta: { requiresAuth: true }
  },
  // 【新增】保底路由：如果匹配不到路径（比如正好撞上 /Synesthesia/），自动跳回首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  // 【关键修改】Hash 模式下，这里通常不需要传 base 路径
  history: createWebHashHistory(), 
  routes
})

export default router