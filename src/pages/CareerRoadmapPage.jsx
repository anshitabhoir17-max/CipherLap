import { Link } from "react-router-dom";
import { careerRoadmaps } from "../data/careerRoadmaps";

export function CareerRoadmapPage() {
  return (
    <div className="page-stack">
      <section className="hero-card tools-hero">
        <div>
          <p className="eyebrow">Career Roadmap</p>
          <h2>Cybersecurity career paths for learners and aspiring professionals.</h2>
          <p className="hero-copy">
            Choose a role and explore a detailed roadmap from beginner skills to advanced career growth.
          </p>
        </div>
      </section>

      <section className="tool-directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Role gallery</p>
            <h2>Pick a cybersecurity role to explore.</h2>
          </div>
          <p className="section-copy">
            Each card opens a dedicated roadmap page for that job role.
          </p>
        </div>

        <div className="career-grid">
          {careerRoadmaps.map((role) => (
            <article className="career-card" key={role.id}>
              <p className="tool-tag">{role.title.split("(")[0].trim()}</p>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <Link className="hero-link" to={`/career/${role.id}`}>
                View roadmap
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
