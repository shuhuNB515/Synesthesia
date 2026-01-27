const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const path = require('path')

module.exports = defineConfig({
  plugins: [vue()],
  // 【关键】添加 base 配置
  // 如果你的仓库名是 "Synesthesia", 那么这里写 '/Synesthesia/'
  // 如果你使用自定义域名或部署在根目录，写 '/'
  base: './', 
  define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 3000 }
})