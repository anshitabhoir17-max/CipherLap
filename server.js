import http from "node:http";
import { spawn } from "node:child_process";
import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import tls from "node:tls";
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
const SECURITY_HEADER_NAMES = [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "x-content-type-options",
  "cross-origin-opener-policy",
];
const SECURITY_CHECK_HEADERS = {
  "user-agent": "Mozilla/5.0 CipherLab Security Headers Checker",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  pragma: "no-cache",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function runPhishingModel(text) {
  return new Promise((resolve, reject) => {
    const python = process.platform === "win32" ? "python" : "python3";
    const scriptPath = path.join(ROOT_DIR, "ml", "predict_phishing.py");
    const modelPath = path.join(ROOT_DIR, "ml", "phishing_model.pkl");
    const vectorizerPath = path.join(ROOT_DIR, "ml", "tfidf_vectorizer.pkl");
    const child = spawn(python, [scriptPath, modelPath, vectorizerPath], { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || "The phishing model process failed."));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("The phishing model returned an invalid response."));
      }
    });
    child.stdin.end(JSON.stringify({ text }));
  });
}

async function handlePhishingPredict(request, response) {
  try {
    const body = await readJsonBody(request);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      sendJson(response, 400, { error: "Paste email text or headers first." });
      return;
    }
    if (text.length > 250000) {
      sendJson(response, 413, { error: "Email content is too large for this local model." });
      return;
    }
    sendJson(response, 200, await runPhishingModel(text));
  } catch (error) {
    sendJson(response, 503, {
      error: "The AI phishing model is unavailable. Install the Python dependencies and start the API server.",
      details: error instanceof Error ? error.message : "Unknown model error.",
    });
  }
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

const getTlsSnapshot = (domain) =>
  new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain,
        rejectUnauthorized: false,
      },
      () => {
        const certificate = socket.getPeerCertificate();
        resolve({
          reachable: true,
          subject: certificate?.subject?.CN || "unknown",
          issuer: certificate?.issuer?.O || certificate?.issuer?.CN || "unknown",
          validTo: certificate?.valid_to || "unknown",
        });
        socket.end();
      },
    );

    socket.setTimeout(8000);
    socket.on("timeout", () => {
      resolve({ reachable: false, subject: "unknown", issuer: "unknown", validTo: "unknown" });
      socket.destroy();
    });
    socket.on("error", () => {
      resolve({ reachable: false, subject: "unknown", issuer: "unknown", validTo: "unknown" });
    });
  });

async function handleDomainIntelligence(url, response) {
  try {
    const domain = (url.searchParams.get("domain") || "").trim().toLowerCase();
    if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain)) {
      sendJson(response, 400, { error: "Enter a valid domain." });
      return;
    }

    const [a, mx, ns, txt, tlsSnapshot, rdapResponse] = await Promise.all([
      dns.resolve4(domain).catch(() => []),
      dns.resolveMx(domain).catch(() => []),
      dns.resolveNs(domain).catch(() => []),
      dns.resolveTxt(domain).catch(() => []),
      getTlsSnapshot(domain),
      fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`).catch(() => null),
    ]);

    const rdapPayload = rdapResponse?.ok ? await rdapResponse.json() : null;
    const createdAt =
      rdapPayload?.events?.find((event) => /registration|created/i.test(event.eventAction))?.eventDate || null;
    const ageDays = createdAt
      ? Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000))
      : null;
    const registrar =
      rdapPayload?.entities?.find((entity) => entity.roles?.includes("registrar"))?.vcardArray?.[1]?.find?.(
        (item) => item[0] === "fn",
      )?.[3] || "unknown";

    sendJson(response, 200, {
      domain,
      registrar,
      createdAt,
      ageDays,
      status: rdapPayload?.status || [],
      dns: {
        a,
        mx: mx.map((entry) => `${entry.exchange} (${entry.priority})`),
        ns,
        txt: txt.map((entry) => entry.join("")),
      },
      tls: tlsSnapshot,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Domain intelligence lookup failed.",
    });
  }
}

async function handleSecurityHeaders(url, response) {
  try {
    const rawTarget = (url.searchParams.get("url") || "").trim();
    if (!rawTarget) {
      sendJson(response, 400, { error: "Enter a URL first." });
      return;
    }

    const target = new URL(/^https?:\/\//i.test(rawTarget) ? rawTarget : `https://${rawTarget}`).href;
    const candidates = [target];
    const parsedTarget = new URL(target);
    if (parsedTarget.protocol === "https:") {
      const httpTarget = new URL(parsedTarget.href);
      httpTarget.protocol = "http:";
      candidates.push(httpTarget.href);
    }

    let upstream = null;
    let methodUsed = "GET";
    let lastError = null;

    for (const candidate of candidates) {
      for (const method of ["HEAD", "GET"]) {
        try {
          const nextResponse = await fetch(candidate, {
            method,
            redirect: "follow",
            signal: AbortSignal.timeout(10000),
            headers: SECURITY_CHECK_HEADERS,
          });

          if (nextResponse.status === 405 && method === "HEAD") {
            continue;
          }

          upstream = nextResponse;
          methodUsed = method;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (upstream) {
        break;
      }
    }

    if (!upstream) {
      throw lastError || new Error("The website could not be reached.");
    }

    const headers = {
      "content-security-policy":
        upstream.headers.get("content-security-policy") ||
        upstream.headers.get("content-security-policy-report-only") ||
        "",
      "strict-transport-security": upstream.headers.get("strict-transport-security") || "",
      "x-frame-options": upstream.headers.get("x-frame-options") || "",
      "referrer-policy": upstream.headers.get("referrer-policy") || "",
      "permissions-policy": upstream.headers.get("permissions-policy") || "",
      "x-content-type-options": upstream.headers.get("x-content-type-options") || "",
      "cross-origin-opener-policy": upstream.headers.get("cross-origin-opener-policy") || "",
    };
    const missing = SECURITY_HEADER_NAMES.filter((name) => !headers[name]);

    sendJson(response, 200, {
      status: upstream.status,
      finalUrl: upstream.url,
      method: methodUsed,
      headers,
      missing,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Security header lookup failed.",
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

  if (request.method === "POST" && url.pathname === "/api/phishing-predict") {
    await handlePhishingPredict(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/domain-intelligence") {
    await handleDomainIntelligence(url, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/security-headers") {
    await handleSecurityHeaders(url, response);
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
