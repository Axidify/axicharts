import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import path from "node:path";
import { handleOrchestratorRequest } from "./http/handlers";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

export type AxiboardServerOptions = {
  port?: number;
  host?: string;
  /** Directory with Vite `dist/` output (index.html + assets). */
  staticDir: string;
};

function contentType(filePath: string): string {
  return MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function resolveStaticPath(staticDir: string, urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const resolved = path.resolve(staticDir, relative);
  const root = path.resolve(staticDir);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return null;
  }
  return resolved;
}

async function sendFile(res: ServerResponse, filePath: string): Promise<void> {
  const type = contentType(filePath);
  res.statusCode = 200;
  res.setHeader("content-type", type);
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("end", resolve);
    stream.pipe(res);
  });
}

async function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  staticDir: string,
): Promise<boolean> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return true;
  }

  let filePath = resolveStaticPath(staticDir, pathname);
  if (!filePath) {
    res.statusCode = 403;
    res.end("Forbidden");
    return true;
  }

  try {
    let fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fileStat = await stat(filePath);
    }

    if (!fileStat.isFile()) {
      throw new Error("not a file");
    }

    if (req.method === "HEAD") {
      res.statusCode = 200;
      res.setHeader("content-type", contentType(filePath));
      res.end();
      return true;
    }

    await sendFile(res, filePath);
    return true;
  } catch {
    const spaFallback = path.join(staticDir, "index.html");
    if (existsSync(spaFallback) && !path.extname(pathname)) {
      if (req.method === "HEAD") {
        res.statusCode = 200;
        res.setHeader("content-type", "text/html; charset=utf-8");
        res.end();
        return true;
      }
      await sendFile(res, spaFallback);
      return true;
    }

    res.statusCode = 404;
    res.end("Not found");
    return true;
  }
}

export type AxiboardServer = {
  server: Server;
  listen: () => Promise<void>;
  url: string;
};

export function createAxiboardServer(options: AxiboardServerOptions): AxiboardServer {
  const port = options.port ?? Number(process.env.PORT ?? 3000);
  const host = options.host ?? process.env.HOST ?? "0.0.0.0";
  const staticDir = path.resolve(options.staticDir);

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (await handleOrchestratorRequest(req, res, url.pathname)) {
      return;
    }

    await serveStatic(req, res, url.pathname, staticDir);
  });

  return {
    server,
    async listen() {
      await new Promise<void>((resolve) => {
        server.listen(port, host, () => resolve());
      });
    },
    get url() {
      return `http://${host}:${port}`;
    },
  };
}
