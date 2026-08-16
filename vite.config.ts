import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Project paths
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;

// =============================================================================
// Manus Debug Collector
// =============================================================================

const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource =
  | "browserConsole"
  | "networkRequests"
  | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    const targetSize = TRIM_TARGET_BYTES;

    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(
        `${lines[i]}\n`,
        "utf-8"
      );

      if (keptBytes + lineBytes > targetSize) {
        break;
      }

      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(
      logPath,
      keptLines.join("\n"),
      "utf-8"
    );
  } catch {
    // Ignore trim errors.
  }
}

function writeToLogFile(
  source: LogSource,
  entries: unknown[]
) {
  if (entries.length === 0) return;

  ensureLogDir();

  const logPath = path.join(
    LOG_DIR,
    `${source}.log`
  );

  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();

    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  fs.appendFileSync(
    logPath,
    `${lines.join("\n")}\n`,
    "utf-8"
  );

  trimLogFile(
    logPath,
    MAX_LOG_SIZE_BYTES
  );
}

/**
 * Vite plugin to collect browser debug logs.
 *
 * POST /__manus__/logs
 *
 * Logs are stored inside:
 * .manus-logs/
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }

      return {
        html,

        tags: [
          {
            tag: "script",

            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },

            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        "/__manus__/logs",
        (req, res, next) => {
          if (req.method !== "POST") {
            return next();
          }

          const handlePayload = (
            payload: any
          ) => {
            if (
              payload.consoleLogs?.length > 0
            ) {
              writeToLogFile(
                "browserConsole",
                payload.consoleLogs
              );
            }

            if (
              payload.networkRequests?.length > 0
            ) {
              writeToLogFile(
                "networkRequests",
                payload.networkRequests
              );
            }

            if (
              payload.sessionEvents?.length > 0
            ) {
              writeToLogFile(
                "sessionReplay",
                payload.sessionEvents
              );
            }

            res.writeHead(200, {
              "Content-Type":
                "application/json",
            });

            res.end(
              JSON.stringify({
                success: true,
              })
            );
          };

          const reqBody = (
            req as {
              body?: unknown;
            }
          ).body;

          if (
            reqBody &&
            typeof reqBody === "object"
          ) {
            try {
              handlePayload(reqBody);
            } catch (e) {
              res.writeHead(400, {
                "Content-Type":
                  "application/json",
              });

              res.end(
                JSON.stringify({
                  success: false,
                  error: String(e),
                })
              );
            }

            return;
          }

          let body = "";

          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", () => {
            try {
              const payload =
                JSON.parse(body);

              handlePayload(payload);
            } catch (e) {
              res.writeHead(400, {
                "Content-Type":
                  "application/json",
              });

              res.end(
                JSON.stringify({
                  success: false,
                  error: String(e),
                })
              );
            }
          });
        }
      );
    },
  };
}

// =============================================================================
// Local Manus Storage Proxy
// =============================================================================
//
// The original project expects images at:
//
// /manus-storage/<filename>
//
// The hosted version gets these files from Manus Storage.
//
// For local development we downloaded the assets into:
//
// client/public/manus-storage/
//
// This plugin serves those local files while keeping the
// original URLs unchanged.
// =============================================================================

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",

    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        "/manus-storage",
        (req, res) => {
          const key = req.url?.replace(
            /^\//,
            ""
          );

          if (!key) {
            res.writeHead(400, {
              "Content-Type":
                "text/plain",
            });

            res.end(
              "Missing storage key"
            );

            return;
          }

          const storageRoot =
            path.resolve(
              PROJECT_ROOT,
              "client",
              "public",
              "manus-storage"
            );

          const localPath =
            path.resolve(
              storageRoot,
              key
            );

          // Prevent path traversal.
          if (
            localPath !== storageRoot &&
            !localPath.startsWith(
              storageRoot + path.sep
            )
          ) {
            res.writeHead(403, {
              "Content-Type":
                "text/plain",
            });

            res.end(
              "Invalid storage path"
            );

            return;
          }

          if (
            !fs.existsSync(localPath)
          ) {
            res.writeHead(404, {
              "Content-Type":
                "text/plain",
            });

            res.end(
              `Local storage asset not found: ${key}`
            );

            return;
          }

          const ext =
            path
              .extname(localPath)
              .toLowerCase();

          const contentTypes: Record<
            string,
            string
          > = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".avif": "image/avif",
          };

          res.writeHead(200, {
            "Content-Type":
              contentTypes[ext] ||
              "application/octet-stream",

            "Cache-Control":
              "public, max-age=31536000",
          });

          fs.createReadStream(
            localPath
          ).pipe(res);
        }
      );
    },
  };
}

// =============================================================================
// Plugins
// =============================================================================

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  vitePluginManusDebugCollector(),
  vitePluginStorageProxy(),
];

// =============================================================================
// GitHub Pages Assets
// =============================================================================

/**
 * GitHub Pages does not provide the original
 * /manus-storage route.
 *
 * During GitHub Pages builds we replace the
 * storage paths with the public Manus Storage
 * origin.
 */
function vitePluginGitHubPagesAssets(): Plugin {
  const assetOrigin =
    "https://kafrawicars-undfwezj.manus.space";

  return {
    name: "github-pages-public-assets",

    enforce: "pre",

    transform(code, id) {
      if (
        process.env.GITHUB_PAGES !== "true" ||
        !/\.(?:[jt]sx?|css)$/.test(id)
      ) {
        return null;
      }

      const transformed = code
        .replaceAll(
          '"/manus-storage/',
          `"${assetOrigin}/manus-storage/`
        )
        .replaceAll(
          "'/manus-storage/",
          `'${assetOrigin}/manus-storage/`
        );

      return transformed === code
        ? null
        : {
          code: transformed,
          map: null,
        };
    },
  };
}

// =============================================================================
// Environment
// =============================================================================

const isGitHubPagesBuild =
  process.env.GITHUB_PAGES === "true";

// =============================================================================
// Vite configuration
// =============================================================================

export default defineConfig({
  base: isGitHubPagesBuild
    ? "/roadbook-showroom-experience/"
    : "/",

  plugins: [
    ...plugins,
    vitePluginGitHubPagesAssets(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(
        PROJECT_ROOT,
        "client",
        "src"
      ),

      "@shared": path.resolve(
        PROJECT_ROOT,
        "shared"
      ),

      "@assets": path.resolve(
        PROJECT_ROOT,
        "attached_assets"
      ),
    },
  },

  envDir: PROJECT_ROOT,

  root: path.resolve(
    PROJECT_ROOT,
    "client"
  ),

  build: {
    outDir: path.resolve(
      PROJECT_ROOT,
      "dist/public"
    ),

    emptyOutDir: true,
  },

  server: {
    port: 3000,

    strictPort: false,

    host: true,

    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],

    fs: {
      strict: true,

      deny: [
        "**/.*",
      ],
    },
  },
});