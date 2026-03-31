const normalizeTarget = (rawInput) => {
  const input = (rawInput || "").trim();
  if (!input) {
    throw new Error("Enter a URL first.");
  }

  return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).href;
};

const headerNames = [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "x-content-type-options",
  "cross-origin-opener-policy",
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = normalizeTarget(searchParams.get("url"));

    const response = await fetch(target, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: {
        "user-agent": "CipherLab Security Headers Checker",
      },
    });

    const headers = Object.fromEntries(headerNames.map((name) => [name, response.headers.get(name) || ""]));
    const missing = headerNames.filter((name) => !headers[name]);

    return Response.json({
      status: response.status,
      finalUrl: response.url,
      headers,
      missing,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Security header lookup failed." },
      { status: 500 },
    );
  }
}
