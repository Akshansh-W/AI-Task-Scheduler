import AiPreviewPanel from './AiPreviewPanel'
import TaskForm from './TaskForm'
import './SchedulePage.css'

function SchedulePage({
  isFormReady,
  isSaving,
  onReset,
  onSubmit,
  onUpdate,
  preview,
  remainingTasksCount,
  taskForm,
  totalMinutes,
}) {
  return (
    <section className="schedule-page">
      <div className="page-heading">
        <p className="eyebrow">AI Intake</p>
        <h2>Give AI one task and get a portion-by-portion schedule</h2>
        <p>
          Add the task details, deadline, duration, and mobile number. Gemini
          will divide the work into scheduled parts and the backend can send SMS
          reminders when each part starts.
        </p>
      </div>

      <div className="scheduler-layout">
        <TaskForm
          isFormReady={isFormReady}
          isSaving={isSaving}
          onReset={onReset}
          onSubmit={onSubmit}
          onUpdate={onUpdate}
          taskForm={taskForm}
        />

        <AiPreviewPanel
          preview={preview}
          remainingTasksCount={remainingTasksCount}
          totalMinutes={totalMinutes}
        />
      </div>
    </section>
  )
}

export default SchedulePage
