import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Função que separa automaticamente as bibliotecas do node_modules
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Cria um chunk separado para as libs grandes, ajudando na performance
            if (id.includes('xlsx')) return 'vendor-excel';
            if (id.includes('recharts')) return 'vendor-charts';
            return 'vendor'; // Todo o resto das libs vai para o vendor geral
          }
        },
      },
    },
    chunkSizeWarningLimit: 2000, // Aumenta o limite para não ficar apitando alerta chato
  },
})