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

    // Enhanced build optimizations for better performance and caching
    build: {
        cssMinify: "esbuild",
        cssCodeSplit: true,
        minify: "esbuild",
        sourcemap: false, // Disable for smaller bundles
        target: "esnext", // Modern browsers for smaller bundles

        rollupOptions: {
            output: {
                // Enhanced chunk splitting for better caching
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (/react|react-dom|scheduler|react-router-dom/.test(id))
                            return "react-vendor";
                        if (id.includes("@tanstack")) return "tanstack";
                        if (id.includes("@radix-ui")) return "radix";
                        if (id.includes("lucide-react")) return "lucide";
                        if (id.includes("sonner") || id.includes("vaul"))
                            return "ui-mobile";
                        if (id.includes("react-hook-form") || id.includes("@hookform"))
                            return "forms";
                        if (id.includes("clsx") || id.includes("tailwind-merge"))
                            return "utils";
                    }

                    if (id.includes("/components/")) {
                        if (id.includes("Article")) return "articles";
                        if (id.includes("sidebar") || id.includes("Sidebar")) return "sidebar";
                        if (id.includes("ui/")) return "ui-components";
                    }
                },

                // Better naming for debugging
                chunkFileNames: "assets/[name]-[hash].js",
                entryFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash].[ext]",
            },
        },

        // Performance optimizations
        chunkSizeWarningLimit: 1000,

        // Dependency optimization
        commonjsOptions: {
            include: [/node_modules/],
        },
    },

    // Optimize dependencies
    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
            "lucide-react",
            "@radix-ui/react-dialog",
        ],
        exclude: ["@vite/client", "@vite/env"],
    },
}));
