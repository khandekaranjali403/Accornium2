import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { api } from '../services/api';

function Portfolio() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  return (
    <div className="container section">
      <SectionHeading
        eyebrow="Our Work"
        title="Projects we're proud of"
        subtitle="A selection of products we've designed, built, and shipped for our clients."
      />
      <div className="grid grid-3">
        {projects.map((p) => (
          <div className="card project-card" key={p.title}>
            <div className="project-thumb" aria-hidden="true" />
            <span className="tag">{p.category}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Portfolio;
