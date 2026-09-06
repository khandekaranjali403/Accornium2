import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { api } from '../services/api';

function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.getServices().then(setServices);
  }, []);

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
