import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import Button from "./Button";

const Header = ({ onAdd, showAdd, translations, language }) => {
  const location = useLocation();

  return (
    <header className="header">
      <h1>{translations[language].taskTracker}</h1>
      {location.pathname === "/" && (
        <Button
          color={showAdd ? "red" : ""}
          text={showAdd ? translations[language].closeAddTask : translations[language].addTask}
          onClick={onAdd}
        />
      )}
    </header>
  );
};

Header.propTypes = {
  onAdd: PropTypes.func,
  showAdd: PropTypes.bool,
  translations: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
};

export default Header;
