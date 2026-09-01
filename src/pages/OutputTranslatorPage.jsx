import { useEffect, useState } from "react";

const examples = {
  nmap: "PORT     STATE SERVICE\n80/tcp   open  http\n443/tcp  open  https",
  network: "Reply from 8.8.8.8: bytes=32 time=24ms TTL=117",
  linux: "default via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 proto kernel",
};

function translate(output) {
  const text = output.toLowerCase();
  if (/80\/tcp\s+open|port 80 open|443\/tcp\s+open/.test(text)) {
    return { type: "Nmap / web service", see: "A web service is reachable on the target.", meaning: "The host accepted a connection on HTTP or HTTPS.", check: "Identify the web server and application, then review it only within your lab scope.", next: "Web enumeration" };
  }
  if (/filtered|timeout|timed out|destination host unreachable/.test(text)) {
    return { type: "Connectivity or firewall result", see: "The path is blocked, filtered, or did not answer in time.", meaning: "A timeout does not prove that a service is absent; a firewall or routing issue may be involved.", check: "Verify the target address, lab network, interface state, and scan scope.", next: "Connectivity troubleshooting" };
  }
  if (/reply from|bytes=.*time=|ttl=/.test(text)) {
    return { type: "Ping output", see: "The target replied to an ICMP echo request.", meaning: "There is a working network path to that host, and the displayed time is round-trip latency.", check: "Compare several replies and then check the required service or port.", next: "Basic network validation" };
  }
  if (/default via|gateway|ip route/.test(text)) {
    return { type: "IP route output", see: "A default route or gateway is present in the routing table.", meaning: "Traffic for destinations outside the local network can use that gateway.", check: "Ping the gateway, then test DNS and an external address separately.", next: "Gateway and DNS validation" };
  }
  if (/state.*up|ethernet adapter|inet \d|ipv4 address/.test(text)) {
    return { type: "Interface / IP configuration", see: "A network interface or IP address was detected.", meaning: "The machine has a network interface configured, but this alone does not prove internet access.", check: "Confirm the default gateway and DNS settings.", next: "Network configuration" };
  }
  return { type: "Unrecognized output", see: "The tool could not confidently classify this output yet.", meaning: "Different tools use different formats, and one line can be ambiguous without surrounding context.", check: "Paste the command and a larger section of output, including errors and headings.", next: "Collect more context" };
}

export function OutputTranslatorPage({ authEnabled }) {
  const [output, setOutput] = useState("");
  const [result, setResult] = useState(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header-copy">
            <p className="eyebrow">Output Translator</p>
            <h2>What Does This Output Mean?</h2>
            <p>Paste nmap, ping, Wireshark, Burp, Metasploit, ipconfig, netstat, or traceroute output and turn it into a beginner-friendly explanation.</p>
          </div>
          <label className="tool-label" htmlFor="output-text">Cybersecurity output</label>
          <textarea className="tool-textarea" id="output-text" rows="10" placeholder="Paste command output here..." value={output} onChange={(event) => setOutput(event.target.value)} />
          <div className="button-row">
            <button className="tool-submit" type="button" onClick={() => setResult(translate(output))}>Explain output</button>
            <button className="nav-button ghost" type="button" onClick={() => setOutput(examples.nmap)}>Try nmap example</button>
            <button className="nav-button ghost" type="button" onClick={() => { setOutput(""); setResult(null); }}>Clear</button>
          </div>
        </section>
        {result ? <section className="tool-result">
          <p className="eyebrow">{result.type}</p>
          <h3>What I see</h3><p>{result.see}</p>
          <h3>What it means</h3><p>{result.meaning}</p>
          <h3>What to check next</h3><p>{result.check}</p>
          <h3>Next stage</h3><p className="result-summary">{result.next}</p>
        </section> : null}
    </div>
  );
}
