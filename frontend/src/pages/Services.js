import React from 'react';
import { Link } from 'react-router-dom';
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

const pages = [
  { title: 'Home', to: '/', desc: 'Get an overview of Accornium, our work, and the results we deliver.' },
  { title: 'About', to: '/about', desc: 'Meet our team and learn about the values behind our engineering.' },
  { title: 'Services', to: '/services', desc: 'Explore the capabilities we bring to your next product.' },
  { title: 'Portfolio', to: '/portfolio', desc: 'Browse examples of products and platforms we have built.' },
  { title: 'Contact', to: '/contact', desc: 'Tell us about your project and start a conversation with our team.' },
  { title: 'Log in', to: '/login', desc: 'Sign in to your account to continue where you left off.' },
  { title: 'Sign up', to: '/signup', desc: 'Create an account to get started with Accornium.' },
  { title: 'Verify Email', to: '/verify-email', desc: 'Confirm your email address with the verification code sent to your inbox.' },
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
