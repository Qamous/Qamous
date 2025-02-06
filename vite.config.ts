import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import envCompatible from "vite-plugin-env-compatible";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
  },
  css: {
    modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]__[hash:base64:5]'
      },
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
