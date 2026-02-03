import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      "/chat": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/speech": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
