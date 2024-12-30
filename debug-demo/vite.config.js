import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': '../build/node_modules/react/umd/react.development.js',
      'react-dom':'../build/node_modules/react-dom/umd/react-dom.development.js',
    }
  },
  optimizeDeps:{
    // include:['../build/node_modules/react/umd/*','../build/node_modules/react-dom/umd/*'],
    // include:['react','react-dom']
  },
  // build: {
  //   commonjsOptions: {
  //     include: [/react/, /react-dom/],
  //   },
  // }
})
