export function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>khr0me</h3>
          <p>Latency monitoring & network diagnostics</p>
        </div>

        <div className="footer-divider" />

        <div className="footer-section">
          <h4>Links</h4>
          <nav className="footer-nav">
            <a
              href="https://github.com/khr0me"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <span className="link-icon">→</span>
              GitHub
            </a>
            <a
              href="https://khr0me.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <span className="link-icon">→</span>
              Portfolio
            </a>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Built with <span className="heart">♡</span> by{" "}
          <strong>khr0me</strong>
        </p>
        <p className="footer-meta">© 2026 • Latency Lab • Network Monitoring</p>
      </div>
    </footer>
  );
}
