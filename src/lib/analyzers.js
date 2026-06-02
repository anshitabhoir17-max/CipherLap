const emailProviderList = new Set([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
]);

const disposableDomains = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "temp-mail.org",
  "yopmail.com",
]);

const roleAliases = new Set([
  "admin",
  "support",
  "sales",
  "contact",
  "careers",
  "security",
  "finance",
  "billing",
  "help",
  "team",
  "info",
]);

const morseMap = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  "$": "...-..-",
  "@": ".--.-.",
};

const reverseMorseMap = Object.fromEntries(
  Object.entries(morseMap).map(([key, value]) => [value, key]),
);

const AI_IMAGE_API_ENDPOINT = "/api/ai-image-detect";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getToneFromScore = (score) => {
  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  return "low";
};

function normalizeUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("Enter a URL first.");
  }

  return /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseEmailDomain(headerValue) {
  const match = headerValue.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);
  return match ? match[1].toLowerCase() : "";
}

function extractLinks(text) {
  return [...new Set(text.match(/(?:https?:\/\/|www\.)[^\s<>"')]+/gi) || [])];
}

export function inspectUrl(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  let url;

  try {
    url = new URL(normalized);
  } catch {
    throw new Error("This does not look like a valid URL.");
  }

  const host = url.hostname.toLowerCase();
  const full = url.href.toLowerCase();
  const flags = [];
  let score = 6;

  if (url.protocol !== "https:") {
    score += 16;
    flags.push("The link is not using HTTPS.");
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    score += 24;
    flags.push("The hostname is a raw IP address instead of a brand domain.");
  }

  if (host.includes("xn--")) {
    score += 20;
    flags.push("Punycode detected, which can be used for look-alike domains.");
  }

  if (rawUrl.includes("@")) {
    score += 14;
    flags.push("The original input includes an @ sign, which is often used for URL obfuscation.");
  }

  const labels = host.split(".");
  if (labels.length > 4) {
    score += 10;
    flags.push("The hostname uses many subdomains, which can hide the real registered domain.");
  }

  const riskyWords = ["login", "verify", "secure", "update", "password", "wallet", "gift", "bonus", "bank", "signin"];
  const matchedWords = riskyWords.filter((word) => full.includes(word));
  if (matchedWords.length) {
    score += Math.min(18, matchedWords.length * 4);
    flags.push(`Suspicious lure words found: ${matchedWords.join(", ")}.`);
  }

  const shorteners = new Set(["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "shorturl.at", "rebrand.ly"]);
  if (shorteners.has(host)) {
    score += 16;
    flags.push("Shortened links hide the final destination.");
  }

  const riskyTlds = new Set(["zip", "mov", "top", "click", "gq", "tk", "work", "support"]);
  const tld = labels.at(-1) || "";
  if (riskyTlds.has(tld)) {
    score += 12;
    flags.push(`The .${tld} TLD appears often in low-trust campaigns.`);
  }

  if (url.port && !["80", "443"].includes(url.port)) {
    score += 8;
    flags.push(`The URL uses a non-standard port (${url.port}).`);
  }

  if (host.length > 38) {
    score += 6;
    flags.push("The hostname is unusually long.");
  }

  const digitCount = [...host].filter((char) => /\d/.test(char)).length;
  if (digitCount / Math.max(host.length, 1) > 0.18) {
    score += 8;
    flags.push("The hostname is heavy on digits, which can be a spoofing signal.");
  }

  const finalScore = clamp(score, 0, 100);
  const badge = finalScore >= 55 ? "High Risk Link" : finalScore >= 30 ? "Review Link" : "Lower Risk Link";

  return {
    score: finalScore,
    badge,
    tone: getToneFromScore(finalScore),
    summary:
      finalScore >= 55
        ? "This URL shows multiple phishing or trust-evasion signals."
        : finalScore >= 30
          ? "This URL is not automatically malicious, but it has warning signs worth checking."
          : "This URL did not show strong automated phishing indicators in this pass.",
    action:
      finalScore >= 55
        ? "Do not open this link on a primary device until you verify the domain independently."
        : "Confirm the destination domain before signing in or downloading anything.",
    findings: flags.length ? flags : ["No major automated red flags were found."],
    blocks: [
      {
        title: "Link details",
        content: [
          `Normalized URL: ${url.href}`,
          `Hostname: ${host}`,
          `Protocol: ${url.protocol.replace(":", "")}`,
        ],
      },
    ],
  };
}

export function analyzePhishingMessage(text) {
  if (!text.trim()) {
    throw new Error("Paste an email body or headers before analyzing.");
  }

  const lower = text.toLowerCase();
  const findings = [];
  let score = 0;

  const urgencyTerms = [
    "urgent",
    "immediately",
    "suspended",
    "verify now",
    "act now",
    "final warning",
    "limited time",
    "expired",
    "unusual activity",
  ];
  const matchedUrgency = urgencyTerms.filter((term) => lower.includes(term));
  if (matchedUrgency.length) {
    score += Math.min(22, matchedUrgency.length * 5);
    findings.push(`Urgency language found: ${matchedUrgency.join(", ")}.`);
  }

  const coercionTerms = [
    "confirm your details",
    "restore access",
    "verify your account",
    "login to continue",
    "click the link below",
    "avoid suspension",
    "confirm your identity",
    "security alert",
    "validate your account",
    "payment failed",
    "account number",
  ];
  const matchedCoercionTerms = coercionTerms.filter((term) => lower.includes(term));
  if (matchedCoercionTerms.length) {
    score += Math.min(24, matchedCoercionTerms.length * 6);
    findings.push(`Pressure or account-recovery language found: ${matchedCoercionTerms.join(", ")}.`);
  }

  const credentialTerms = ["password", "otp", "one-time password", "verification code", "card", "cvv", "banking", "wallet", "login"];
  const matchedCredentialTerms = credentialTerms.filter((term) => lower.includes(term));
  if (matchedCredentialTerms.length) {
    score += Math.min(20, matchedCredentialTerms.length * 4);
    findings.push(`Credential-harvesting language detected: ${matchedCredentialTerms.join(", ")}.`);
  }

  const sensitiveDataTerms = ["account number", "card number", "cvv", "pin", "pan", "aadhaar", "social security", "bank account"];
  const matchedSensitiveData = sensitiveDataTerms.filter((term) => lower.includes(term));
  if (matchedSensitiveData.length) {
    score += Math.min(18, matchedSensitiveData.length * 6);
    findings.push(`The email asks for sensitive personal or banking data: ${matchedSensitiveData.join(", ")}.`);
  }

  if (/\bdear customer\b|\bdear user\b|\bvalued customer\b/i.test(text)) {
    score += 10;
    findings.push("Generic greeting detected instead of a specific recipient name.");
  }

  if (/\battached\b.*\b(zip|html|exe|scr|iso)\b/i.test(text)) {
    score += 16;
    findings.push("The message references a potentially risky attachment type.");
  }

  const headers = {};
  for (const line of text.split(/\r?\n/)) {
    const headerMatch = line.match(/^(from|reply-to|return-path|subject):\s*(.+)$/i);
    if (headerMatch) {
      headers[headerMatch[1].toLowerCase()] = headerMatch[2];
    }
  }

  const fromDomain = headers.from ? parseEmailDomain(headers.from) : "";
  const replyDomain = headers["reply-to"] ? parseEmailDomain(headers["reply-to"]) : "";
  if (fromDomain && replyDomain && fromDomain !== replyDomain) {
    score += 20;
    findings.push(`From and Reply-To domains do not match (${fromDomain} vs ${replyDomain}).`);
  }

  const links = extractLinks(text);
  let worstLinkScore = 0;
  let suspiciousLinkCount = 0;
  const suspiciousLinks = [];
  for (const link of links.slice(0, 8)) {
    try {
      const result = inspectUrl(link);
      worstLinkScore = Math.max(worstLinkScore, result.score);
      if (result.score >= 40) {
        suspiciousLinkCount += 1;
        suspiciousLinks.push(`${result.blocks[0].content[1].replace("Hostname: ", "")} looks risky (${result.score}/100).`);
      }
    } catch {
      suspiciousLinks.push(`A malformed link was found: ${link}.`);
      worstLinkScore = Math.max(worstLinkScore, 40);
      suspiciousLinkCount += 1;
    }
  }

  if (links.length) {
    score += Math.min(18, Math.round(worstLinkScore * 0.22));
    findings.push(`The email contains ${links.length} link(s).`);
  }

  if (/http:\/\//i.test(text)) {
    score += 14;
    findings.push("A non-secure HTTP link was found in the email.");
  }

  if (links.length && (matchedCredentialTerms.length || matchedSensitiveData.length || matchedCoercionTerms.length)) {
    score += 22;
    findings.push("The email combines a clickable link with a request for login or personal details.");
  }

  if (/\b(bank|wallet|invoice|refund|tax|payroll|payment)\b/i.test(text) && links.length) {
    score += 10;
    findings.push("Financial-account language appears together with a link.");
  }

  findings.push(...suspiciousLinks);

  const suspicious =
    score >= 36 ||
    suspiciousLinkCount > 0 ||
    (links.length > 0 && (matchedCredentialTerms.length > 0 || matchedSensitiveData.length > 0));

  return {
    score: clamp(score, 0, 100),
    badge: suspicious ? "Suspicious Email" : "Likely Safe",
    tone: suspicious ? "high" : "low",
    summary: suspicious
      ? "This looks like a suspicious email and should be treated as phishing until proven otherwise."
      : "No major phishing signs were found in the pasted message.",
    action: suspicious
      ? "Do not click the links, do not download attachments, and do not enter passwords or account details."
      : "No strong phishing signals were found here, but still verify the sender before clicking anything important.",
    findings,
    blocks: [
      {
        title: "Quick evidence",
        content: [
          `From: ${headers.from || "not supplied"}`,
          `Reply-To: ${headers["reply-to"] || "not supplied"}`,
          `Links found: ${links.length}`,
          `Suspicious links: ${suspiciousLinkCount}`,
        ],
      },
    ],
  };
}

export function analyzeEmailExposure(email) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    throw new Error("Enter an email address first.");
  }

  const match = trimmed.match(/^([a-z0-9._%+-]+)@([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (!match) {
    throw new Error("Enter a valid email address.");
  }

  const [, localPart, domain] = match;
  const findings = [];
  let score = 0;

  if (roleAliases.has(localPart)) {
    score += 24;
    findings.push("This looks like a shared mailbox name, so it is easier to guess and target.");
  }

  if (emailProviderList.has(domain)) {
    score += 6;
    findings.push("This uses a common public email provider. That is normal, but it is often targeted in fake-login attacks.");
  }

  if (disposableDomains.has(domain)) {
    score += 40;
    findings.push("This domain looks disposable, so it is not a good choice for important long-term accounts.");
  }

  if (localPart.includes("+")) {
    score += 4;
    findings.push("A '+' alias is being used. That is fine, but some websites expose these variations publicly.");
  }

  if (/\d{4,}/.test(localPart)) {
    score += 10;
    findings.push("Long number patterns were found. Try not to use birthdays or easy-to-guess personal details.");
  }

  if (localPart.length < 4) {
    score += 12;
    findings.push("Very short email names are easier to guess.");
  }

  const finalScore = clamp(score, 0, 100);
  const needsAttention = finalScore >= 28;

  return {
    score: finalScore,
    badge: needsAttention ? "Not Safe" : "Looks Safe",
    tone: needsAttention ? "high" : "low",
    summary: needsAttention
      ? "This email has a few clues that make it easier to target or reuse in public signups."
      : "This email looks more okay for normal use in this quick local check.",
    action: needsAttention
      ? "Use a strong unique password, turn on 2-step verification, and avoid using this address as your main public email everywhere."
      : "Keep using a strong unique password and 2-step verification so the account stays protected.",
    findings: findings.length ? findings : ["No obvious email-exposure clues were found in this quick check."],
    blocks: [
      {
        title: "Email details",
        content: [
          `Mailbox: ${localPart}`,
          `Domain: ${domain}`,
          `Provider class: ${emailProviderList.has(domain) ? "public provider" : "custom domain"}`,
        ],
      },
    ],
  };
}

async function loadImageFile(file) {
  if (!file) {
    throw new Error("Choose an image file first.");
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, objectUrl });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The image could not be loaded."));
    };
    img.src = objectUrl;
  });
}

function analyzeImagePixels(imageData, width, height) {
  const histogram = new Uint32Array(32);
  const colorBuckets = new Uint32Array(512);
  const prevRow = new Float32Array(width);
  const data = imageData.data;
  let brightnessTotal = 0;
  let brightnessSquareTotal = 0;
  let edgeHits = 0;
  let alphaHits = 0;
  let roughnessTotal = 0;
  let borderLumTotal = 0;
  let borderLumSquareTotal = 0;
  let borderPixels = 0;
  const borderX = Math.max(2, Math.floor(width * 0.12));
  const borderY = Math.max(2, Math.floor(height * 0.12));

  for (let y = 0; y < height; y += 1) {
    let previousLum = 0;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      brightnessTotal += lum;
      brightnessSquareTotal += lum * lum;
      histogram[Math.min(31, Math.floor(lum / 8))] += 1;
      colorBuckets[((r >> 5) << 6) + ((g >> 5) << 3) + (b >> 5)] += 1;

      if (a < 250) {
        alphaHits += 1;
      }

      const horizontalDiff = x > 0 ? Math.abs(lum - previousLum) : 0;
      const verticalDiff = y > 0 ? Math.abs(lum - prevRow[x]) : 0;

      if (horizontalDiff > 26) {
        edgeHits += 1;
      }
      if (verticalDiff > 26) {
        edgeHits += 1;
      }

      roughnessTotal += horizontalDiff + verticalDiff;

      if (x < borderX || x >= width - borderX || y < borderY || y >= height - borderY) {
        borderLumTotal += lum;
        borderLumSquareTotal += lum * lum;
        borderPixels += 1;
      }

      prevRow[x] = lum;
      previousLum = lum;
    }
  }

  const totalPixels = width * height;
  const averageBrightness = brightnessTotal / totalPixels;
  const variance = Math.max(brightnessSquareTotal / totalPixels - averageBrightness ** 2, 0);
  const contrast = Math.sqrt(variance);
  const edgeDensity = edgeHits / Math.max(totalPixels * 2, 1);
  const alphaRatio = alphaHits / totalPixels;
  const diversity = colorBuckets.filter(Boolean).length / colorBuckets.length;
  const roughness = roughnessTotal / Math.max(totalPixels * 2, 1);
  const borderAverage = borderPixels ? borderLumTotal / borderPixels : 0;
  const borderVariance = borderPixels
    ? Math.max(borderLumSquareTotal / borderPixels - borderAverage ** 2, 0)
    : 0;
  const borderContrast = Math.sqrt(borderVariance);
  const borderUniformity = clamp(1 - borderContrast / 52, 0, 1);

  let entropy = 0;
  for (const count of histogram) {
    if (!count) {
      continue;
    }

    const probability = count / totalPixels;
    entropy -= probability * Math.log2(probability);
  }

  let symmetryDifference = 0;
  let symmetrySamples = 0;
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 90));
  const yStart = Math.floor(height * 0.18);
  const yEnd = Math.max(yStart + 1, Math.floor(height * 0.82));
  const leftStart = Math.floor(width * 0.18);
  const midPoint = Math.floor(width / 2);
  for (let y = yStart; y < yEnd; y += sampleStep) {
    for (let x = leftStart; x < midPoint; x += sampleStep) {
      const mirrorX = width - 1 - x;
      if (mirrorX <= x) {
        continue;
      }

      const leftIndex = (y * width + x) * 4;
      const rightIndex = (y * width + mirrorX) * 4;
      const leftLum = 0.2126 * data[leftIndex] + 0.7152 * data[leftIndex + 1] + 0.0722 * data[leftIndex + 2];
      const rightLum = 0.2126 * data[rightIndex] + 0.7152 * data[rightIndex + 1] + 0.0722 * data[rightIndex + 2];
      symmetryDifference += Math.abs(leftLum - rightLum);
      symmetrySamples += 1;
    }
  }
  const symmetry = symmetrySamples ? clamp(1 - symmetryDifference / (255 * symmetrySamples), 0, 1) : 0;

  let syntheticScore = 18;
  const findings = [];

  if (entropy < 4.25) {
    syntheticScore += 14;
    findings.push("Low tonal entropy may indicate a heavily cleaned, generated, or over-edited image.");
  }
  if (contrast < 42) {
    syntheticScore += 10;
    findings.push("Contrast is unusually smooth, which can happen in synthetic portraits and filtered assets.");
  }
  if (edgeDensity < 0.11) {
    syntheticScore += 10;
    findings.push("Edge density is low, which can point to over-smoothed detail.");
  }
  if (alphaRatio > 0.01) {
    syntheticScore += 12;
    findings.push("Transparency was detected, suggesting export or compositing rather than a raw camera capture.");
  }
  if (diversity < 0.12) {
    syntheticScore += 8;
    findings.push("Color diversity is limited, which can happen with generated art, renders, or compressed graphics.");
  }
  if (roughness < 11.2) {
    syntheticScore += 16;
    findings.push("Fine texture is unusually smooth, which often happens in AI portraits and heavy retouching.");
  }
  if (symmetry > 0.88) {
    syntheticScore += 12;
    findings.push("The center of the image is highly symmetrical, which is common in generated portraits.");
  }
  if (borderUniformity > 0.8) {
    syntheticScore += 8;
    findings.push("The outer background is very even, which can happen in generated portrait backdrops.");
  }

  return {
    score: clamp(syntheticScore, 0, 100),
    findings: findings.length ? findings : ["No strong automated red flags were found in this quick visual pass."],
    contrast,
    edgeDensity,
    entropy,
    alphaRatio,
    diversity,
    roughness,
    borderUniformity,
    symmetry,
  };
}

