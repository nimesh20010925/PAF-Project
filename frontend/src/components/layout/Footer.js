import { Link } from "react-router-dom"
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/">
              <h2>SkillShare</h2>
            </Link>
            <p>Connect, learn, and share skills with our community.</p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Platform</h3>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/explore">Explore</Link>
                </li>
                <li>
                  <Link to="/learning-plans">Learning Plans</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Community</h3>
              <ul>
                <li>
                  <Link to="/explore">Find Users</Link>
                </li>
                <li>
                  <Link to="/stories">Stories</Link>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Support</h3>
              <ul>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SkillShare Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
