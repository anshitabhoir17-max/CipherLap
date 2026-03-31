import dns from "node:dns/promises";
import tls from "node:tls";

const domainPattern = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;

const getRegistrar = (rdapPayload) =>
  rdapPayload?.entities?.find((entity) => entity.roles?.includes("registrar"))?.vcardArray?.[1]?.find?.(
    (item) => item[0] === "fn",
  )?.[3] || "unknown";

const getCreatedAt = (rdapPayload) =>
  rdapPayload?.events?.find((event) => /registration|created/i.test(event.eventAction))?.eventDate ||
  rdapPayload?.events?.find((event) => /last changed/i.test(event.eventAction))?.eventDate ||
  null;

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

async function resolveDnsSet(domain) {
  const [a, mx, ns, txt] = await Promise.all([
    dns.resolve4(domain).catch(() => []),
    dns.resolveMx(domain).catch(() => []),
    dns.resolveNs(domain).catch(() => []),
    dns.resolveTxt(domain).catch(() => []),
  ]);

  return {
    a,
    mx: mx.map((entry) => `${entry.exchange} (${entry.priority})`),
    ns,
    txt: txt.map((entry) => entry.join("")),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = (searchParams.get("domain") || "").trim().toLowerCase();
    if (!domain || !domainPattern.test(domain)) {
      return Response.json({ error: "Enter a valid domain." }, { status: 400 });
    }

    const [dnsSnapshot, tlsSnapshot, rdapResponse] = await Promise.all([
      resolveDnsSet(domain),
      getTlsSnapshot(domain),
      fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
        signal: AbortSignal.timeout(10000),
      }).catch(() => null),
    ]);

    const rdapPayload = rdapResponse?.ok ? await rdapResponse.json() : null;
    const createdAt = getCreatedAt(rdapPayload);
    const ageDays = createdAt
      ? Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000))
      : null;

    return Response.json({
      domain,
      registrar: getRegistrar(rdapPayload),
      createdAt,
      ageDays,
      status: rdapPayload?.status || [],
      dns: dnsSnapshot,
      tls: tlsSnapshot,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Domain intelligence lookup failed." },
      { status: 500 },
    );
  }
}
