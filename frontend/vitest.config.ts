/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

// 仅用于测试的独立配置，不影响 vite.config.ts 的开发代理与生产构建。
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    include: ["test/**/*.spec.ts"],
    globals: false,
  },
});
