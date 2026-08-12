// vite.config.ts
import { defineConfig } from "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/node_modules/@vitejs/plugin-react-swc/index.js";
import fs3 from "node:fs";
import path4 from "path";
import { viteSourceLocator } from "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/node_modules/@metagptx/vite-plugin-source-locator/dist/index.mjs";
import { atoms } from "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/node_modules/@metagptx/web-sdk/dist/plugins.js";
import { vitePrerenderPlugin } from "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/node_modules/vite-prerender-plugin/src/index.js";
import Sitemap from "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/node_modules/vite-plugin-sitemap/dist/index.js";

// prerender/blog-routes.js
import path2 from "node:path";

// prerender/utils.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/avina/OneDrive/Desktop/Avinash%20Pathak/Professional%20Work/TrainingMug/accreditpro-central-repository-system/prerender/utils.js";
var currentFile = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname2 = path.dirname(currentFile);
var projectRoot = path.resolve(__dirname2, "..");
var seoContentDir = path.resolve(projectRoot, "seo", "content");
function normalizeRouteFromMarkdown(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/").replace(/\/index\.md$/, "").replace(/\.md$/, "");
  return normalized ? `/blog/${normalized}/` : "/blog/";
}
function collectMarkdownFiles(dir, bucket = []) {
  if (!fs.existsSync(dir)) {
    return bucket;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, bucket);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      bucket.push(fullPath);
    }
  }
  return bucket;
}

// prerender/blog-routes.js
function getBlogRoutes() {
  const routes = /* @__PURE__ */ new Set(["/blog/"]);
  for (const filePath of collectMarkdownFiles(seoContentDir)) {
    const relativePath = path2.relative(seoContentDir, filePath);
    routes.add(normalizeRouteFromMarkdown(relativePath));
  }
  return Array.from(routes).sort();
}

