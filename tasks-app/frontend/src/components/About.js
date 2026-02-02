import { Link } from "react-router-dom";

const About = ({ translations, language }) => {
  return (
    <div className="about-page">
      <div className="about-content">
        <h2>{translations[language].about}</h2>
        <div className="about-info">
          <h4>{translations[language].version}</h4>
          <p>{translations[language].builtWith}</p>
          <div className="tech-stack">
            <span className="tech-item">React</span>
            <span className="tech-item">Node.js</span>
            <span className="tech-item">PostgreSQL</span>
            <span className="tech-item">AWS</span>
          </div>
        </div>
        <Link to="/" className="btn">{translations[language].goBack}</Link>
      </div>
    </div>
  );
};

export default About;
