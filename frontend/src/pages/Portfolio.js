import React from 'react';
import SectionHeading from '../components/SectionHeading';

const projects = [
  { title: 'FinTrack', category: 'FinTech · Web App', desc: 'A personal finance dashboard built with React and Spring Boot microservices.' },
  { title: 'MedConnect', category: 'HealthTech · Mobile', desc: 'Telemedicine platform connecting patients and doctors in real time.' },
  { title: 'ShopSphere', category: 'E-commerce · Web', desc: 'Headless commerce platform with a Java backend and React storefront.' },
  { title: 'LogiFlow', category: 'Logistics · SaaS', desc: 'Real-time fleet tracking and route optimization dashboard.' },
  { title: 'EduSpark', category: 'EdTech · Web App', desc: 'Learning management system serving 50,000+ students.' },
  { title: 'HireHub', category: 'HR Tech · SaaS', desc: 'Applicant tracking system with automated candidate scoring.' },
];

function Portfolio() {
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
