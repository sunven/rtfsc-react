import { defineConfig } from 'vite'
import path from 'node:path';
import react1 from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react1()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, '../build/node_modules/react'),
      'react-dom':path.resolve(__dirname, '../build/node_modules/react-dom'),
    }
  },
  optimizeDeps:{
    // include:['../build/node_modules/react/*','../build/node_modules/react-dom/*'],
    // include:['react','react-dom']
  },
  // build: {
  //   commonjsOptions: {
  //     include: [/react/, /react-dom/],
  //   },
  // }
})
