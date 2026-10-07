import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Port 8080 is in the Business Intake API's default allowed origins.
  server: { port: 8080 },
  preview: { port: 8080 },
});
