/// <reference types='vitest' />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/sandbox',
  base: '/donations-widget/',
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: ['/'],
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [preact(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../dist/sandbox',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/sandbox',
      provider: 'v8',
    },
  },
});
