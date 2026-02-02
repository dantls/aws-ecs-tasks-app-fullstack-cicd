import { useState, useEffect } from "react";
import Header from "./components/Header";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import Footer from "./components/Footer";
import About from "./components/About";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";

const App = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pt");

  const translations = {
    en: {
      taskTracker: "Task Application",
      addTask: "Add Task",
      closeAddTask: "Close",
      addTaskForm: "Add Task",
      saveTask: "Save Task",
      noTasks: "No tasks at the moment",
      about: "About",
      important: "Important?",
      task: "Task",
      addDay: "Add Day & Time",
      addTaskPlaceholder: "Add Task",
      addDayPlaceholder: "Add Day & Time",
      pleaseAddTask: "Please add a task",
      version: "Version 1.0.0",
      builtWith: "Task tracker built with React",
      goBack: "Go Back"
    },
    pt: {
      taskTracker: "Aplicação de Tarefas",
      addTask: "Adicionar Tarefa",
      closeAddTask: "Fechar",
      addTaskForm: "Adicionar Tarefa",
      saveTask: "Salvar Tarefa",
      noTasks: "Nenhuma tarefa no momento",
      about: "Sobre",
      important: "Importante?",
      task: "Tarefa",
      addDay: "Adicionar Dia e Hora",
      addTaskPlaceholder: "Adicionar Tarefa",
      addDayPlaceholder: "Adicionar Dia e Hora",
      pleaseAddTask: "Por favor adicione uma tarefa",
      version: "Versão 1.0.1",
      builtWith: "Rastreador de tarefas construído com React",
      goBack: "Voltar"
    }
  };

  // API Base URL - works for both local and production
  const API_URL = process.env.REACT_APP_API_URL || '';

  // Fetch tasks
  const fetchTasks = async () => {
    const endpoint = language === 'en' ? '/api/tasks' : '/api/tarefas';
    const res = await fetch(`${API_URL}${endpoint}`);
    const data = await res.json();
    return data;
  };

  // Fetch task
  const fetchTask = async (id) => {
    const endpoint = language === 'en' ? `/api/tasks/${id}` : `/api/tarefas/${id}`;
    const res = await fetch(`${API_URL}${endpoint}`);
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    const getTasks = async () => {
      const tasksFromServer = await fetchTasks();
      setTasks(tasksFromServer);
    };

    getTasks();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Add Task
  const addTask = async (task) => {
    const endpoint = language === 'en' ? '/api/tasks' : '/api/tarefas';
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(task),
    });

    const data = await res.json();

    setTasks([...tasks, data]);
  };

  // Delete Task
  const deleteTask = async (id) => {
    const endpoint = language === 'en' ? `/api/tasks/${id}` : `/api/tarefas/${id}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
    });
    //We should control the response status to decide if we will change the state or not.
    res.status === 200
      ? setTasks(tasks.filter((task) => task.uuid !== id))
      : alert("Error Deleting This Task");
  };

  // Toggle Reminder
  const toggleReminder = async (id) => {
    const taskToToggle = await fetchTask(id);
    const updTask = { ...taskToToggle, reminder: !taskToToggle.reminder };

    const endpoint = language === 'en' ? `/api/tasks/update_priority/${id}` : `/api/tarefas/update_priority/${id}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(updTask),
    });

    const data = await res.json();

    setTasks(
      tasks.map((task) =>
        task.uuid === id ? { ...task, reminder: data.reminder } : task
      )
    );
  };

  return (
    <Router>
      <div className="App">
        <div className="theme-controls">
          <div className="language-selector">
            <button 
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button 
              className={`lang-btn ${language === 'pt' ? 'active' : ''}`}
              onClick={() => setLanguage('pt')}
            >
              PT
            </button>
          </div>
          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="container">
          <Route
            path="/"
            exact
            render={(props) => (
              <>
                <Header
                  onAdd={() => setShowAddTask(!showAddTask)}
                  showAdd={showAddTask}
                  translations={translations}
                  language={language}
                />
                
                {showAddTask && (
                  <AddTask 
                    onAdd={addTask} 
                    translations={translations} 
                    language={language} 
                  />
                )}
                {tasks.length > 0 ? (
                  <Tasks
                    tasks={tasks}
                    onDelete={deleteTask}
                    onToggle={toggleReminder}
                  />
                ) : (
                  <div className="no-tasks">{translations[language].noTasks}</div>
                )}
              </>
            )}
          />
          <Route 
            path="/about" 
            component={() => (
              <About 
                translations={translations}
                language={language}
              />
            )} 
          />
          <Footer 
            translations={translations}
            language={language}
          />
        </div>
      </div>
    </Router>
  );
};

export default App;
