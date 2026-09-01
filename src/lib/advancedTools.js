import CryptoJS from "crypto-js";
import * as exifr from "exifr";
import jsQR from "jsqr";

const commonWeakPasswords = new Set([
  "password",
  "password123",
  "123456",
  "123456789",
  "qwerty",
  "admin",
  "letmein",
  "welcome",
  "iloveyou",
  "abc123",
  "monkey",
  "football",
]);

export const awarenessQuizQuestions = [
  {
    id: "q1",
    question: "A bank email asks you to verify your password through a link. What is the safest response?",
    options: [
      "Do not click it and verify through the bank's official website or app.",
      "Reply to the email and ask if it is real.",
      "Click the link if the logo looks correct.",
    ],
    answer: 0,
  },
  {
    id: "q2",
    question: "Why is multi-factor authentication useful?",
    options: [
      "It adds another verification layer even if a password is stolen.",
      "It makes passwords unnecessary forever.",
      "It only protects social media accounts.",
    ],
    answer: 0,
  },
  {
    id: "q3",
    question: "Which file attachment is most suspicious in a random email?",
    options: [
      "invoice.html",
      "family-photo.jpg",
      "notes.txt",
    ],
    answer: 0,
  },
  {
    id: "q4",
    question: "What should you do before trusting a shortened URL?",
    options: [
      "Expand or verify the destination before opening it.",
      "Open it only on mobile data.",
      "Trust it if a friend shared it once.",
    ],
    answer: 0,
  },
  {
    id: "q5",
    question: "A strong password is best described as:",
    options: [
      "Long, unique, and not reused across sites.",
      "Your name plus your birth year.",
      "The same password with a different last digit everywhere.",
    ],
    answer: 0,
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const resultTone = (score) => {
  if (score >= 65) {
    return "high";
  }

  if (score >= 35) {
    return "medium";
  }

  return "low";
};

const safeJson = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const toHex = (buffer) =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const base64FromBytes = (bytes) => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const wordArrayFromBuffer = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  const words = [];
  for (let index = 0; index < bytes.length; index += 1) {
    words[index >>> 2] |= bytes[index] << (24 - (index % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
};

const normalizeDomain = (rawInput) => {
  const input = rawInput.trim().toLowerCase();
  if (!input) {
    throw new Error("Enter a domain first.");
  }

  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return url.hostname.toLowerCase();
  } catch {
    throw new Error("Enter a valid domain or URL.");
  }
};

const normalizeTargetUrl = (rawInput) => {
  const input = rawInput.trim();
  if (!input) {
    throw new Error("Enter a URL first.");
  }

  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).href;
  } catch {
    throw new Error("Enter a valid URL.");
  }
};

const parseStructuredHeaders = (rawHeaders) => {
  const mergedLines = [];
  for (const rawLine of rawHeaders.split(/\r?\n/)) {
    if (/^\s/.test(rawLine) && mergedLines.length) {
      mergedLines[mergedLines.length - 1] += ` ${rawLine.trim()}`;
    } else {
      mergedLines.push(rawLine);
    }
  }

  const headers = new Map();
  for (const line of mergedLines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    if (!headers.has(key)) {
      headers.set(key, []);
    }
    headers.get(key).push(value);
  }

  return headers;
};

const extractEmailDomain = (value = "") => {
  const match = value.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);
  return match ? match[1].toLowerCase() : "";
};

const readJsonResponse = async (response) => response.json().catch(() => ({}));

const formatBackendError = (error, fallbackMessage) => {
  const message = error instanceof Error ? error.message : "";
  if (/fetch/i.test(message) || /failed/i.test(message)) {
    return `${fallbackMessage} If you are testing locally, start \`npm run api\` too.`;
  }
  return message || fallbackMessage;
};