function analyzeRegion(context, x, y, width, height) {
  return analyzeImagePixels(context.getImageData(x, y, width, height), width, height);
}

function getImageFilenameHints(fileName) {
  const lowerName = fileName.toLowerCase();
  let aiBoost = 0;
  let editBoost = 0;

  const aiKeywords = [
    "chatgpt",
    "midjourney",
    "dalle",
    "dall-e",
    "stable diffusion",
    "stablediffusion",
    "leonardo",
    "ideogram",
    "firefly",
    "ai-image",
    "generated",
  ];
  if (aiKeywords.some((keyword) => lowerName.includes(keyword))) {
    aiBoost += 24;
  }

  const editKeywords = ["edited", "edit", "screenshot", "screen-shot", "collage", "composite"];
  if (editKeywords.some((keyword) => lowerName.includes(keyword))) {
    editBoost += 18;
  }

  return { aiBoost, editBoost };
}

function pickTopNotes(notes, limit = 4) {
  const unique = [];
  for (const note of notes) {
    if (note && !unique.includes(note)) {
      unique.push(note);
    }
  }

  return unique.slice(0, limit);
}

function classifyImageAnalysis(file, dimensions, fullMetrics, centerMetrics, sideMetrics) {
  const cropScores = [centerMetrics.score, ...sideMetrics.map((metric) => metric.score)];
  const maxCropScore = Math.max(...cropScores);
  const minCropScore = Math.min(...cropScores);
  const cropSpread = maxCropScore - minCropScore;
  const filenameHints = getImageFilenameHints(file.name);
  let aiScore = Math.max(fullMetrics.score, centerMetrics.score + 8, maxCropScore) + filenameHints.aiBoost;
  let editScore = filenameHints.editBoost;
  const aiNotes = [];
  const editNotes = [];
  const aspectRatio = dimensions.width / Math.max(dimensions.height, 1);

  if (filenameHints.aiBoost > 0) {
    aiNotes.push("The file name includes an AI-generator keyword.");
  }
  if (filenameHints.editBoost > 0) {
    editNotes.push("The file name suggests the image may be an edit, screenshot, or composite.");
  }
  if (centerMetrics.symmetry > 0.88) {
    aiScore += 12;
    aiNotes.push("The central subject is very symmetrical.");
  }
  if (centerMetrics.roughness < 11.2) {
    aiScore += 14;
    aiNotes.push("Skin and fine detail look unusually smooth.");
  }
  if (centerMetrics.borderUniformity > 0.78) {
    aiScore += 8;
    aiNotes.push("The background is unusually even around the main subject.");
  }
  if (cropSpread > 20) {
    editScore += 16;
    editNotes.push("Different parts of the image behave very differently, which suggests an edited or composite file.");
  }
  if (aspectRatio > 1.45 && cropSpread > 16) {
    editScore += 18;
    editNotes.push("The wide layout plus mixed crop results looks more like a screenshot or collage than a single photo.");
  }
  if (fullMetrics.alphaRatio > 0.01) {
    editScore += 12;
    editNotes.push("Transparency data suggests the file may have been exported from a layered or edited canvas.");
  }
  if (fullMetrics.borderUniformity > 0.84 && aspectRatio > 1.3) {
    editScore += 10;
    editNotes.push("Large uniform outer areas are more common in screenshots and composites than in raw camera photos.");
  }

  aiScore = clamp(aiScore, 0, 100);
  editScore = clamp(editScore, 0, 100);

  const strongCompositeSignal =
    editScore >= 34 &&
    (cropSpread > 18 || aspectRatio > 1.45 || fullMetrics.borderUniformity > 0.84 || filenameHints.editBoost > 0);
  const hardCompositeSignal = cropSpread > 22 && aspectRatio > 1.45;

  if ((hardCompositeSignal && editScore >= 30) || (strongCompositeSignal && editScore >= aiScore - 18)) {
    return {
      badge: "Likely Edited / Composite",
      tone: "medium",
      summary: "This upload looks more like an edited, screenshot-based, or composite image than a single untouched photo.",
      findings: pickTopNotes([...editNotes, ...aiNotes]),
      source: "Browser heuristic fallback",
    };
  }

  if (aiScore >= 58) {
    return {
      badge: "Likely AI-Generated",
      tone: "high",
      summary: "This image shows several strong patterns often seen in AI-generated portraits or heavily synthetic visuals.",
      findings: pickTopNotes([...aiNotes, ...centerMetrics.findings]),
      source: "Browser heuristic fallback",
    };
  }

  return {
    badge: "Likely Natural Photo",
    tone: "low",
    summary: "This image behaves more like a natural photo than an AI-generated or composite image in this browser-side check.",
    findings: pickTopNotes([
      "No strong AI-portrait or composite signals dominated the analysis.",
      "This still cannot prove the person is real. It only means the image looks more natural than synthetic.",
    ]),
    source: "Browser heuristic fallback",
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("The image could not be prepared for API detection."));
    reader.readAsDataURL(file);
  });
}

