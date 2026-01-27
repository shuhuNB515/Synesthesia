const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const path = require('path')

// 使用 module.exports 这种最原始的导出方式，避免任何 ESM 环境冲突
module.exports = defineConfig({
  plugins: [vue()],
  // 消除控制台那个烦人的黄色警告
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  resolve: {
    alias: {
      // 确保 @ 指向 src 目录
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true // 自动打开浏览器
  }
})