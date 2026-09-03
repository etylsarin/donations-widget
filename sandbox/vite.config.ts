/// <reference types='vitest' />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

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
  plugins: [preact(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), cssInjectedByJsPlugin({
    // Hand the compiled CSS to the bundle as a plain string instead of injecting it.
    // The widget renders it into its own shadow root — see src/styles.ts. Injecting
    // here would only ever reach the elements that happen to be in the DOM at load
    // time, which is not the same set the visitor ends up looking at on a host page
    // that re-renders.
    injectCode: (cssCode: string) =>
      `try{globalThis.__DONATIONS_WIDGET_CSS__=${cssCode}}catch(e){console.error('donations-widget: could not stage styles',e)}`,
  })],
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
    rollupOptions: {
      output: {
        // Host pages embed this file by URL, and `gh-pages` wipes the branch on every
        // deploy. A content hash in the name therefore breaks every existing embed the
        // moment we ship anything — keep the entry name stable instead.
        entryFileNames: 'assets/donations-widget.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
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
