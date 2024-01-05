import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/Users/yuxinyan/code/vite-demo/src'
    }
  },
  define: {
    'process.env': {
      VUE_APP_BASE_API: '/apii'
    }
  },
  server: {
    port: 5173,
    open: true,
    base: './',
    proxy:{
      '/apii': {
        target: 'https://relaystaging.zhimi.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apii/, '')
      }
    }
  }
})