async function detectImageViaApi(file) {
  const base64 = await fileToBase64(file);
  const response = await fetch(AI_IMAGE_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      base64,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "The AI detection API request failed.");
  }

  return payload;
}

function combineImageDetections(apiDetection, localClassification) {
  if (!apiDetection) {
    return {
      ...localClassification,
      action:
        "Live API detection is not available, so this result came from the browser-only fallback detector.",
    };
  }

  if (localClassification.badge === "Likely Edited / Composite" && apiDetection.score < 0.7) {
    return {
      ...localClassification,
      source: "Sightengine API + local layout analysis",
      findings: pickTopNotes([
        ...localClassification.findings,
        `Sightengine ai_generated score: ${(apiDetection.score * 100).toFixed(1)}%.`,
      ]),
      action:
        "The API did not strongly mark the whole upload as AI-generated, but the layout still looks edited or composite.",
    };
  }

  if (apiDetection.score >= 0.65) {
    return {
      badge: "Likely AI-Generated",
      tone: "high",
      summary: "A real detector API flagged this image as likely AI-generated.",
      findings: pickTopNotes([
        `Sightengine ai_generated score: ${(apiDetection.score * 100).toFixed(1)}%.`,
        "The image was checked through the backend API instead of browser-only heuristics.",
      ]),
      source: "Sightengine API",
      action: "Treat this as AI-generated unless you have trusted source evidence that says otherwise.",
    };
  }

  if (apiDetection.score <= 0.35) {
    return {
      badge: "Likely Natural Photo",
      tone: "low",
      summary: "A real detector API did not find strong evidence that this image was AI-generated.",
      findings: pickTopNotes([
        `Sightengine ai_generated score: ${(apiDetection.score * 100).toFixed(1)}%.`,
        "This still does not prove who the person is. It only means strong AI-generation signals were not detected.",
      ]),
      source: "Sightengine API",
      action: "The image looks natural according to the API, but still verify the account and context around it.",
    };
  }

  return {
    ...localClassification,
    badge: "Review Needed",
    tone: "medium",
    summary: "The detector API was inconclusive, so the final result falls back to the local analysis.",
    findings: pickTopNotes([
      `Sightengine ai_generated score: ${(apiDetection.score * 100).toFixed(1)}%.`,
      ...localClassification.findings,
    ]),
    source: "Sightengine API + browser fallback",
    action: "This image sits in the uncertain range. Check the source account, reverse-search the image, and compare with other photos.",
  };
}