export function analyzeEmailHeaders(rawHeaders) {
  if (!rawHeaders.trim()) {
    throw new Error("Paste raw email headers first.");
  }

  const headers = parseStructuredHeaders(rawHeaders);
  const findings = [];
  let score = 8;

  const fromDomain = extractEmailDomain(headers.get("from")?.[0] || "");
  const replyToDomain = extractEmailDomain(headers.get("reply-to")?.[0] || "");
  const returnPathDomain = extractEmailDomain(headers.get("return-path")?.[0] || "");

  if (fromDomain && replyToDomain && fromDomain !== replyToDomain) {
    score += 20;
    findings.push(`Reply-To differs from From (${fromDomain} vs ${replyToDomain}).`);
  }

  if (fromDomain && returnPathDomain && fromDomain !== returnPathDomain) {
    score += 18;
    findings.push(`Return-Path differs from From (${fromDomain} vs ${returnPathDomain}).`);
  }

  const authResultsRaw = [headers.get("authentication-results")?.join(" "), headers.get("received-spf")?.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const spfStatus = /spf=(pass|fail|softfail|neutral|none)/.exec(authResultsRaw)?.[1] || "unknown";
  const dkimStatus = /dkim=(pass|fail|none|neutral)/.exec(authResultsRaw)?.[1] || "unknown";
  const dmarcStatus = /dmarc=(pass|fail|none|bestguesspass)/.exec(authResultsRaw)?.[1] || "unknown";

  if (spfStatus === "fail" || spfStatus === "softfail") {
    score += 18;
    findings.push(`SPF check returned ${spfStatus}.`);
  }

  if (dkimStatus === "fail" || dkimStatus === "none") {
    score += 16;
    findings.push(`DKIM check returned ${dkimStatus}.`);
  }

  if (dmarcStatus === "fail" || dmarcStatus === "none") {
    score += 20;
    findings.push(`DMARC check returned ${dmarcStatus}.`);
  }

  const receivedHops = headers.get("received")?.length || 0;
  if (receivedHops > 7) {
    score += 8;
    findings.push(`The message traveled through many hops (${receivedHops}).`);
  }

  if (!headers.get("message-id")?.length) {
    score += 10;
    findings.push("No Message-ID header was found.");
  }

  if (!headers.get("date")?.length) {
    score += 8;
    findings.push("No Date header was found.");
  }

  const suspicious = score >= 38 || [spfStatus, dkimStatus, dmarcStatus].includes("fail");

  return {
    badge: suspicious ? "Suspicious Header Set" : "Mostly Consistent Headers",
    tone: suspicious ? "high" : "low",
    summary: suspicious
      ? "These headers contain authentication or sender-routing signals that deserve closer review."
      : "The header set looks more internally consistent in this automated pass.",
    action: suspicious
      ? "Treat this email carefully and verify the sender domain before trusting any links or attachments."
      : "Header checks look cleaner here, but you should still verify the sending context.",
    findings: findings.length ? findings : ["No major header authentication issues were detected."],
    blocks: [
      {
        title: "Authentication checks",
        content: [
          `SPF: ${spfStatus}`,
          `DKIM: ${dkimStatus}`,
          `DMARC: ${dmarcStatus}`,
        ],
      },
      {
        title: "Route summary",
        content: [
          `From domain: ${fromDomain || "not found"}`,
          `Reply-To domain: ${replyToDomain || "not found"}`,
          `Return-Path domain: ${returnPathDomain || "not found"}`,
          `Received hops: ${receivedHops}`,
        ],
      },
    ],
  };
}

export async function lookupDomainIntelligence(rawInput) {
  const domain = normalizeDomain(rawInput);
  let response;

  try {
    response = await fetch(`/api/domain-intelligence?domain=${encodeURIComponent(domain)}`);
  } catch (error) {
    throw new Error(formatBackendError(error, "Could not reach the domain lookup service."));
  }

  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error || "Domain intelligence lookup failed.");
  }

  const findings = [];
  let score = 10;

  if (payload.ageDays !== null && payload.ageDays < 90) {
    score += 24;
    findings.push(`The domain is relatively new (${payload.ageDays} days old).`);
  }

  if (!payload.tls?.reachable) {
    score += 18;
    findings.push("HTTPS certificate details could not be retrieved.");
  }

  if (!payload.dns?.mx?.length) {
    score += 6;
    findings.push("No MX records were found.");
  }

  if (!payload.dns?.a?.length) {
    score += 10;
    findings.push("No A records were found.");
  }

  if (payload.dns?.txt?.some((entry) => entry.toLowerCase().includes("v=spf1 -all"))) {
    findings.push("A strict SPF TXT record is present.");
  }

  return {
    badge: score >= 45 ? "Review Domain" : "Domain Snapshot Ready",
    tone: resultTone(score),
    summary: "Live domain registration, DNS, and TLS details were collected through the backend lookup.",
    action: "Compare the age, registrar, and DNS profile with what you would expect from the brand or organization.",
    findings: findings.length ? findings : ["The domain profile looks fairly typical in this quick lookup."],
    blocks: [
      {
        title: "Registration",
        content: [
          `Domain: ${payload.domain}`,
          `Registrar: ${payload.registrar || "unknown"}`,
          `Created: ${payload.createdAt || "unknown"}`,
          `Age: ${payload.ageDays === null ? "unknown" : `${payload.ageDays} days`}`,
        ],
      },
      {
        title: "DNS records",
        content: [
          `A: ${(payload.dns?.a || []).join(", ") || "none"}`,
          `MX: ${(payload.dns?.mx || []).join(", ") || "none"}`,
          `NS: ${(payload.dns?.ns || []).join(", ") || "none"}`,
        ],
      },
      {
        title: "TLS snapshot",
        content: [
          `Reachable: ${payload.tls?.reachable ? "yes" : "no"}`,
          `Subject: ${payload.tls?.subject || "unknown"}`,
          `Issuer: ${payload.tls?.issuer || "unknown"}`,
          `Valid to: ${payload.tls?.validTo || "unknown"}`,
        ],
      },
    ],
  };
}

