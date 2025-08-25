import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const clientEnv = {
    API_URL: env.API_URL ?? env.VITE_API_URL, 
    NODE_ENV: env.NODE_ENV ?? mode,
  };

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env": JSON.stringify(clientEnv),
      "process.env.NODE_ENV": JSON.stringify(clientEnv.NODE_ENV),
    },
  };
});