// prerender/blog-sitemap.js
import fs2 from "node:fs";
import path3 from "node:path";
function collectMarkdownLastmod(dir) {
  const bucket = {};
  for (const fullPath of collectMarkdownFiles(dir)) {
    const relativePath = path3.relative(seoContentDir, fullPath);
    const route = normalizeRouteFromMarkdown(relativePath);
    bucket[route] = fs2.statSync(fullPath).mtime;
  }
  return bucket;
}
function getLatestContentMtime(lastmodMap) {
  const dates = Object.values(lastmodMap).filter((value) => value instanceof Date);
  if (dates.length === 0) {
    return void 0;
  }
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}
function getSitemapLastmod() {
  const contentLastmod = collectMarkdownLastmod(seoContentDir);
  const latestContentMtime = getLatestContentMtime(contentLastmod);
  return {
    ...latestContentMtime ? { "/blog/": latestContentMtime } : {},
    ...contentLastmod
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\avina\\OneDrive\\Desktop\\Avinash Pathak\\Professional Work\\TrainingMug\\accreditpro-central-repository-system";
function escapeHtmlAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
process.env.VITE_APP_TITLE ??= process.env.OVERVIEW_TITLE ?? "shadcnui";
process.env.VITE_APP_DESCRIPTION ??= process.env.OVERVIEW_DESCRIPTION ?? "Atoms Generated Project";
process.env.VITE_APP_TITLE = escapeHtmlAttr(process.env.VITE_APP_TITLE);
process.env.VITE_APP_DESCRIPTION = escapeHtmlAttr(process.env.VITE_APP_DESCRIPTION);
process.env.VITE_APP_LOGO_URL ??= process.env.OVERVIEW_LOGO_URL ?? "https://public-frontend-cos.metadl.com/mgx/img/favicon_atoms.ico";
function ensureBuildOutDir() {
  let outDir = path4.resolve(__vite_injected_original_dirname, "dist");
  return {
    name: "ensure-build-out-dir",
    configResolved(config) {
      outDir = path4.resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      fs3.mkdirSync(outDir, { recursive: true });
    },
    generateBundle() {
      fs3.mkdirSync(outDir, { recursive: true });
    }
  };
}
var vite_config_default = defineConfig(({ command }) => {
  const blogPrerenderRoutes = command === "build" ? getBlogRoutes() : [];
  return {
    plugins: [
      viteSourceLocator({
        prefix: "mgx"
        // Prefix used to identify source locations; do not change.
      }),
      react(),
      atoms(),
      ensureBuildOutDir(),
      Sitemap({
        hostname: "https://atoms.template.com",
        lastmod: getSitemapLastmod(),
        readable: true,
        generateRobotsTxt: true
      }),
      ...blogPrerenderRoutes.length > 0 ? vitePrerenderPlugin({
        renderTarget: "#root",
        prerenderScript: path4.resolve(__vite_injected_original_dirname, "prerender/blog.js"),
        additionalPrerenderRoutes: blogPrerenderRoutes
      }) : []
    ],
    resolve: {
      alias: {
        "@": path4.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: {
      host: "0.0.0.0",
      // Listen on all network interfaces.
      port: parseInt(process.env.VITE_PORT || "3000"),
      proxy: {
        "/api": {
          target: process.env.BACKEND_URL || "https://api-stage.accreditpro.in",
          changeOrigin: true,
          secure: true
        }
      },
      watch: { usePolling: true, interval: 600 }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            "react-vendor": ["react", "react-dom"],
            "router-vendor": ["react-router-dom"],
            "ui-vendor": [
              "@radix-ui/react-accordion",
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-aspect-ratio",
              "@radix-ui/react-avatar",
              "@radix-ui/react-checkbox",
              "@radix-ui/react-collapsible",
              "@radix-ui/react-context-menu",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-hover-card",
              "@radix-ui/react-label",
              "@radix-ui/react-menubar",
              "@radix-ui/react-navigation-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-progress",
              "@radix-ui/react-radio-group",
              "@radix-ui/react-scroll-area",
              "@radix-ui/react-select",
              "@radix-ui/react-separator",
              "@radix-ui/react-slider",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toast",
              "@radix-ui/react-toggle",
              "@radix-ui/react-toggle-group",
              "@radix-ui/react-tooltip"
            ],
            "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
            "utils-vendor": [
              "axios",
              "clsx",
              "tailwind-merge",
              "class-variance-authority",
              "date-fns",
              "lucide-react"
            ],
            "query-vendor": ["@tanstack/react-query"]
          }
        }
      },
      chunkSizeWarningLimit: 1e3
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicHJlcmVuZGVyL2Jsb2ctcm91dGVzLmpzIiwgInByZXJlbmRlci91dGlscy5qcyIsICJwcmVyZW5kZXIvYmxvZy1zaXRlbWFwLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXZpbmFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxBdmluYXNoIFBhdGhha1xcXFxQcm9mZXNzaW9uYWwgV29ya1xcXFxUcmFpbmluZ011Z1xcXFxhY2NyZWRpdHByby1jZW50cmFsLXJlcG9zaXRvcnktc3lzdGVtXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhdmluYVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXEF2aW5hc2ggUGF0aGFrXFxcXFByb2Zlc3Npb25hbCBXb3JrXFxcXFRyYWluaW5nTXVnXFxcXGFjY3JlZGl0cHJvLWNlbnRyYWwtcmVwb3NpdG9yeS1zeXN0ZW1cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2F2aW5hL09uZURyaXZlL0Rlc2t0b3AvQXZpbmFzaCUyMFBhdGhhay9Qcm9mZXNzaW9uYWwlMjBXb3JrL1RyYWluaW5nTXVnL2FjY3JlZGl0cHJvLWNlbnRyYWwtcmVwb3NpdG9yeS1zeXN0ZW0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XHJcbmltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IHZpdGVTb3VyY2VMb2NhdG9yIH0gZnJvbSAnQG1ldGFncHR4L3ZpdGUtcGx1Z2luLXNvdXJjZS1sb2NhdG9yJztcclxuaW1wb3J0IHsgYXRvbXMgfSBmcm9tICdAbWV0YWdwdHgvd2ViLXNkay9wbHVnaW5zJztcclxuaW1wb3J0IHsgdml0ZVByZXJlbmRlclBsdWdpbiB9IGZyb20gJ3ZpdGUtcHJlcmVuZGVyLXBsdWdpbic7XHJcbmltcG9ydCBTaXRlbWFwIGZyb20gJ3ZpdGUtcGx1Z2luLXNpdGVtYXAnO1xyXG5pbXBvcnQgeyBnZXRCbG9nUm91dGVzIH0gZnJvbSAnLi9wcmVyZW5kZXIvYmxvZy1yb3V0ZXMuanMnO1xyXG5pbXBvcnQgeyBnZXRTaXRlbWFwTGFzdG1vZCB9IGZyb20gJy4vcHJlcmVuZGVyL2Jsb2ctc2l0ZW1hcC5qcyc7XHJcblxyXG5mdW5jdGlvbiBlc2NhcGVIdG1sQXR0cihzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHN0clxyXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcclxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xyXG59XHJcblxyXG5wcm9jZXNzLmVudi5WSVRFX0FQUF9USVRMRSA/Pz0gcHJvY2Vzcy5lbnYuT1ZFUlZJRVdfVElUTEUgPz8gJ3NoYWRjbnVpJztcclxucHJvY2Vzcy5lbnYuVklURV9BUFBfREVTQ1JJUFRJT04gPz89IHByb2Nlc3MuZW52Lk9WRVJWSUVXX0RFU0NSSVBUSU9OID8/ICdBdG9tcyBHZW5lcmF0ZWQgUHJvamVjdCc7XHJcbnByb2Nlc3MuZW52LlZJVEVfQVBQX1RJVExFID0gZXNjYXBlSHRtbEF0dHIocHJvY2Vzcy5lbnYuVklURV9BUFBfVElUTEUpO1xyXG5wcm9jZXNzLmVudi5WSVRFX0FQUF9ERVNDUklQVElPTiA9IGVzY2FwZUh0bWxBdHRyKHByb2Nlc3MuZW52LlZJVEVfQVBQX0RFU0NSSVBUSU9OKTtcclxucHJvY2Vzcy5lbnYuVklURV9BUFBfTE9HT19VUkwgPz89IHByb2Nlc3MuZW52Lk9WRVJWSUVXX0xPR09fVVJMID8/ICdodHRwczovL3B1YmxpYy1mcm9udGVuZC1jb3MubWV0YWRsLmNvbS9tZ3gvaW1nL2Zhdmljb25fYXRvbXMuaWNvJztcclxuXHJcbmZ1bmN0aW9uIGVuc3VyZUJ1aWxkT3V0RGlyKCkge1xyXG4gIGxldCBvdXREaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZGlzdCcpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ2Vuc3VyZS1idWlsZC1vdXQtZGlyJyxcclxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZykge1xyXG4gICAgICBvdXREaXIgPSBwYXRoLnJlc29sdmUoY29uZmlnLnJvb3QsIGNvbmZpZy5idWlsZC5vdXREaXIpO1xyXG4gICAgfSxcclxuICAgIHdyaXRlQnVuZGxlKCkge1xyXG4gICAgICBmcy5ta2RpclN5bmMob3V0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZUJ1bmRsZSgpIHtcclxuICAgICAgZnMubWtkaXJTeW5jKG91dERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kIH0pID0+IHtcclxuICBjb25zdCBibG9nUHJlcmVuZGVyUm91dGVzID0gY29tbWFuZCA9PT0gJ2J1aWxkJyA/IGdldEJsb2dSb3V0ZXMoKSA6IFtdO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICB2aXRlU291cmNlTG9jYXRvcih7XHJcbiAgICAgICAgcHJlZml4OiAnbWd4JywgLy8gUHJlZml4IHVzZWQgdG8gaWRlbnRpZnkgc291cmNlIGxvY2F0aW9uczsgZG8gbm90IGNoYW5nZS5cclxuICAgICAgfSksXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIGF0b21zKCksXHJcbiAgICAgIGVuc3VyZUJ1aWxkT3V0RGlyKCksXHJcbiAgICAgIFNpdGVtYXAoe1xyXG4gICAgICAgIGhvc3RuYW1lOiAnaHR0cHM6Ly9hdG9tcy50ZW1wbGF0ZS5jb20nLFxyXG4gICAgICAgIGxhc3Rtb2Q6IGdldFNpdGVtYXBMYXN0bW9kKCksXHJcbiAgICAgICAgcmVhZGFibGU6IHRydWUsXHJcbiAgICAgICAgZ2VuZXJhdGVSb2JvdHNUeHQ6IHRydWUsXHJcbiAgICAgIH0pLFxyXG4gICAgICAuLi4oYmxvZ1ByZXJlbmRlclJvdXRlcy5sZW5ndGggPiAwXHJcbiAgICAgICAgPyB2aXRlUHJlcmVuZGVyUGx1Z2luKHtcclxuICAgICAgICAgICAgcmVuZGVyVGFyZ2V0OiAnI3Jvb3QnLFxyXG4gICAgICAgICAgICBwcmVyZW5kZXJTY3JpcHQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwcmVyZW5kZXIvYmxvZy5qcycpLFxyXG4gICAgICAgICAgICBhZGRpdGlvbmFsUHJlcmVuZGVyUm91dGVzOiBibG9nUHJlcmVuZGVyUm91dGVzLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICA6IFtdKSxcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLCAvLyBMaXN0ZW4gb24gYWxsIG5ldHdvcmsgaW50ZXJmYWNlcy5cclxuICAgICAgcG9ydDogcGFyc2VJbnQocHJvY2Vzcy5lbnYuVklURV9QT1JUIHx8ICczMDAwJyksXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IHByb2Nlc3MuZW52LkJBQ0tFTkRfVVJMIHx8ICdodHRwczovL2FwaS1zdGFnZS5hY2NyZWRpdHByby5pbicsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6IHsgdXNlUG9sbGluZzogdHJ1ZSwgaW50ZXJ2YWw6IDYwMCB9LFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICAvLyBWZW5kb3IgY2h1bmtzXHJcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxyXG4gICAgICAgICAgICAncm91dGVyLXZlbmRvcic6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgICAndWktdmVuZG9yJzogW1xyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtYWNjb3JkaW9uJyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWFsZXJ0LWRpYWxvZycsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1hc3BlY3QtcmF0aW8nLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtYXZhdGFyJyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNoZWNrYm94JyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNvbGxhcHNpYmxlJyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNvbnRleHQtbWVudScsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudScsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1ob3Zlci1jYXJkJyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWxhYmVsJyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LW1lbnViYXInLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtbmF2aWdhdGlvbi1tZW51JyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXBvcG92ZXInLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtcHJvZ3Jlc3MnLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtcmFkaW8tZ3JvdXAnLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2Nyb2xsLWFyZWEnLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0JyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlcGFyYXRvcicsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zbGlkZXInLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2xvdCcsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zd2l0Y2gnLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdGFicycsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b2FzdCcsXHJcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b2dnbGUnLFxyXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdG9nZ2xlLWdyb3VwJyxcclxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXAnLFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAnZm9ybS12ZW5kb3InOiBbJ3JlYWN0LWhvb2stZm9ybScsICdAaG9va2Zvcm0vcmVzb2x2ZXJzJywgJ3pvZCddLFxyXG4gICAgICAgICAgICAndXRpbHMtdmVuZG9yJzogW1xyXG4gICAgICAgICAgICAgICdheGlvcycsXHJcbiAgICAgICAgICAgICAgJ2Nsc3gnLFxyXG4gICAgICAgICAgICAgICd0YWlsd2luZC1tZXJnZScsXHJcbiAgICAgICAgICAgICAgJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eScsXHJcbiAgICAgICAgICAgICAgJ2RhdGUtZm5zJyxcclxuICAgICAgICAgICAgICAnbHVjaWRlLXJlYWN0JyxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgJ3F1ZXJ5LXZlbmRvcic6IFsnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXZpbmFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxBdmluYXNoIFBhdGhha1xcXFxQcm9mZXNzaW9uYWwgV29ya1xcXFxUcmFpbmluZ011Z1xcXFxhY2NyZWRpdHByby1jZW50cmFsLXJlcG9zaXRvcnktc3lzdGVtXFxcXHByZXJlbmRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXZpbmFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxBdmluYXNoIFBhdGhha1xcXFxQcm9mZXNzaW9uYWwgV29ya1xcXFxUcmFpbmluZ011Z1xcXFxhY2NyZWRpdHByby1jZW50cmFsLXJlcG9zaXRvcnktc3lzdGVtXFxcXHByZXJlbmRlclxcXFxibG9nLXJvdXRlcy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXZpbmEvT25lRHJpdmUvRGVza3RvcC9BdmluYXNoJTIwUGF0aGFrL1Byb2Zlc3Npb25hbCUyMFdvcmsvVHJhaW5pbmdNdWcvYWNjcmVkaXRwcm8tY2VudHJhbC1yZXBvc2l0b3J5LXN5c3RlbS9wcmVyZW5kZXIvYmxvZy1yb3V0ZXMuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xyXG5pbXBvcnQgeyBzZW9Db250ZW50RGlyLCBub3JtYWxpemVSb3V0ZUZyb21NYXJrZG93biwgY29sbGVjdE1hcmtkb3duRmlsZXMgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCbG9nUm91dGVzKCkge1xyXG4gIGNvbnN0IHJvdXRlcyA9IG5ldyBTZXQoWycvYmxvZy8nXSk7XHJcblxyXG4gIGZvciAoY29uc3QgZmlsZVBhdGggb2YgY29sbGVjdE1hcmtkb3duRmlsZXMoc2VvQ29udGVudERpcikpIHtcclxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUoc2VvQ29udGVudERpciwgZmlsZVBhdGgpO1xyXG4gICAgcm91dGVzLmFkZChub3JtYWxpemVSb3V0ZUZyb21NYXJrZG93bihyZWxhdGl2ZVBhdGgpKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBBcnJheS5mcm9tKHJvdXRlcykuc29ydCgpO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXZpbmFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxBdmluYXNoIFBhdGhha1xcXFxQcm9mZXNzaW9uYWwgV29ya1xcXFxUcmFpbmluZ011Z1xcXFxhY2NyZWRpdHByby1jZW50cmFsLXJlcG9zaXRvcnktc3lzdGVtXFxcXHByZXJlbmRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXZpbmFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxBdmluYXNoIFBhdGhha1xcXFxQcm9mZXNzaW9uYWwgV29ya1xcXFxUcmFpbmluZ011Z1xcXFxhY2NyZWRpdHByby1jZW50cmFsLXJlcG9zaXRvcnktc3lzdGVtXFxcXHByZXJlbmRlclxcXFx1dGlscy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXZpbmEvT25lRHJpdmUvRGVza3RvcC9BdmluYXNoJTIwUGF0aGFrL1Byb2Zlc3Npb25hbCUyMFdvcmsvVHJhaW5pbmdNdWcvYWNjcmVkaXRwcm8tY2VudHJhbC1yZXBvc2l0b3J5LXN5c3RlbS9wcmVyZW5kZXIvdXRpbHMuanNcIjtpbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XHJcblxyXG5jb25zdCBjdXJyZW50RmlsZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcclxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGN1cnJlbnRGaWxlKTtcclxuY29uc3QgcHJvamVjdFJvb3QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nKTtcclxuXHJcbmV4cG9ydCBjb25zdCBzZW9Db250ZW50RGlyID0gcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCAnc2VvJywgJ2NvbnRlbnQnKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVSb3V0ZUZyb21NYXJrZG93bihyZWxhdGl2ZVBhdGgpIHtcclxuICBjb25zdCBub3JtYWxpemVkID0gcmVsYXRpdmVQYXRoXHJcbiAgICAucmVwbGFjZSgvXFxcXC9nLCAnLycpXHJcbiAgICAucmVwbGFjZSgvXFwvaW5kZXhcXC5tZCQvLCAnJylcclxuICAgIC5yZXBsYWNlKC9cXC5tZCQvLCAnJyk7XHJcblxyXG4gIHJldHVybiBub3JtYWxpemVkID8gYC9ibG9nLyR7bm9ybWFsaXplZH0vYCA6ICcvYmxvZy8nO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdE1hcmtkb3duRmlsZXMoZGlyLCBidWNrZXQgPSBbXSkge1xyXG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XHJcbiAgICByZXR1cm4gYnVja2V0O1xyXG4gIH1cclxuXHJcbiAgZm9yIChjb25zdCBlbnRyeSBvZiBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KSkge1xyXG4gICAgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLicpKSB7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XHJcbiAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICBjb2xsZWN0TWFya2Rvd25GaWxlcyhmdWxsUGF0aCwgYnVja2V0KTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5tZCcpKSB7XHJcbiAgICAgIGJ1Y2tldC5wdXNoKGZ1bGxQYXRoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBidWNrZXQ7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhdmluYVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXEF2aW5hc2ggUGF0aGFrXFxcXFByb2Zlc3Npb25hbCBXb3JrXFxcXFRyYWluaW5nTXVnXFxcXGFjY3JlZGl0cHJvLWNlbnRyYWwtcmVwb3NpdG9yeS1zeXN0ZW1cXFxccHJlcmVuZGVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhdmluYVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXEF2aW5hc2ggUGF0aGFrXFxcXFByb2Zlc3Npb25hbCBXb3JrXFxcXFRyYWluaW5nTXVnXFxcXGFjY3JlZGl0cHJvLWNlbnRyYWwtcmVwb3NpdG9yeS1zeXN0ZW1cXFxccHJlcmVuZGVyXFxcXGJsb2ctc2l0ZW1hcC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXZpbmEvT25lRHJpdmUvRGVza3RvcC9BdmluYXNoJTIwUGF0aGFrL1Byb2Zlc3Npb25hbCUyMFdvcmsvVHJhaW5pbmdNdWcvYWNjcmVkaXRwcm8tY2VudHJhbC1yZXBvc2l0b3J5LXN5c3RlbS9wcmVyZW5kZXIvYmxvZy1zaXRlbWFwLmpzXCI7aW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xyXG5pbXBvcnQgeyBzZW9Db250ZW50RGlyLCBub3JtYWxpemVSb3V0ZUZyb21NYXJrZG93biwgY29sbGVjdE1hcmtkb3duRmlsZXMgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmZ1bmN0aW9uIGNvbGxlY3RNYXJrZG93bkxhc3Rtb2QoZGlyKSB7XHJcbiAgY29uc3QgYnVja2V0ID0ge307XHJcblxyXG4gIGZvciAoY29uc3QgZnVsbFBhdGggb2YgY29sbGVjdE1hcmtkb3duRmlsZXMoZGlyKSkge1xyXG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShzZW9Db250ZW50RGlyLCBmdWxsUGF0aCk7XHJcbiAgICBjb25zdCByb3V0ZSA9IG5vcm1hbGl6ZVJvdXRlRnJvbU1hcmtkb3duKHJlbGF0aXZlUGF0aCk7XHJcbiAgICBidWNrZXRbcm91dGVdID0gZnMuc3RhdFN5bmMoZnVsbFBhdGgpLm10aW1lO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1Y2tldDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TGF0ZXN0Q29udGVudE10aW1lKGxhc3Rtb2RNYXApIHtcclxuICBjb25zdCBkYXRlcyA9IE9iamVjdC52YWx1ZXMobGFzdG1vZE1hcCkuZmlsdGVyKCh2YWx1ZSkgPT4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlKTtcclxuXHJcbiAgaWYgKGRhdGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIHJldHVybiBuZXcgRGF0ZShNYXRoLm1heCguLi5kYXRlcy5tYXAoKGRhdGUpID0+IGRhdGUuZ2V0VGltZSgpKSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2l0ZW1hcExhc3Rtb2QoKSB7XHJcbiAgY29uc3QgY29udGVudExhc3Rtb2QgPSBjb2xsZWN0TWFya2Rvd25MYXN0bW9kKHNlb0NvbnRlbnREaXIpO1xyXG4gIGNvbnN0IGxhdGVzdENvbnRlbnRNdGltZSA9IGdldExhdGVzdENvbnRlbnRNdGltZShjb250ZW50TGFzdG1vZCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAuLi4obGF0ZXN0Q29udGVudE10aW1lID8geyAnL2Jsb2cvJzogbGF0ZXN0Q29udGVudE10aW1lIH0gOiB7fSksXHJcbiAgICAuLi5jb250ZW50TGFzdG1vZCxcclxuICB9O1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOGhCLFNBQVMsb0JBQW9CO0FBQzNqQixPQUFPLFdBQVc7QUFDbEIsT0FBT0EsU0FBUTtBQUNmLE9BQU9DLFdBQVU7QUFDakIsU0FBUyx5QkFBeUI7QUFDbEMsU0FBUyxhQUFhO0FBQ3RCLFNBQVMsMkJBQTJCO0FBQ3BDLE9BQU8sYUFBYTs7O0FDUDBpQixPQUFPQyxXQUFVOzs7QUNBN0IsT0FBTyxRQUFRO0FBQ2prQixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFGK1UsSUFBTSwyQ0FBMkM7QUFJOVosSUFBTSxjQUFjLGNBQWMsd0NBQWU7QUFDakQsSUFBTUMsYUFBWSxLQUFLLFFBQVEsV0FBVztBQUMxQyxJQUFNLGNBQWMsS0FBSyxRQUFRQSxZQUFXLElBQUk7QUFFekMsSUFBTSxnQkFBZ0IsS0FBSyxRQUFRLGFBQWEsT0FBTyxTQUFTO0FBRWhFLFNBQVMsMkJBQTJCLGNBQWM7QUFDdkQsUUFBTSxhQUFhLGFBQ2hCLFFBQVEsT0FBTyxHQUFHLEVBQ2xCLFFBQVEsZ0JBQWdCLEVBQUUsRUFDMUIsUUFBUSxTQUFTLEVBQUU7QUFFdEIsU0FBTyxhQUFhLFNBQVMsVUFBVSxNQUFNO0FBQy9DO0FBRU8sU0FBUyxxQkFBcUIsS0FBSyxTQUFTLENBQUMsR0FBRztBQUNyRCxNQUFJLENBQUMsR0FBRyxXQUFXLEdBQUcsR0FBRztBQUN2QixXQUFPO0FBQUEsRUFDVDtBQUVBLGFBQVcsU0FBUyxHQUFHLFlBQVksS0FBSyxFQUFFLGVBQWUsS0FBSyxDQUFDLEdBQUc7QUFDaEUsUUFBSSxNQUFNLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFDOUI7QUFBQSxJQUNGO0FBRUEsVUFBTSxXQUFXLEtBQUssS0FBSyxLQUFLLE1BQU0sSUFBSTtBQUMxQyxRQUFJLE1BQU0sWUFBWSxHQUFHO0FBQ3ZCLDJCQUFxQixVQUFVLE1BQU07QUFDckM7QUFBQSxJQUNGO0FBRUEsUUFBSSxNQUFNLE9BQU8sS0FBSyxNQUFNLEtBQUssU0FBUyxLQUFLLEdBQUc7QUFDaEQsYUFBTyxLQUFLLFFBQVE7QUFBQSxJQUN0QjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1Q7OztBRHRDTyxTQUFTLGdCQUFnQjtBQUM5QixRQUFNLFNBQVMsb0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUVqQyxhQUFXLFlBQVkscUJBQXFCLGFBQWEsR0FBRztBQUMxRCxVQUFNLGVBQWVDLE1BQUssU0FBUyxlQUFlLFFBQVE7QUFDMUQsV0FBTyxJQUFJLDJCQUEyQixZQUFZLENBQUM7QUFBQSxFQUNyRDtBQUVBLFNBQU8sTUFBTSxLQUFLLE1BQU0sRUFBRSxLQUFLO0FBQ2pDOzs7QUVaZ2tCLE9BQU9DLFNBQVE7QUFDL2tCLE9BQU9DLFdBQVU7QUFHakIsU0FBUyx1QkFBdUIsS0FBSztBQUNuQyxRQUFNLFNBQVMsQ0FBQztBQUVoQixhQUFXLFlBQVkscUJBQXFCLEdBQUcsR0FBRztBQUNoRCxVQUFNLGVBQWVDLE1BQUssU0FBUyxlQUFlLFFBQVE7QUFDMUQsVUFBTSxRQUFRLDJCQUEyQixZQUFZO0FBQ3JELFdBQU8sS0FBSyxJQUFJQyxJQUFHLFNBQVMsUUFBUSxFQUFFO0FBQUEsRUFDeEM7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxTQUFTLHNCQUFzQixZQUFZO0FBQ3pDLFFBQU0sUUFBUSxPQUFPLE9BQU8sVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLGlCQUFpQixJQUFJO0FBRS9FLE1BQUksTUFBTSxXQUFXLEdBQUc7QUFDdEIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxTQUFPLElBQUksS0FBSyxLQUFLLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNsRTtBQUVPLFNBQVMsb0JBQW9CO0FBQ2xDLFFBQU0saUJBQWlCLHVCQUF1QixhQUFhO0FBQzNELFFBQU0scUJBQXFCLHNCQUFzQixjQUFjO0FBRS9ELFNBQU87QUFBQSxJQUNMLEdBQUkscUJBQXFCLEVBQUUsVUFBVSxtQkFBbUIsSUFBSSxDQUFDO0FBQUEsSUFDN0QsR0FBRztBQUFBLEVBQ0w7QUFDRjs7O0FIbENBLElBQU0sbUNBQW1DO0FBV3pDLFNBQVMsZUFBZSxLQUFxQjtBQUMzQyxTQUFPLElBQ0osUUFBUSxNQUFNLE9BQU8sRUFDckIsUUFBUSxNQUFNLE1BQU0sRUFDcEIsUUFBUSxNQUFNLE1BQU0sRUFDcEIsUUFBUSxNQUFNLFFBQVEsRUFDdEIsUUFBUSxNQUFNLE9BQU87QUFDMUI7QUFFQSxRQUFRLElBQUksbUJBQW1CLFFBQVEsSUFBSSxrQkFBa0I7QUFDN0QsUUFBUSxJQUFJLHlCQUF5QixRQUFRLElBQUksd0JBQXdCO0FBQ3pFLFFBQVEsSUFBSSxpQkFBaUIsZUFBZSxRQUFRLElBQUksY0FBYztBQUN0RSxRQUFRLElBQUksdUJBQXVCLGVBQWUsUUFBUSxJQUFJLG9CQUFvQjtBQUNsRixRQUFRLElBQUksc0JBQXNCLFFBQVEsSUFBSSxxQkFBcUI7QUFFbkUsU0FBUyxvQkFBb0I7QUFDM0IsTUFBSSxTQUFTQyxNQUFLLFFBQVEsa0NBQVcsTUFBTTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixlQUFlLFFBQVE7QUFDckIsZUFBU0EsTUFBSyxRQUFRLE9BQU8sTUFBTSxPQUFPLE1BQU0sTUFBTTtBQUFBLElBQ3hEO0FBQUEsSUFDQSxjQUFjO0FBQ1osTUFBQUMsSUFBRyxVQUFVLFFBQVEsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUFBLElBQzFDO0FBQUEsSUFDQSxpQkFBaUI7QUFDZixNQUFBQSxJQUFHLFVBQVUsUUFBUSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUMzQyxRQUFNLHNCQUFzQixZQUFZLFVBQVUsY0FBYyxJQUFJLENBQUM7QUFFckUsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1Asa0JBQWtCO0FBQUEsUUFDaEIsUUFBUTtBQUFBO0FBQUEsTUFDVixDQUFDO0FBQUEsTUFDRCxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixrQkFBa0I7QUFBQSxNQUNsQixRQUFRO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixTQUFTLGtCQUFrQjtBQUFBLFFBQzNCLFVBQVU7QUFBQSxRQUNWLG1CQUFtQjtBQUFBLE1BQ3JCLENBQUM7QUFBQSxNQUNELEdBQUksb0JBQW9CLFNBQVMsSUFDN0Isb0JBQW9CO0FBQUEsUUFDbEIsY0FBYztBQUFBLFFBQ2QsaUJBQWlCRCxNQUFLLFFBQVEsa0NBQVcsbUJBQW1CO0FBQUEsUUFDNUQsMkJBQTJCO0FBQUEsTUFDN0IsQ0FBQyxJQUNELENBQUM7QUFBQSxJQUNQO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLQSxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFDTixNQUFNLFNBQVMsUUFBUSxJQUFJLGFBQWEsTUFBTTtBQUFBLE1BQzlDLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVEsUUFBUSxJQUFJLGVBQWU7QUFBQSxVQUNuQyxjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE9BQU8sRUFBRSxZQUFZLE1BQU0sVUFBVSxJQUFJO0FBQUEsSUFDM0M7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQTtBQUFBLFlBRVosZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDckMsaUJBQWlCLENBQUMsa0JBQWtCO0FBQUEsWUFDcEMsYUFBYTtBQUFBLGNBQ1g7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLFlBQ0Y7QUFBQSxZQUNBLGVBQWUsQ0FBQyxtQkFBbUIsdUJBQXVCLEtBQUs7QUFBQSxZQUMvRCxnQkFBZ0I7QUFBQSxjQUNkO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQUEsWUFDQSxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxVQUMxQztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJmcyIsICJwYXRoIiwgInBhdGgiLCAiX19kaXJuYW1lIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAiZnMiXQp9Cg==