export async function checkSecurityHeaders(rawInput) {
  const target = normalizeTargetUrl(rawInput);
  let response;

  try {
    response = await fetch(`/api/security-headers?url=${encodeURIComponent(target)}`);
  } catch (error) {
    throw new Error(formatBackendError(error, "Could not reach the security headers service."));
  }

  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error || "Security header lookup failed.");
  }

  const presentHeaders = Object.entries(payload.headers || {}).filter(([, value]) => value);
  const missingHeaders = payload.missing || [];
  const needsFixes = missingHeaders.length > 3;

  return {
    badge: needsFixes ? "Needs Fixes" : "Looks Good",
    tone: needsFixes ? "medium" : "low",
    summary: needsFixes
      ? "This website is missing a few important browser security headers."
      : "This website returned a better set of browser security headers in this check.",
    action: needsFixes
      ? "Add the missing headers on the server so browsers get stronger protection."
      : "Keep these headers in place and review them after major hosting or CDN changes.",
    findings: [
      `HTTP status: ${payload.status || "unknown"}`,
      `Final URL: ${payload.finalUrl || target}`,
      `Check method: ${payload.method || "GET"}`,
      ...missingHeaders.map((header) => `Missing: ${header}`),
      ...presentHeaders.map(([header]) => `Present: ${header}`),
    ],
    blocks: [
      {
        title: "Key headers",
        content: presentHeaders.length
          ? presentHeaders.map(([header, value]) => `${header}: ${String(value).slice(0, 120)}`)
          : ["No target security headers were returned."],
      },
    ],
  };
}

