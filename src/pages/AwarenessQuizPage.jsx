import { useState } from "react";
import { ToolGate } from "../components/ToolGate";
import { awarenessQuizQuestions } from "../lib/advancedTools";

export function AwarenessQuizPage({ authEnabled }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = awarenessQuizQuestions.reduce(
    (total, question) => total + (answers[question.id] === question.answer ? 1 : 0),
    0,
  );

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Awareness Training</p>
              <h2>Cyber Awareness Quiz</h2>
              <p>
                Test basic phishing, password, and safe-link habits with a small interactive
                quiz for your portfolio site.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={() => setSubmitted(true)}>
              Submit Quiz
            </button>
          </div>

          <div className="quiz-grid">
            {awarenessQuizQuestions.map((question, questionIndex) => (
              <article className="quiz-card" key={question.id}>
                <p className="tool-tag">Question {questionIndex + 1}</p>
                <h3>{question.question}</h3>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[question.id] === optionIndex;
                    const correct = submitted && question.answer === optionIndex;
                    const incorrect = submitted && selected && question.answer !== optionIndex;

                    return (
                      <button
                        className={`quiz-option${selected ? " selected" : ""}${correct ? " correct" : ""}${incorrect ? " incorrect" : ""}`}
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        {submitted ? (
          <section className="tool-result">
            <h3>Quiz Result</h3>
            <span className={`result-badge ${score >= 4 ? "low" : score >= 2 ? "medium" : "high"}`}>
              Score {score} / {awarenessQuizQuestions.length}
            </span>
            <p className="result-summary">
              {score === awarenessQuizQuestions.length
                ? "Excellent. Your cyber awareness basics look strong."
                : score >= 3
                  ? "Good work. A little more review will make your awareness even stronger."
                  : "This is a good place to practice safer email, password, and browsing habits."}
            </p>
          </section>
        ) : null}
      </div>
    </ToolGate>
  );
}
