import React from 'react';
import SectionHeading from '../components/SectionHeading';

const values = [
  { title: 'Quality First', desc: 'We write clean, tested, maintainable code and stand behind it.' },
  { title: 'Transparency', desc: 'Clear communication and predictable delivery timelines.' },
  { title: 'Partnership', desc: 'We work as an extension of your team, not just a vendor.' },
];

const team = [
  { name: 'Aarav Sharma', role: 'Founder & CEO' },
  { name: 'Priya Nair', role: 'Head of Engineering' },
  { name: 'Rohan Mehta', role: 'Lead Backend Architect' },
  { name: 'Sara Khan', role: 'Lead Frontend Engineer' },
];

function About() {
  return (
    <div className="container section">
      <SectionHeading
        eyebrow="About Accornium"
        title="A team obsessed with building great software"
        subtitle="Founded by engineers, Accornium exists to help businesses turn ideas into reliable, scalable products."
      />

      <div className="grid grid-3">
        {values.map((v) => (
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
        {team.map((t) => (
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
