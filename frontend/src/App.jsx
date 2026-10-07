import { useEffect, useMemo, useState } from "react";
import AuthPage from "./components/AuthPage";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import RecordsPage from "./components/RecordsPage";
import SchedulePage from "./components/SchedulePage";
import { emptyTask } from "./data/tasks";
import { createTask, fetchTasks, logIn, signUp, updateTaskStatus } from "./services/api";
import { buildAiSuggestion, formatSchedule } from "./utils/schedule";
import "./App.css";

function App() {
  const [session, setSession] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem("chronos-session"));
      return savedSession?.token && savedSession?.user ? savedSession : null;
    } catch {
      return null;
    }
  });
  const [entryPage, setEntryPage] = useState("home");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activePage, setActivePage] = useState("form");
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!session) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const loadedTasks = await fetchTasks();

        if (isMounted) {
          setTasks(loadedTasks);
          setMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setMessage(`Backend unavailable: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const remainingTasks = tasks.filter((task) => task.status === "remaining");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const totalMinutes = remainingTasks.reduce((sum, task) => sum + Number(task.duration || 0), 0);

  const preview = useMemo(
    () => ({
      schedule: taskForm.dueDate ? formatSchedule(taskForm) : "Awaiting date",
      effort: `${taskForm.duration || 0} min`,
      priority: `${taskForm.priority} priority`,
      focus: `${taskForm.focusWindow} window`,
      suggestion: taskForm.title ? buildAiSuggestion(taskForm) : "AI will score the task after the title and due date are added.",
    }),
    [taskForm],
  );

  const visibleTasks = statusFilter === "remaining" ? remainingTasks : statusFilter === "completed" ? completedTasks : tasks;

  const isFormReady = Boolean(
    taskForm.title.trim() &&
    taskForm.taskBrief.trim() &&
    taskForm.dueDate &&
    taskForm.dueTime &&
    (!taskForm.emailEnabled || taskForm.emailAddress.trim()),
  );

  async function authenticate(credentials) {
    setIsAuthenticating(true);
    setAuthError("");

    try {
      const result = entryPage === "signup" ? await signUp(credentials) : await logIn(credentials);
      const nextSession = { user: result.user, token: result.token };
      localStorage.setItem("chronos-token", result.token);
      localStorage.setItem("chronos-session", JSON.stringify(nextSession));
      setSession(nextSession);
      setActivePage("form");
      setMessage(`Welcome${result.user.name ? `, ${result.user.name}` : " back"}!`);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  }

  function openAuth(mode) {
    setAuthError("");
    setEntryPage(mode);
  }

  function logOut() {
    localStorage.removeItem("chronos-token");
    localStorage.removeItem("chronos-session");
    setSession(null);
    setTaskForm(emptyTask);
    setActivePage("form");
    setMessage("");
    setEntryPage("home");
  }

  function updateForm(event) {
    const { name, type, value, checked } = event.target;
    setTaskForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setTaskForm(emptyTask);
  }

  async function submitTask(event) {
    event.preventDefault();

    if (!isFormReady) {
      return;
    }

    setIsSaving(true);
    setMessage("Building your schedule...");

    try {
      const task = await createTask({
        ...taskForm,
        owner: taskForm.owner || "Unassigned",
        dueTime: taskForm.dueTime || "09:00",
      });

      setTasks((current) => [task, ...current]);
      setTaskForm(emptyTask);
      setActivePage("records");
      setStatusFilter("remaining");
      setMessage(
        task.aiSource === "gemini"
          ? "Task split by Gemini. Email reminders are queued for each scheduled portion."
          : "Task saved with a local fallback schedule. Add a Gemini API key to use AI scheduling.",
      );
    } catch (error) {
      setMessage(`Could not create task: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function markComplete(taskId) {
    try {
      const updatedTask = await updateTaskStatus(taskId, "completed");
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
      setMessage("");
    } catch (error) {
      setMessage(`Could not update task: ${error.message}`);
    }
  }

  async function reopenTask(taskId) {
    try {
      const updatedTask = await updateTaskStatus(taskId, "remaining");
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
      setMessage("");
    } catch (error) {
      setMessage(`Could not update task: ${error.message}`);
    }
  }

  if (!session) {
    if (entryPage === "home") {
      return <HomePage onGetStarted={() => openAuth("signup")} onLogIn={() => openAuth("login")} />;
    }

    return <AuthPage error={authError} isSubmitting={isAuthenticating} mode={entryPage} onModeChange={openAuth} onSubmit={authenticate} />;
  }

  return (
    <main className="app-shell">
      <Header activePage={activePage} onLogOut={logOut} onPageChange={setActivePage} user={session.user} />

      {message ? <p className="app-message">{message}</p> : null}

      {activePage === "form" ? (
        <SchedulePage
          isFormReady={isFormReady}
          isSaving={isSaving}
          onReset={resetForm}
          onSubmit={submitTask}
          onUpdate={updateForm}
          preview={preview}
          remainingTasksCount={remainingTasks.length}
          taskForm={taskForm}
          totalMinutes={totalMinutes}
        />
      ) : (
        <RecordsPage
          completedTasks={completedTasks}
          onComplete={markComplete}
          onFilterChange={setStatusFilter}
          onReopen={reopenTask}
          isLoading={isLoading}
          remainingTasks={remainingTasks}
          statusFilter={statusFilter}
          tasks={tasks}
          totalMinutes={totalMinutes}
          visibleTasks={visibleTasks}
        />
      )}
    </main>
  );
}

export default App;
