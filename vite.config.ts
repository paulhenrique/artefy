import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O site é publicado em https://<usuario>.github.io/artefy/, então tudo precisa ser
// resolvido a partir dessa base — inclusive em dev e no preview, para que um caminho
// absoluto esquecido quebre aqui e não só em produção.
export default defineConfig(() => ({
  base: '/artefy/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}));