export function analyzePasswordSafety(password) {
  if (!password) {
    throw new Error("Enter a password or passphrase first.");
  }

  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 33;

  const entropy = password.length * Math.log2(Math.max(pool, 1));
  const findings = [];
  let risk = 10;

  if (password.length < 10) {
    risk += 28;
    findings.push("The password is shorter than 10 characters.");
  }

  if (commonWeakPasswords.has(password.toLowerCase())) {
    risk += 36;
    findings.push("This password matches a very common weak-password pattern.");
  }

  if (/(.)\1{2,}/.test(password)) {
    risk += 12;
    findings.push("Repeated characters were detected.");
  }

  if (/1234|abcd|qwerty|password|admin/i.test(password)) {
    risk += 18;
    findings.push("Common keyboard or word patterns were detected.");
  }

  if (new Set(password).size / password.length < 0.55) {
    risk += 12;
    findings.push("Character variety is limited.");
  }

  if (entropy >= 60) {
    findings.push("Estimated entropy is strong for a browser-side pass.");
  }

  const riskScore = clamp(risk, 0, 100);

  return {
    badge: riskScore >= 55 ? "Not Safe" : riskScore >= 30 ? "Can Be Stronger" : "Looks Strong",
    tone: resultTone(riskScore),
    summary: "This is a privacy-first local password review. The password stays in your browser.",
    action:
      "Use a unique password for every account and store it in a password manager instead of reusing easy patterns.",
    findings,
    blocks: [
      {
        title: "Strength estimate",
        content: [
          `Length: ${password.length}`,
          `Character pool: ${pool}`,
          `Estimated entropy: ${entropy.toFixed(1)} bits`,
        ],
      },
    ],
  };
}

export async function buildHashEncoderResult(input, mode = "encode") {
  if (!input) {
    throw new Error("Enter some text first.");
  }

  if (mode === "decode") {
    const decodeBlocks = [];

    try {
      decodeBlocks.push(`Base64 decode: ${atob(input)}`);
    } catch {
      decodeBlocks.push("Base64 decode: invalid base64 input");
    }

    try {
      decodeBlocks.push(`URL decode: ${decodeURIComponent(input)}`);
    } catch {
      decodeBlocks.push("URL decode: invalid URL-encoded input");
    }

    const hexPairs = input.match(/^[0-9a-fA-F]+$/) && input.length % 2 === 0;
    if (hexPairs) {
      const bytes = input.match(/.{1,2}/g).map((pair) => parseInt(pair, 16));
      decodeBlocks.push(`Hex decode: ${new TextDecoder().decode(new Uint8Array(bytes))}`);
    } else {
      decodeBlocks.push("Hex decode: invalid hex input");
    }

    decodeBlocks.push(`ROT13 decode: ${input.replace(/[A-Za-z]/g, (char) => {
      const base = char <= "Z" ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    })}`);

    return {
      badge: "Decode Results",
      tone: "low",
      summary: "The lab attempted several common decode transformations on your input.",
      findings: ["Review the outputs below and use the one that matches your expected format."],
      blocks: [{ title: "Decoded output", content: decodeBlocks }],
    };
  }

  const bytes = new TextEncoder().encode(input);
  const sha256 = toHex(await crypto.subtle.digest("SHA-256", bytes));
  const md5 = CryptoJS.MD5(input).toString();
  const base64 = base64FromBytes(bytes);
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const rot13 = input.replace(/[A-Za-z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  });

  return {
    badge: "Encoded Results",
    tone: "low",
    summary: "Text hashes and common encoders were generated locally in the browser.",
    findings: ["Use SHA-256 for stronger integrity work. MD5 is included mainly for legacy checks and CTF labs."],
    blocks: [
      {
        title: "Hashes and encoders",
        content: [
          `MD5: ${md5}`,
          `SHA-256: ${sha256}`,
          `Base64: ${base64}`,
          `Hex: ${hex}`,
          `URL Encoded: ${encodeURIComponent(input)}`,
          `ROT13: ${rot13}`,
        ],
      },
    ],
  };
}

