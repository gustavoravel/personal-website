import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /**
         * Separa as bibliotecas do codigo do site.
         *
         * Nao reduz o total baixado na primeira visita, mas muda o retorno:
         * quando eu publico um artigo ou corrijo um texto, so o pedaco do app
         * perde a validade no cache. React e Supabase, que nao mudam, seguem
         * em cache no aparelho do visitante.
         */
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
