import { Link, useParams } from "react-router-dom";
import { careerRoadmaps } from "../data/careerRoadmaps";

export function CareerRolePage() {
  const { roleId } = useParams();
  const role = careerRoadmaps.find((item) => item.id === roleId);

  if (!role) {
    return (
      <section className="tool-result">
        <h3>Role not found</h3>
        <p className="result-summary">Choose a role from the Career Roadmap page.</p>
        <Link className="hero-link" to="/career">
          Back to Career Roadmap
        </Link>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-card tools-hero">
        <div>
          <p className="eyebrow">{role.title}</p>
          <h2>{role.description}</h2>
          <p className="hero-copy">
            Follow this role-specific path from beginner fundamentals to advanced specialization.
          </p>
          <Link className="hero-link" to="/career">
            Back to Career Roadmap
          </Link>
        </div>
      </section>

      <section className="tool-directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Roadmap details</p>
            <h2>What to learn and what to aim for.</h2>
          </div>
          <p className="section-copy">This roadmap shows the core progression for the selected cybersecurity role.</p>
        </div>

        <div className="role-detail-grid">
          {Object.entries(role.roadmap).map(([sectionName, items]) => (
            <article className="role-detail-card" key={sectionName}>
              <p className="tool-tag">{sectionName}</p>
              <h3>{sectionName}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
