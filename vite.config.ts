import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        // Compress final assets with Brotli (fallback to gzip automatically by the host)
        viteCompression({
            algorithm: "brotliCompress",
            ext: ".br",
            deleteOriginFile: false,
        }),
        mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    // Split large third-party dependencies into their own chunks so that
    // the initial bundle stays small and the browser can cache vendors.
    build: {
        cssMinify: true,
        minify: "esbuild", // Use esbuild (default) - faster and doesn't require extra deps
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (/react|react-dom|scheduler/.test(id))
                            return "react-vendor";
                        if (id.includes("@tanstack")) return "tanstack";
                        if (id.includes("@radix-ui")) return "radix";
                        if (id.includes("lucide-react")) return "lucide";
                    }
                },
            },
        },
    },
}));
