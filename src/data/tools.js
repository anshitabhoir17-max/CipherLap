export const tools = [
  {
    title: "Email Header Analyzer",
    path: "/tools/email-headers",
    tag: "Mail Routing",
    group: "email",
    symbol: "@",
    description: "Check SPF, DKIM, DMARC, reply-to mismatch, sender spoofing clues, mail route details, and phishing signals.",
  },
  {
    title: "Email Safety Check",
    path: "/tools/pwned-email",
    tag: "Email Safety",
    group: "email",
    symbol: "ID",
    description: "Review whether an email looks safer for everyday use or needs attention before you share it widely.",
  },
  {
    title: "Domain Intelligence",
    path: "/tools/domain-intelligence",
    tag: "Infrastructure",
    group: "web",
    symbol: "//",
    description: "Show domain age, DNS records, TLS details, registrar info, and other quick website background checks.",
  },

  {
    title: "AI Image Detector",
    path: "/tools/ai-image",
    tag: "Visual Forensics",
    group: "image",
    symbol: "AI",
    description: "Classify likely AI-generated, edited/composite, or natural-looking images with a cleaner result summary.",
  },
  {
    title: "Hidden Message Decoder",
    path: "/tools/hidden-message",
    tag: "Image Analysis",
    group: "image",
    symbol: "<>",
    description: "Run a browser-side least-significant-bit extraction pass against uploaded image files.",
  },
  {
    title: "Metadata Inspector",
    path: "/tools/metadata-inspector",
    tag: "Metadata Review",
    group: "image",
    symbol: "EX",
    description: "Show EXIF, file type, image dimensions, software used, timestamps, and hidden metadata.",
  },
  {
    title: "QR / Link Extractor",
    path: "/tools/qr-extractor",
    tag: "Image Extraction",
    group: "image",
    symbol: "QR",
    description: "Upload a QR or screenshot-style image and extract QR payloads and safe URL-like content.",
  },
  {
    title: "Password Safety Check",
    path: "/tools/password-safety",
    tag: "Identity Safety",
    group: "identity",
    symbol: "PW",
    description: "Run a privacy-first local password check with simple safe, not safe, and improve-it feedback.",
  },
  {
    title: "Hash / Encoder Lab",
    path: "/tools/hash-lab",
    tag: "Hashing + Encoding",
    group: "utility",
    symbol: "#",
    description: "MD5, SHA-256, Base64, URL encode/decode, Hex, and ROT13 for cyber labs and CTF workflows.",
  },
  {
    title: "File Hash Verifier",
    path: "/tools/file-hash",
    tag: "Integrity Check",
    group: "utility",
    symbol: "CHK",
    description: "Upload a file and generate hashes locally so users can verify integrity.",
  },

  {
    title: "Incident Report Generator",
    path: "/tools/incident-report",
    tag: "Reporting",
    group: "reporting",
    symbol: "RPT",
    description: "Turn investigation notes into a neat incident report that can be copied or saved locally.",
  },
  {
    title: "Case Notes Dashboard",
    path: "/tools/case-notes",
    tag: "Case Tracking",
    group: "reporting",
    symbol: "LOG",
    description: "Save local case notes in browser storage for demos, reports, and investigation walkthroughs.",
  },
  {
    title: "Cyber Awareness Quiz",
    path: "/tools/awareness-quiz",
    tag: "Awareness Training",
    group: "learning",
    symbol: "?",
    description: "A short awareness quiz that adds interactivity and a more complete student-project feel.",
  },
  {
    title: "OWASP Top 10 mini-checker",
    path: "/tools/owasp-top10",
    tag: "VAPT",
    group: "utility",
    symbol: "OW",
    description: "Quick checklist and examples for OWASP Top 10 categories to guide testing and learning.",
  },
  {
    title: "XSS / SQLi payload tester",
    path: "/tools/payload-tester",
    tag: "Exploitation",
    group: "utility",
    symbol: "<>",
    description: "A safe, local playground to test XSS and SQL injection payload transformations and encodings.",
  },
  {
    title: "Network scanner concept",
    path: "/tools/network-scanner",
    tag: "Recon",
    group: "utility",
    symbol: "NW",
    description: "Client-side network scanning concept for local lab environments (informational only).",
  },
];

export function getToolByPath(pathname) {
  return tools.find((tool) => tool.path === pathname) || null;
}

export function getSuggestedTools(currentPath, limit = 3) {
  const currentTool = getToolByPath(currentPath);
  const remainingTools = tools.filter((tool) => tool.path !== currentPath);

  if (!currentTool) {
    return remainingTools.slice(0, limit);
  }

  const sameGroup = remainingTools.filter((tool) => tool.group === currentTool.group);
  const otherGroups = remainingTools.filter((tool) => tool.group !== currentTool.group);
  return [...sameGroup, ...otherGroups].slice(0, limit);
}