export async function buildFileHashResult(file) {
  if (!file) {
    throw new Error("Choose a file first.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const wordArray = wordArrayFromBuffer(arrayBuffer);
  const md5 = CryptoJS.MD5(wordArray).toString();
  const sha1 = toHex(await crypto.subtle.digest("SHA-1", arrayBuffer));
  const sha256 = toHex(await crypto.subtle.digest("SHA-256", arrayBuffer));

  return {
    badge: "File Hashes Ready",
    tone: "low",
    summary: "Hashes were generated locally so you can compare the file against a trusted checksum.",
    findings: ["Verify hashes against the publisher's official checksum page whenever possible."],
    blocks: [
      {
        title: "File details",
        content: [
          `Name: ${file.name}`,
          `Type: ${file.type || "unknown"}`,
          `Size: ${file.size} bytes`,
        ],
      },
      {
        title: "Checksums",
        content: [
          `MD5: ${md5}`,
          `SHA-1: ${sha1}`,
          `SHA-256: ${sha256}`,
        ],
      },
    ],
  };
}

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The image could not be loaded."));
    };
    image.src = objectUrl;
  });

export async function inspectMetadataFile(file) {
  if (!file) {
    throw new Error("Choose a file first.");
  }

  const metadata = await exifr.parse(file, { tiff: true, ifd0: true, exif: true, gps: true, iptc: true, xmp: true }).catch(() => ({}));
  const imageInfo = file.type.startsWith("image/") ? await loadImageFromFile(file) : null;

  try {
    const metadataEntries = Object.entries(metadata || {}).slice(0, 12);
    return {
      badge: metadataEntries.length ? "Metadata Found" : "Minimal Metadata",
      tone: metadataEntries.length ? "medium" : "low",
      summary: "This inspection reads embedded file metadata and image properties in the browser.",
      findings: [
        metadata?.Software ? `Software tag present: ${metadata.Software}` : "No software tag detected.",
        metadata?.DateTimeOriginal ? `Original capture timestamp found: ${metadata.DateTimeOriginal}` : "No original capture timestamp detected.",
        metadata?.latitude || metadata?.longitude ? "GPS-related metadata appears to be present." : "No GPS metadata was detected in the parsed fields.",
      ],
      blocks: [
        {
          title: "File snapshot",
          content: [
            `Name: ${file.name}`,
            `Type: ${file.type || "unknown"}`,
            `Size: ${file.size} bytes`,
            ...(imageInfo ? [`Dimensions: ${imageInfo.image.width} x ${imageInfo.image.height}`] : []),
          ],
        },
        {
          title: "Parsed metadata",
          content: metadataEntries.length
            ? metadataEntries.map(([key, value]) => `${key}: ${typeof value === "object" ? safeJson(value) : String(value)}`)
            : ["No readable EXIF/XMP/IPTC fields were parsed."],
        },
      ],
    };
  } finally {
    if (imageInfo?.objectUrl) {
      URL.revokeObjectURL(imageInfo.objectUrl);
    }
  }
}

