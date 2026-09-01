import { useEffect, useState } from "react";

function getSuggestion({ terminalOutput, lastCommand, goal, environment, target }) {
  const context = `${terminalOutput} ${lastCommand} ${goal}`.toLowerCase();
  const labTarget = target.trim() || "<LAB_TARGET>";

  if (environment === "real-world") {
    return {
      stage: "Authorization check",
      next: "Confirm written permission and define the test scope before running any security command.",
      command: "No command generated",
      why: "A target that is not explicitly authorized should not be scanned or tested.",
      expect: "A documented scope, target, time window, and stop condition.",
      error: "Switch the environment to CTF/Lab or Authorized Assessment after confirming permission.",
    };
  }

  if (/msf|metasploit|show options|use /.test(context)) {
    if (/show options|set rhost|set rhosts/.test(context)) {
      return {
        stage: "Module configuration review",
        next: "Check which required values are still missing, then fill only the lab target value.",
        command: `set RHOSTS ${labTarget}`,
        why: "Metasploit modules need an explicitly selected target. Reviewing and setting scope prevents accidental targeting.",
        expect: "The prompt accepts the value and `show options` marks RHOSTS as set.",
        error: "If RHOSTS is not a valid option, run `show options` and use the exact required option name.",
      };
    }

    return {
      stage: "Metasploit module review",
      next: "Inspect the selected module before configuring or running it.",
      command: "show options",
      why: "This teaches what the module requires and keeps the next action visible and reviewable.",
      expect: "A table of required and optional settings, including the target-related options.",
      error: "If no module is selected, use `search <service-or-version>` in your authorized lab and review the result first.",
    };
  }

  if (/nmap|port scan|ports?|service/.test(context)) {
    return {
      stage: "Service enumeration",
      next: "Review the discovered ports and identify which service deserves further lab research.",
      command: "nmap -sV --reason <LAB_TARGET>",
      why: "Version detection and scan reasons help connect an open port to the service actually responding.",
      expect: "Open ports with service names, versions, and a reason for each result.",
      error: "If the host is unreachable, verify the lab network and target address before changing scan options.",
    };
  }

  return {
    stage: "Initial discovery",
    next: "Check connectivity and enumerate services on the authorized lab target.",
    command: `nmap -sV -Pn ${labTarget}`,
    why: "This gives you a first map of reachable ports and service versions without launching an exploit.",
    expect: "A list of open or filtered ports and the services detected on them.",
    error: "If the scan fails, confirm the target belongs to your lab and that your VM/network adapter is connected.",
  };
}

export function CommandGuidePage({ authEnabled }) {
  const [terminalOutput, setTerminalOutput] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [goal, setGoal] = useState("Enumerate services in my lab");
  const [environment, setEnvironment] = useState("lab");
  const [target, setTarget] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function analyze() {
    setSuggestion(getSuggestion({ terminalOutput, lastCommand, goal, environment, target }));
    setCopied(false);
  }

  async function copyCommand() {
    if (!suggestion || suggestion.command === "No command generated") return;
    await navigator.clipboard.writeText(suggestion.command);
    setCopied(true);
  }

  return (
    <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Guided Learning</p>
              <h2>Command Guide</h2>
              <p>Describe where you are in an authorized lab and get one explained next step. This MVP analyzes text locally and never runs commands.</p>
            </div>
          </div>

          <div className="form-grid-two">
            <div>
              <label className="tool-label" htmlFor="guide-environment">Environment</label>
              <select className="tool-input" id="guide-environment" value={environment} onChange={(event) => setEnvironment(event.target.value)}>
                <option value="lab">CTF / training lab</option>
                <option value="authorized">Authorized assessment</option>
                <option value="real-world">Unknown / not confirmed</option>
              </select>
            </div>
            <div>
              <label className="tool-label" htmlFor="guide-target">Lab target (optional)</label>
              <input className="tool-input" id="guide-target" placeholder="192.168.56.101" value={target} onChange={(event) => setTarget(event.target.value)} />
            </div>
          </div>

          <label className="tool-label" htmlFor="guide-command">Last command</label>
          <input className="tool-input" id="guide-command" placeholder="nmap -sV -Pn 192.168.56.101" value={lastCommand} onChange={(event) => setLastCommand(event.target.value)} />

          <label className="tool-label" htmlFor="guide-goal">What are you trying to learn or do?</label>
          <input className="tool-input" id="guide-goal" placeholder="Enumerate services in my lab" value={goal} onChange={(event) => setGoal(event.target.value)} />

          <label className="tool-label" htmlFor="guide-output">Terminal output or screenshot text</label>
          <textarea className="tool-textarea" id="guide-output" rows="8" placeholder="Paste terminal output here..." value={terminalOutput} onChange={(event) => setTerminalOutput(event.target.value)} />

          <button className="tool-submit" type="button" onClick={analyze}>Analyze next step</button>
          <p className="helper-note">Use only systems you own or have explicit permission to assess. Commands are suggestions for learning, not automatic execution.</p>
        </section>

        {suggestion ? (
          <section className="tool-result">
            <p className="eyebrow">Current stage</p>
            <h3>{suggestion.stage}</h3>
            <p className="result-summary"><strong>Next step:</strong> {suggestion.next}</p>
            <p className="tool-label">Suggested command</p>
            <pre className="code-panel">{suggestion.command}</pre>
            {suggestion.command !== "No command generated" ? <button className="nav-button ghost" type="button" onClick={copyCommand}>{copied ? "Copied" : "Copy command"}</button> : null}
            <div className="result-list">
              <p><strong>Why:</strong> {suggestion.why}</p>
              <p><strong>Expected result:</strong> {suggestion.expect}</p>
              <p><strong>If you get an error:</strong> {suggestion.error}</p>
            </div>
          </section>
        ) : null}
    </div>
  );
}
