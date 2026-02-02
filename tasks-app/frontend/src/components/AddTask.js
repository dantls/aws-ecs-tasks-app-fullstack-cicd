import { useState } from "react";

const AddTask = ({ onAdd, translations, language }) => {
  const [text, setText] = useState("");
  const [day, setDay] = useState("");
  const [reminder, setReminder] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text) {
      alert(translations[language].pleaseAddTask);
      return;
    }

    onAdd({ title: text, day: day, important: reminder });

    setText("");
    setDay("");
    setReminder(false);
  };

  return (
    <form className="add-form" onSubmit={onSubmit}>
      <div className="form-control">
        <label>{translations[language].task}</label>
        <input
          type="text"
          placeholder={translations[language].addTaskPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label>{translations[language].addDay}</label>
        <input
          type="text"
          placeholder={translations[language].addDayPlaceholder}
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </div>
      <div className="form-control form-control-check">
        <label>{translations[language].important}</label>
        <input
          type="checkbox"
          checked={reminder}
          value={reminder}
          onChange={(e) => setReminder(e.currentTarget.checked)}
        />
      </div>

      <input type="submit" value={translations[language].saveTask} className="btn btn-block" />
    </form>
  );
};

export default AddTask;