export async function extractQrOrLinks(file) {
  if (!file) {
    throw new Error("Choose an image first.");
  }

  const { image, objectUrl } = await loadImageFromFile(file);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    const extractedUrl = code?.data?.match(/https?:\/\/[^\s]+/i)?.[0] || "";

    return {
      badge: code ? "QR / Link Found" : "No QR Detected",
      tone: code ? "low" : "medium",
      summary: code
        ? "A QR code or embedded text payload was decoded from the uploaded image."
        : "No QR code was detected in the uploaded image during this browser-side pass.",
      findings: code
        ? [
            `Decoded payload length: ${code.data.length} characters.`,
            extractedUrl ? "A clickable URL pattern was found in the decoded payload." : "No URL pattern was found in the decoded payload.",
          ]
        : [
            "Try a higher-contrast image, a clearer QR code, or a tightly cropped screenshot.",
            "This tool does not yet perform full OCR on screenshots without a QR code.",
          ],
      blocks: code
        ? [
            {
              title: "Decoded payload",
              content: [code.data],
            },
            {
              title: "Safe extraction",
              content: [`URL: ${extractedUrl || "none detected"}`],
            },
          ]
        : [],
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function generateIncidentReport({ title, tool, severity, summary, findings, impact, recommendations, evidence }) {
  const cleanTitle = title?.trim() || "Untitled Incident";
  const cleanTool = tool?.trim() || "Manual analysis";
  const cleanSeverity = severity?.trim() || "Medium";
  const findingLines = findings
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");

  return `# ${cleanTitle}

Generated: ${new Date().toLocaleString()}
Tool: ${cleanTool}
Severity: ${cleanSeverity}

## Executive Summary
${summary.trim() || "No executive summary provided."}

## Findings
${findingLines || "- No findings provided."}

## Impact
${impact.trim() || "Impact not provided."}

## Recommendations
${recommendations.trim() || "Recommendations not provided."}

## Evidence
${evidence.trim() || "Evidence not provided."}
`;
}

export function analyzeIocs(rawInput) {
  if (!rawInput.trim()) {
    throw new Error("Enter one or more indicators first.");
  }

  const indicators = rawInput
    .split(/[\r\n,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  const classified = indicators.map((value) => {
    if (/^https?:\/\//i.test(value)) return { value, type: "URL" };
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return { value, type: "IPv4" };
    if (/^[0-9a-f]{32}$/i.test(value)) return { value, type: "MD5" };
    if (/^[0-9a-f]{40}$/i.test(value)) return { value, type: "SHA-1" };
    if (/^[0-9a-f]{64}$/i.test(value)) return { value, type: "SHA-256" };
    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return { value, type: "Email" };
    if (/^(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i.test(value)) return { value, type: "Domain" };
    return { value, type: "Unknown" };
  });

  const findings = [];
  const urlCount = classified.filter((item) => item.type === "URL").length;
  const ipCount = classified.filter((item) => item.type === "IPv4").length;
  const hashCount = classified.filter((item) => /SHA|MD5/.test(item.type)).length;

  if (urlCount) findings.push(`${urlCount} URL indicator(s) detected.`);
  if (ipCount) findings.push(`${ipCount} IP address indicator(s) detected.`);
  if (hashCount) findings.push(`${hashCount} hash indicator(s) detected.`);
  if (classified.some((item) => item.type === "Unknown")) findings.push("Some indicators could not be classified automatically.");

  return {
    badge: "IOC Classification Ready",
    tone: "low",
    summary: "Indicators were classified by format so you can pivot them into the right investigation workflow.",
    findings,
    blocks: [
      {
        title: "Indicator list",
        content: classified.map((item) => `${item.type}: ${item.value}`),
      },
    ],
  };
}

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

export function decodeJwtToken(token) {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("Enter a JWT first.");
  }

  const parts = trimmed.split(".");
  if (parts.length < 2) {
    throw new Error("This does not look like a JWT.");
  }

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const now = Math.floor(Date.now() / 1000);
  const findings = [];

  if (payload.exp) {
    findings.push(payload.exp < now ? "The token appears to be expired." : "The token has not expired yet based on the exp claim.");
  }

  if (header.alg && /^none$/i.test(header.alg)) {
    findings.push("The token header uses alg=none, which should be treated very carefully.");
  }

  return {
    badge: "JWT Decoded",
    tone: payload.exp && payload.exp < now ? "medium" : "low",
    summary: "The JWT header and payload were decoded locally. This does not verify the signature.",
    action: "Never trust a decoded JWT alone. Signature verification must happen with the correct secret or public key.",
    findings,
    blocks: [
      {
        title: "Header",
        content: safeJson(header).split("\n"),
      },
      {
        title: "Payload",
        content: safeJson(payload).split("\n"),
      },
    ],
  };
}
