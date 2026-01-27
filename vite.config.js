// vite.config.js
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const path = require('path')

module.exports = defineConfig({
  plugins: [vue()],
  // 【关键修改】改为你的仓库名称，两边都要有斜杠
  base: '/Synesthesia/', 
  define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 3000 }
})