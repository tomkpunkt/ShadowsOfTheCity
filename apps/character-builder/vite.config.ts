import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(import.meta.dirname, "../..");

const contentCompilerPlugin = (): Plugin => {
  let timer: NodeJS.Timeout | undefined;
  let compiling = false;
  let pending = false;

  const compile = async (): Promise<void> => {
    if (compiling) {
      pending = true;
      return;
    }
    compiling = true;
    try {
      await execFileAsync(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["run", "content:compile"],
        { cwd: repositoryRoot }
      );
    } catch (error) {
      const output =
        error !== null && typeof error === "object" && "stderr" in error
          ? String(error.stderr)
          : String(error);
      console.error(output);
    } finally {
      compiling = false;
      if (pending) {
        pending = false;
        await compile();
      }
    }
  };

  return {
    name: "sotc-content-compiler",
    configureServer(server) {
      const contentGlob = path.join(repositoryRoot, "content", "**", "*.md");
      server.watcher.add(contentGlob);
      server.watcher.on("change", (file) => {
        if (!file.startsWith(path.join(repositoryRoot, "content"))) {
          return;
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
          void compile();
        }, 120);
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), contentCompilerPlugin()],
  resolve: {
    alias: {
      "@catalog": path.resolve(repositoryRoot, "generated/catalog.json")
    }
  },
  server: {
    fs: {
      allow: [repositoryRoot]
    }
  },
  build: {
    sourcemap: false
  }
});
