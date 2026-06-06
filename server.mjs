import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const preferredPort = Number(process.env.PORT || 4173);
const maxPortAttempts = 10;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const normalizedPath = normalize(requestedPath)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = join(rootDir, normalizedPath);

  try {
    const file = await readFile(filePath);
    const contentType = MIME_TYPES[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }
});

function startServer(port, attempt = 0) {
  server
    .once("error", (error) => {
      if (error.code === "EADDRINUSE" && attempt < maxPortAttempts - 1) {
        const nextPort = port + 1;
        console.log(`Port ${port} is busy, trying http://127.0.0.1:${nextPort} ...`);
        startServer(nextPort, attempt + 1);
        return;
      }

      if (error.code === "EADDRINUSE") {
        console.error(
          `Could not find a free port between ${preferredPort} and ${
            preferredPort + maxPortAttempts - 1
          }.`
        );
        console.error("You can also run with a custom port, for example: $env:PORT=4188; npm run dev");
        process.exit(1);
      }

      console.error(error);
      process.exit(1);
    })
    .listen(port, "0.0.0.0", () => {
      console.log(`mealwheel is running at http://127.0.0.1:${port}`);
    });
}

startServer(preferredPort);
