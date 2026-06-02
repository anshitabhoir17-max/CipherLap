export const OWASP_TOP10 = [
  {
    id: "a1",
    title: "A01: Broken Access Control",
    summary: "Missing or incorrect access restrictions allow attackers to access unauthorized resources.",
    description:
      "Broken access control lets attackers view or modify data they should not be able to reach, such as unauthorized profiles, admin pages, or hidden functionality.",
    details: [
      "Use server-side authorization checks for every request.",
      "Avoid client-side access control alone.",
      "Protect object references with authorization rules, not just obscurity.",
      "Deny by default and approve only specific roles or sessions.",
    ],
    videoUrl: "https://www.youtube.com/embed/2Nl65lfYdOw",
    officialLink: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
  },
  {
    id: "a2",
    title: "A02: Cryptographic Failures",
    summary: "Weak or missing encryption exposes sensitive data in transit and at rest.",
    description:
      "Cryptographic failures happen when data is stored or transmitted insecurely, keys are mismanaged, or outdated algorithms are used.",
    details: [
      "Encrypt sensitive data with modern ciphers like AES-GCM.",
      "Use TLS for all browser and API traffic.",
      "Never store passwords in plaintext.",
      "Rotate keys and protect secrets with a secure vault.",
    ],
    videoUrl: "https://www.youtube.com/embed/fkFJL0kDNsw",
    officialLink: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/",
  },
  {
    id: "a3",
    title: "A03: Injection",
    summary: "Unsanitized input is interpreted as code or commands by the application.",
    description:
      "Injection flaws such as SQL, NoSQL, OS, and command injection occur when untrusted input is built into queries or commands without validation.",
    details: [
      "Use parameterized queries or prepared statements.",
      "Validate and sanitize all user input.",
      "Avoid concatenating strings into SQL or shell commands.",
      "Use least privilege for database accounts.",
    ],
    videoUrl: "https://www.youtube.com/embed/fCqFqMmXPL4",
    officialLink: "https://owasp.org/Top10/A03_2021-Injection/",
  },
  {
    id: "a4",
    title: "A04: Insecure Design",
    summary: "Lack of secure design and threat modeling creates systemic vulnerabilities.",
    description:
      "Insecure design means the application architecture does not consider security requirements, giving attackers more opportunities to compromise it.",
    details: [
      "Perform threat modeling during design.",
      "Define security requirements before coding.",
      "Use secure design patterns and avoid risky defaults.",
      "Review designs with security experts regularly.",
    ],
    videoUrl: "https://www.youtube.com/embed/l-n4RXiIYKo",
    officialLink: "https://owasp.org/Top10/A04_2021-Insecure_Design/",
  },
  {
    id: "a5",
    title: "A05: Security Misconfiguration",
    summary: "Incorrect settings, default accounts, or exposed services leave the app wide open.",
    description:
      "Security misconfiguration can include debug modes enabled in production, default passwords, or insecure cloud storage settings.",
    details: [
      "Harden all servers and applications by default.",
      "Disable and remove unused features and services.",
      "Use secure defaults and environment-specific configs.",
      "Automate configuration checks and scans.",
    ],
    videoUrl: "https://www.youtube.com/embed/3qcJPgHxB34",
    officialLink: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
  },
  {
    id: "a6",
    title: "A06: Vulnerable and Outdated Components",
    summary: "Using old or vulnerable libraries can expose known security flaws.",
    description:
      "Applications often fail because third-party components are not patched, leaving them vulnerable to known exploits.",
    details: [
      "Maintain an inventory of all dependencies.",
      "Update libraries and frameworks regularly.",
      "Use automated vulnerability scanners.",
      "Remove unused components from the stack.",
    ],
    videoUrl: "https://www.youtube.com/embed/m5nW0aLdvn0",
    officialLink: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/",
  },
  {
    id: "a7",
    title: "A07: Identification and Authentication Failures",
    summary: "Weak authentication allows attackers to impersonate users or hijack sessions.",
    description:
      "This category includes broken login, session management, and missing MFA protections that let attackers take over accounts.",
    details: [
      "Use strong password policies and MFA.",
      "Protect session cookies with secure flags.",
      "Invalidate sessions on logout.",
      "Avoid predictable account recovery flows.",
    ],
    videoUrl: "https://www.youtube.com/embed/H0Z4yWNi7-0",
    officialLink: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
  },
  {
    id: "a8",
    title: "A08: Software and Data Integrity Failures",
    summary: "Untrusted updates or data can be corrupted or manipulated before reaching the app.",
    description:
      "Integrity failures occur when code, dependencies, or serialized data can be tampered with and the system does not detect it.",
    details: [
      "Use signed updates and packages.",
      "Avoid insecure deserialization.",
      "Validate data integrity before execution.",
      "Protect build and deployment pipelines.",
    ],
    videoUrl: "https://www.youtube.com/embed/5XBqEpnFGPU",
    officialLink: "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/",
  },
  {
    id: "a9",
    title: "A09: Security Logging and Monitoring Failures",
    summary: "Insufficient logging and alerts let attackers operate undetected for longer.",
    description:
      "Without proper logging and monitoring, breaches may go unnoticed and incident response becomes much slower.",
    details: [
      "Log security-relevant events centrally.",
      "Monitor suspicious activity and alert on anomalies.",
      "Keep logs long enough to investigate incidents.",
      "Ensure logs cannot be modified by attackers.",
    ],
    videoUrl: "https://www.youtube.com/embed/TYQPb9F0D9A",
    officialLink: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/",
  },
  {
    id: "a10",
    title: "A10: Server-Side Request Forgery (SSRF)",
    summary: "The server is tricked into fetching attacker-controlled URLs from internal networks.",
    description:
      "SSRF allows attackers to make requests from the server to internal or external systems that the attacker cannot directly access.",
    details: [
      "Whitelist allowed destinations.",
      "Block internal network IP ranges.",
      "Validate and parse URLs carefully.",
      "Never trust user-controlled redirect or fetch targets.",
    ],
    videoUrl: "https://www.youtube.com/embed/4mT2-hTx98s",
    officialLink: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery/",
  },
];

export function getOwaspItem(id) {
  return OWASP_TOP10.find((item) => item.id === id) || null;
}

export function getOwaspTotals() {
  return OWASP_TOP10.length;
}
