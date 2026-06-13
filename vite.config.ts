import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Stub the heavy TON Connect SDK in tests; the production build uses the real one.
    alias: {
      '@tonconnect/ui-react': fileURLToPath(
        new URL('./src/test/tonconnect-stub.tsx', import.meta.url),
      ),
    },
    // A configured testnet recipient so the "pay with TON" path is exercisable in tests
    // (a valid 48-char address; deploys set the real one via this env var).
    env: {
      VITE_TON_RECIPIENT_TESTNET: '0QDtestRecipientForVitestAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
});
