import { useEffect, useState } from "react";

const steps = [
  ["Check network interface", "Confirm the adapter is enabled and connected.", "ipconfig /all"],
  ["Check IP configuration", "Look for a valid address, subnet mask, and DHCP result.", "ipconfig"],
  ["Check gateway", "Test whether the local router or gateway responds.", "ping <DEFAULT_GATEWAY>"],
  ["Check DNS", "Separate name-resolution problems from connectivity problems.", "nslookup example.com"],
  ["Check routing", "Inspect the route your machine will use for a destination.", "tracert 8.8.8.8"],
  ["Check connectivity", "Test a known permitted destination and compare the result.", "ping 8.8.8.8"],
  ["Packet capture", "Use a capture only when the earlier checks show where the failure occurs.", "Start Wireshark and capture the relevant interface"],
];

export function NetworkTroubleshootingPage({ authEnabled }) {
  const [problem, setProblem] = useState("Internet is not working");
  const [step, setStep] = useState(0);
  const [output, setOutput] = useState("");
  const [review, setReview] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const current = steps[step];

  function inspect() {
    setReview(true);
  }

  return (
    <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header-copy">
            <p className="eyebrow">Troubleshooting Tutor</p>
            <h2>Network Troubleshooting Next Command</h2>
            <p>Work through a clear decision tree. After each command, paste the result to understand the next diagnostic step.</p>
          </div>
          <label className="tool-label" htmlFor="network-problem">What is happening?</label>
          <input className="tool-input" id="network-problem" value={problem} onChange={(event) => setProblem(event.target.value)} />
          <div className="result-list">
            {steps.map(([title], index) => <p key={title} className={index === step ? "result-summary" : ""}>{index + 1}. {title}</p>)}
          </div>
        </section>
        <section className="tool-result">
          <p className="eyebrow">Step {step + 1} of {steps.length}</p>
          <h3>{current[0]}</h3>
          <p>{current[1]}</p>
          <p className="tool-label">Next command</p>
          <pre className="code-panel">{current[2]}</pre>
          <label className="tool-label" htmlFor="network-output">Paste the result after running it</label>
          <textarea className="tool-textarea compact" id="network-output" rows="5" placeholder="Paste output here..." value={output} onChange={(event) => setOutput(event.target.value)} />
          <div className="button-row">
            <button className="tool-submit" type="button" onClick={inspect}>Interpret result</button>
            <button className="nav-button ghost" type="button" disabled={step === 0} onClick={() => { setStep(Math.max(0, step - 1)); setReview(false); }}>Previous</button>
            <button className="nav-button ghost" type="button" disabled={step === steps.length - 1} onClick={() => { setStep(Math.min(steps.length - 1, step + 1)); setReview(false); }}>Next step</button>
          </div>
          {review ? <p className="helper-note">Output received. Compare it with the explanation above. If the result shows a failure at this layer, fix that layer before continuing; otherwise move to the next step.</p> : null}
          <p className="helper-note">Commands are for your own machine or an authorized network. This tool does not execute them.</p>
        </section>
    </div>
  );
}
