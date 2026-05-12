import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { fileURLToPath } from 'node:url';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  html: {
    title: 'VNetwork Player Docs',
    favicon: './public/favicon.svg',
  },
  output: {
    assetPrefix: './',
  },
  source: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vnetwork-player-local': fileURLToPath(
        new URL('../src/index.tsx', import.meta.url),
      ),
      '@tanstack/react-hotkeys': fileURLToPath(
        new URL('./node_modules/@tanstack/react-hotkeys', import.meta.url),
      ),
    },
  },
  tools: {
    rspack: {
      resolve: {
        alias: {
          '@tanstack/react-hotkeys': fileURLToPath(
            new URL('./node_modules/@tanstack/react-hotkeys', import.meta.url),
          ),
          react$: fileURLToPath(
            new URL('./node_modules/react/index.js', import.meta.url),
          ),
          'react/jsx-runtime$': fileURLToPath(
            new URL('./node_modules/react/jsx-runtime.js', import.meta.url),
          ),
          'react/jsx-dev-runtime$': fileURLToPath(
            new URL('./node_modules/react/jsx-dev-runtime.js', import.meta.url),
          ),
          'react-dom$': fileURLToPath(
            new URL('./node_modules/react-dom/index.js', import.meta.url),
          ),
          'react-dom/client$': fileURLToPath(
            new URL('./node_modules/react-dom/client.js', import.meta.url),
          ),
        },
      },
    },
  },
});
