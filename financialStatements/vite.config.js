import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/company_analysis/financialStatements/',
  // vitest 設定。ビルドには影響しない。
  // recharts は jsdom だと寸法 0 で描画されないため test/setup.js で寸法を差し替える。
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.jsx'],
    // recharts + jsdom は 1 回の描画に数秒かかり、既定の 5 秒では足りない。
    testTimeout: 60000,
  },
})
