import { Link, useLocation } from "react-router-dom";

const Footer = ({ translations, language }) => {
  const location = useLocation();

  return (
    <footer>
      {location.pathname !== "/about" && (
        <Link to="/about">{translations[language].about}</Link>
      )}
    </footer>
  );
};

export default Footer;
