import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT_DIR, "dist");
const MAX_BODY_SIZE = 15 * 1024 * 1024;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let totalLength = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      totalLength += chunk.length;
      if (totalLength > MAX_BODY_SIZE) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    request.on("error", (error) => reject(error));
  });
}

async function handleAiImageDetect(request, response) {
  if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
    sendJson(response, 501, {
      error:
        "AI detection API is not configured. Set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET in the server environment.",
    });
    return;
  }

  try {
    const { filename, mimeType, base64 } = await readJsonBody(request);
    if (!base64 || typeof base64 !== "string") {
      sendJson(response, 400, { error: "Missing image payload." });
      return;
    }

    const fileBuffer = Buffer.from(base64, "base64");
    const form = new FormData();
    form.append("models", "genai");
    form.append("api_user", process.env.SIGHTENGINE_API_USER);
    form.append("api_secret", process.env.SIGHTENGINE_API_SECRET);
    form.append(
      "media",
      new Blob([fileBuffer], { type: mimeType || "application/octet-stream" }),
      filename || "upload.jpg",
    );

    const apiResponse = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: form,
    });

    const apiPayload = await apiResponse.json();
    if (!apiResponse.ok) {
      sendJson(response, 502, {
        error: apiPayload?.error?.message || "The upstream AI detection service returned an error.",
      });
      return;
    }

    const score = Number(apiPayload?.type?.ai_generated ?? 0);
    sendJson(response, 200, {
      provider: "Sightengine",
      score: Number.isFinite(score) ? score : 0,
      raw: apiPayload,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "The AI detection request failed.",
    });
  }
}

function safeFilePath(baseDir, urlPathname) {
  const requestedPath = urlPathname === "/" ? "/index.html" : urlPathname;
  const normalizedPath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(baseDir, normalizedPath);
  return absolutePath.startsWith(baseDir) ? absolutePath : null;
}

async function handleStaticFile(baseDir, urlPathname, response) {
  const absolutePath = safeFilePath(baseDir, urlPathname);
  if (!absolutePath) {
    sendJson(response, 403, { error: "Forbidden path." });
    return true;
  }

  try {
    const fileStat = await fs.promises.stat(absolutePath);
    if (fileStat.isDirectory()) {
      sendJson(response, 403, { error: "Directory access is not allowed." });
      return true;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
    });
    fs.createReadStream(absolutePath).pipe(response);
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "POST" && url.pathname === "/api/ai-image-detect") {
    await handleAiImageDetect(request, response);
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (fs.existsSync(DIST_DIR)) {
    const servedAsset = await handleStaticFile(DIST_DIR, url.pathname, response);
    if (servedAsset) {
      return;
    }

    if (!path.extname(url.pathname)) {
      await handleStaticFile(DIST_DIR, "/index.html", response);
      return;
    }

    sendJson(response, 404, { error: "File not found." });
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    response.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(
      "CipherLab API server is running. Start the React frontend with `npm run dev` on http://localhost:5173, or build the app with `npm run build` so this server can serve dist/ in production.",
    );
    return;
  }

  sendJson(response, 404, {
    error: "Frontend assets are not built yet. Run `npm run dev` for development or `npm run build` for production.",
  });
});

server.listen(PORT, () => {
  console.log(`CipherLab server running on http://localhost:${PORT}`);
});
