const Task = ({ task, onDelete, onToggle }) => {
  return (
    <div
      className={`task ${task.important ? "reminder" : ""}`}
      onDoubleClick={() => onToggle(task.uuid)}
    >
      <h3>
        {task.title}{" "}
        <span
          style={{ color: "var(--danger-color)", cursor: "pointer" }}
          onClick={() => onDelete(task.uuid)}
        >
          ✕
        </span>
      </h3>
      <p>{task.day}</p>
    </div>
  );
};

export default Task;
