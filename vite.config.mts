import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import envCompatible from "vite-plugin-env-compatible";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    port: 3001,
    headers: {
      'Content-Type': 'application/javascript',
    },
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: ["es2022", "safari15"],
    cssTarget: "safari15",
    modulePreload: {
      polyfill: false
    },
    outDir: "build",
    minify: 'esbuild',
    sourcemap: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'firebase-core': ['firebase/app'],
          'firebase-firestore': ['firebase/firestore'],
          'firebase-auth': ['firebase/auth'],
          'markdown': ['react-markdown', 'mdast-util-from-markdown', 'hast-util-to-jsx-runtime'],
          'ui-core': ['react-joyride', 'react-query'],
          'i18n-core': ['i18next'],
          'i18n-react': ['react-i18next'],
          'utils': ['html-to-image', 'papaparse'],
          'icons': ['@fortawesome/react-fontawesome/index.es.js'],
          'flags': ['country-flag-icons/react/3x2/US', 'country-flag-icons/react/3x2/EG']
        },
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js'
      }
    },
    chunkSizeWarningLimit: 1500
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        charset: false,
        api: "modern-compiler"
      }
    },
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    envCompatible(/* options */),
  ],
});
