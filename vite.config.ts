import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O site é publicado em https://<usuario>.github.io/artefy/, então tudo precisa
// ser resolvido a partir dessa base. Em dev a base é a raiz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/artefy/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}));