export async function analyzeImageFile(file) {
  const { img, objectUrl } = await loadImageFile(file);

  try {
    const maxDimension = 420;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0, width, height);

    const fullMetrics = analyzeImagePixels(context.getImageData(0, 0, width, height), width, height);
    const centerRect = {
      x: Math.floor(width * 0.2),
      y: Math.floor(height * 0.14),
      width: Math.max(1, Math.floor(width * 0.6)),
      height: Math.max(1, Math.floor(height * 0.72)),
    };
    const centerMetrics = analyzeRegion(context, centerRect.x, centerRect.y, centerRect.width, centerRect.height);
    const thirdWidth = Math.max(1, Math.floor(width / 3));
    const sideMetrics = [
      analyzeRegion(context, 0, 0, thirdWidth, height),
      analyzeRegion(context, Math.max(0, Math.floor((width - thirdWidth) / 2)), 0, thirdWidth, height),
      analyzeRegion(context, Math.max(0, width - thirdWidth), 0, thirdWidth, height),
    ];

    const localClassification = classifyImageAnalysis(
      file,
      { width: img.width, height: img.height },
      fullMetrics,
      centerMetrics,
      sideMetrics,
    );

    let apiDetection = null;
    try {
      apiDetection = await detectImageViaApi(file);
    } catch {
      apiDetection = null;
    }

    const finalDetection = combineImageDetections(apiDetection, localClassification);

    return {
      ...finalDetection,
      blocks: [
        {
          title: "Image details",
          content: [
            `Name: ${file.name}`,
            `Resolution: ${img.width} x ${img.height}`,
            `Type: ${file.type || "unknown"}`,
          ],
        },
        {
          title: "Detection source",
          content: [finalDetection.source],
        },
      ],
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function bitsToText(bits) {
  const bytes = [];
  for (let index = 0; index + 7 < bits.length && bytes.length < 512; index += 8) {
    let byte = 0;
    for (let offset = 0; offset < 8; offset += 1) {
      byte = (byte << 1) | bits[index + offset];
    }

    if (byte === 0 && bytes.length > 0) {
      break;
    }

    bytes.push(byte);
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
}

function printableRatio(text) {
  if (!text) {
    return 0;
  }

  const printableCount = [...text].filter((char) => /[\x20-\x7E\r\n\t]/.test(char)).length;
  return printableCount / text.length;
}

function cleanCandidateText(text) {
  const match = text.match(/[\x20-\x7E\r\n\t]{12,}/);
  return match ? match[0].trim() : "";
}

function extractStegoCandidate(imageData) {
  const strategies = [
    { name: "RGB LSB", channels: [0, 1, 2], bit: 0 },
    { name: "Red LSB", channels: [0], bit: 0 },
    { name: "Green LSB", channels: [1], bit: 0 },
    { name: "Blue LSB", channels: [2], bit: 0 },
    { name: "RGB second bit", channels: [0, 1, 2], bit: 1 },
  ];

  const candidates = strategies.map((strategy) => {
    const bits = [];
    for (let index = 0; index < imageData.data.length; index += 4) {
      for (const channel of strategy.channels) {
        bits.push((imageData.data[index + channel] >> strategy.bit) & 1);
      }
    }

    const text = bitsToText(bits);
    const cleaned = cleanCandidateText(text);
    return {
      strategy: strategy.name,
      cleaned,
      score: printableRatio(cleaned),
    };
  });

  return candidates.sort((left, right) => right.score - left.score)[0];
}

export async function decodeStegoFile(file) {
  const { img, objectUrl } = await loadImageFile(file);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0);

    const best = extractStegoCandidate(context.getImageData(0, 0, img.width, img.height));
    const note =
      file.type === "image/jpeg"
        ? "JPEG compression often destroys LSB payloads, so results may be weak."
        : "PNG-style images are much more likely to preserve hidden LSB data.";

    if (best.cleaned && best.score >= 0.82) {
      return {
        badge: "Candidate Message Found",
        tone: "medium",
        summary: "A readable payload was found using a simple LSB pass. Treat it as a candidate extraction until you validate the context.",
        findings: [note, `Best extraction strategy: ${best.strategy}.`, "Review the output carefully for deliberate padding or decoy text."],
        blocks: [
          {
            title: "Decoded text",
            content: [best.cleaned],
          },
        ],
      };
    }

    return {
      badge: "No Clear Payload",
      tone: "low",
      summary: "No obvious printable hidden text was recovered from a basic browser-side LSB pass.",
      findings: [
        note,
        "Try PNG files, known stego samples, or payloads that were embedded with plain ASCII.",
        "Advanced schemes may use encryption, shuffled channels, metadata, or transform-domain methods.",
      ],
      blocks: [],
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function encodeMorse(text) {
  return text
    .toUpperCase()
    .split(" ")
    .map((word) => [...word].map((char) => morseMap[char] || "?").join(" "))
    .join(" / ");
}

export function decodeMorse(morseText) {
  return morseText
    .trim()
    .split(" / ")
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((symbol) => reverseMorseMap[symbol] || "?")
        .join(""),
    )
    .join(" ");
}
