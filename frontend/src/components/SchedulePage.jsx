import AiPreviewPanel from "./AiPreviewPanel";
import TaskForm from "./TaskForm";
import "./SchedulePage.css";

function SchedulePage({ isFormReady, isSaving, onReset, onSubmit, onUpdate, preview, remainingTasksCount, taskForm, totalMinutes }) {
  return (
    <section className="schedule-page">
      <div className="page-heading">
        <p className="eyebrow">Task planning</p>
        <h2>Turn one task into a portion-by-portion schedule</h2>
        <p>
          Add the task details, deadline, and duration. Gemini creates the plan when a key is configured; otherwise, the local planner creates
          scheduled portions. Email reminders are optional.
        </p>
      </div>

      <div className="scheduler-layout">
        <TaskForm isFormReady={isFormReady} isSaving={isSaving} onReset={onReset} onSubmit={onSubmit} onUpdate={onUpdate} taskForm={taskForm} />

        <AiPreviewPanel preview={preview} remainingTasksCount={remainingTasksCount} totalMinutes={totalMinutes} />
      </div>
    </section>
  );
}

export default SchedulePage;
