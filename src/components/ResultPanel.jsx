export function ResultPanel({ title, badge, tone = "low", summary, action, findings = [], blocks = [] }) {
  const renderBlockContent = (content) => {
    if (Array.isArray(content)) {
      return content.map((line, index) => (
        <p className="mono" key={`${line}-${index}`}>
          {line}
        </p>
      ));
    }

    return content;
  };

  return (
    <section className="tool-result">
      <h3>{title}</h3>
      {badge ? <span className={`result-badge ${tone}`}>{badge}</span> : null}
      {summary ? <p className="result-summary">{summary}</p> : null}
      {action ? (
        <p className="action-note">
          <strong>Action:</strong> {action}
        </p>
      ) : null}
      {findings.length ? (
        <ul className="result-list">
          {findings.map((finding, index) => (
            <li key={`${finding}-${index}`}>{finding}</li>
          ))}
        </ul>
      ) : null}
      {blocks.length ? (
        <div className="result-grid">
          {blocks.map((block) => (
            <article className="result-block" key={block.title}>
              <p className="result-title">{block.title}</p>
              <div className="result-block-body">{renderBlockContent(block.content)}</div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
