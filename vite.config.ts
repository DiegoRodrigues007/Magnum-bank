import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const vitePublic = Object.fromEntries(
    Object.entries(env).filter(([k]) => k.startsWith("VITE_"))
  );

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env": JSON.stringify({
        ...vitePublic,
        NODE_ENV: mode,
      }),
    },
  };
});
