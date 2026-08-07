import React from 'react';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <h3 className="brand">Accornium</h3>
          <p>Building reliable, scalable software for ambitious businesses.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>hello@accornium.com</p>
          <p>+1 (555) 010-2030</p>
        </div>
        <div>
          <h4>Follow</h4>
          <p>LinkedIn · GitHub · Twitter</p>
        </div>
      </div>
      <p className="copyright">© {year} Accornium. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
