import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';

const stats = [
  { value: '120+', label: 'Projects Delivered' },
  { value: '60+', label: 'Happy Clients' },
  { value: '8', label: 'Years of Experience' },
  { value: '25+', label: 'Engineers' },
];

const services = [
  { title: 'Web Development', desc: 'Responsive, high-performance web apps built with React and modern tooling.' },
  { title: 'Backend Engineering', desc: 'Robust APIs and microservices powered by Java Spring Boot.' },
  { title: 'Mobile Apps', desc: 'Cross-platform mobile experiences for iOS and Android.' },
  { title: 'Cloud & DevOps', desc: 'CI/CD pipelines, containerization, and cloud infrastructure on AWS/Azure/GCP.' },
];

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="eyebrow">Software Development Company</span>
            <h1>We build software that moves your business forward.</h1>
            <p>
              Accornium partners with startups and enterprises to design, build,
              and scale custom web, mobile, and cloud solutions using React and
              Java Spring Boot.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/contact">Start a Project</Link>
              <Link className="btn btn-outline" to="/portfolio">View Our Work</Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card card-1">React + Spring Boot</div>
            <div className="hero-card card-2">Cloud Native</div>
            <div className="hero-card card-3">Scalable APIs</div>
          </div>
        </div>
      </section>

      <section className="stats container">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <h3>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      <section className="container section">
        <SectionHeading
          eyebrow="What We Do"
          title="Full-stack expertise, end to end"
          subtitle="From product strategy to deployment, our team handles the full software lifecycle."
        />
        <div className="grid grid-4">
          {services.map((s) => (
            <div className="card" key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta container">
        <div className="cta-box">
          <h2>Have a project in mind?</h2>
          <p>Let's talk about how Accornium can help you build it.</p>
          <Link className="btn btn-primary" to="/contact">Get in Touch</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
