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
  plugins: [
    preact(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    cssInjectedByJsPlugin({
      injectCodeFunction: (cssCode: string) => {
        try {
          if (typeof document !== 'undefined') {
            customElements.whenDefined('donations-widget').then(() => {
              const elementStyle = document.createElement('style');
              elementStyle.appendChild(document.createTextNode(cssCode));
              document.querySelectorAll('donations-widget').forEach((item) => {
                item.shadowRoot?.appendChild(elementStyle);
              });
            });
          }
        } catch (e) {
          console.error('vite-plugin-css-injected-by-js', e);
        }
      },
    }),
  ],
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
