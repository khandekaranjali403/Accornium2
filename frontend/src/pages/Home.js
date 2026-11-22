import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { api } from '../services/api';

function Home() {
  const [content, setContent] = useState({ stats: [], services: [] });

  useEffect(() => {
    api.getHome().then(setContent);
  }, []);

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
        {content.stats.map((s) => (
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
          {content.services.map((s) => (
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
