import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works from the site root or any subpath.
  base: './',
  server: {
    host: true, // expose on the LAN so a phone on the same network can connect
  },
  build: {
    target: 'es2020',
    // Phaser alone is ~1.2 MB minified (~340 KB gzipped); silence the default 500 KB warning for it.
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        // Keep Phaser in its own long-cacheable chunk.
        codeSplitting: {
          groups: [{ name: 'phaser', test: /node_modules[\\/]phaser/ }],
        },
      },
    },
  },
});
