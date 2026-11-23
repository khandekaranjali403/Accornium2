import React from 'react';
import SectionHeading from '../components/SectionHeading';

const services = [
  {
    title: 'Custom Web Applications',
    desc: 'Responsive, accessible web apps built with React, TypeScript, and modern component architectures.',
  },
  {
    title: 'Backend & API Development',
    desc: 'Secure, scalable REST and GraphQL APIs built with Java Spring Boot, backed by robust data models.',
  },
  {
    title: 'Mobile App Development',
    desc: 'Native and cross-platform mobile apps for iOS and Android with smooth, native-feeling UX.',
  },
  {
    title: 'Cloud & DevOps',
    desc: 'CI/CD pipelines, container orchestration, and infrastructure-as-code on AWS, Azure, or GCP.',
  },
  {
    title: 'UI/UX Design',
    desc: 'Research-driven design systems and interfaces that are as usable as they are beautiful.',
  },
  {
    title: 'Product Consulting',
    desc: 'Technical strategy, architecture reviews, and roadmap planning for growing products.',
  },
];

function Services() {
  return (
    <div className="container section">
      <SectionHeading
        eyebrow="Our Services"
        title="Everything you need to ship great software"
        subtitle="Whether you need a single feature or a full product build, we've got you covered."
      />
      <div className="grid grid-3">
        {services.map((s) => (
          <div className="card" key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
