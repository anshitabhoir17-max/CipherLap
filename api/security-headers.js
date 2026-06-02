const headerNames = [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "x-content-type-options",
  "cross-origin-opener-policy",
];

const requestHeaders = {
  "user-agent": "Mozilla/5.0 CipherLab Security Headers Checker",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  pragma: "no-cache",
};

const normalizeTarget = (rawInput) => {
  const input = (rawInput || "").trim();
  if (!input) {
    throw new Error("Enter a URL first.");
  }

  return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).href;
};

const buildTargetCandidates = (target) => {
  const candidates = [target];
  const parsed = new URL(target);

  if (parsed.protocol === "https:") {
    const httpVersion = new URL(parsed.href);
    httpVersion.protocol = "http:";
    candidates.push(httpVersion.href);
  }

  return candidates;
};

const readSecurityHeaders = (response) => {
  const headers = {
    "content-security-policy":
      response.headers.get("content-security-policy") ||
      response.headers.get("content-security-policy-report-only") ||
      "",
    "strict-transport-security": response.headers.get("strict-transport-security") || "",
    "x-frame-options": response.headers.get("x-frame-options") || "",
    "referrer-policy": response.headers.get("referrer-policy") || "",
    "permissions-policy": response.headers.get("permissions-policy") || "",
    "x-content-type-options": response.headers.get("x-content-type-options") || "",
    "cross-origin-opener-policy": response.headers.get("cross-origin-opener-policy") || "",
  };

  return {
    headers,
    missing: headerNames.filter((name) => !headers[name]),
  };
};

async function fetchTargetWithFallback(target) {
  let lastError = null;

  for (const candidate of buildTargetCandidates(target)) {
    for (const method of ["HEAD", "GET"]) {
      try {
        const response = await fetch(candidate, {
          method,
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
          headers: requestHeaders,
        });

        if (response.status === 405 && method === "HEAD") {
          continue;
        }

        return { response, method };
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error("The website could not be reached.");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = normalizeTarget(searchParams.get("url"));
    const { response, method } = await fetchTargetWithFallback(target);
    const { headers, missing } = readSecurityHeaders(response);

    return Response.json({
      status: response.status,
      finalUrl: response.url,
      method,
      headers,
      missing,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Security header lookup failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
