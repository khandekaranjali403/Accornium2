import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { api } from '../services/api';

function About() {
  const [content, setContent] = useState({ values: [], team: [] });

  useEffect(() => {
    api.getAbout().then(setContent);
  }, []);

  return (
    <div className="container section">
      <SectionHeading
        eyebrow="About Accornium"
        title="A team obsessed with building great software"
        subtitle="Founded by engineers, Accornium exists to help businesses turn ideas into reliable, scalable products."
      />

      <div className="grid grid-3">
        {content.values.map((v) => (
          <div className="card" key={v.title}>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-heading" style={{ marginTop: '4rem' }}>
        <h2>Meet the Team</h2>
      </div>
      <div className="grid grid-4">
        {content.team.map((t) => (
          <div className="card team-card" key={t.name}>
            <div className="avatar" aria-hidden="true">{t.name.charAt(0)}</div>
            <h3>{t.name}</h3>
            <p>{t.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
