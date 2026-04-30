import './TaskForm.css'

function TaskForm({ isFormReady, isSaving, onReset, onSubmit, onUpdate, taskForm }) {
  return (
    <form className="task-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label className="field wide">
          <span>Task title</span>
          <input
            name="title"
            onChange={onUpdate}
            placeholder="Finish machine learning assignment"
            type="text"
            value={taskForm.title}
          />
        </label>

        <label className="field">
          <span>Your name or owner</span>
          <input
            name="owner"
            onChange={onUpdate}
            placeholder="Who is doing this?"
            type="text"
            value={taskForm.owner}
          />
        </label>

        <label className="field">
          <span>Task type</span>
          <select name="type" onChange={onUpdate} value={taskForm.type}>
            <option>Deep Work</option>
            <option>Planning</option>
            <option>Communication</option>
            <option>Reporting</option>
            <option>Research</option>
            <option>Review</option>
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select name="priority" onChange={onUpdate} value={taskForm.priority}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>

        <label className="field">
          <span>Deadline date</span>
          <input
            name="dueDate"
            onChange={onUpdate}
            type="date"
            value={taskForm.dueDate}
          />
        </label>

        <label className="field">
          <span>Deadline time</span>
          <input
            name="dueTime"
            onChange={onUpdate}
            type="time"
            value={taskForm.dueTime}
          />
        </label>

        <label className="field">
          <span>Total work duration</span>
          <select name="duration" onChange={onUpdate} value={taskForm.duration}>
            <option value="25">25 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </label>

        <label className="field">
          <span>Email for notifications</span>
          <input
            name="emailAddress"
            onChange={onUpdate}
            placeholder="you@example.com"
            type="email"
            value={taskForm.emailAddress}
          />
        </label>

        <label className="field">
          <span>Mobile number for SMS</span>
          <input
            name="mobileNumber"
            onChange={onUpdate}
            placeholder="+919876543210"
            type="tel"
            value={taskForm.mobileNumber}
          />
        </label>

        <label className="field">
          <span>Focus window</span>
          <select
            name="focusWindow"
            onChange={onUpdate}
            value={taskForm.focusWindow}
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Flexible</option>
          </select>
        </label>

        <label className="field">
          <span>Reminder</span>
          <select name="reminder" onChange={onUpdate} value={taskForm.reminder}>
            <option>At start time</option>
            <option>15 minutes before</option>
            <option>30 minutes before</option>
            <option>1 hour before</option>
          </select>
        </label>

        <label className="field wide">
          <span>Task details</span>
          <textarea
            name="taskBrief"
            onChange={onUpdate}
            placeholder="Describe what needs to be completed, important steps, and the final outcome."
            rows="4"
            value={taskForm.taskBrief}
          />
        </label>

        <label className="field">
          <span>Dependencies</span>
          <textarea
            name="dependencies"
            onChange={onUpdate}
            placeholder="Files, approvals, meetings, blockers"
            rows="3"
            value={taskForm.dependencies}
          />
        </label>

        <label className="field">
          <span>AI instructions</span>
          <textarea
            name="aiInstructions"
            onChange={onUpdate}
            placeholder="Tell AI how to split, order, or pace the task"
            rows="3"
            value={taskForm.aiInstructions}
          />
        </label>
      </div>

      <div className="form-footer">
        <div className="notification-toggles">
          <label className="toggle-row">
            <input
              checked={taskForm.emailEnabled}
              name="emailEnabled"
              onChange={onUpdate}
              type="checkbox"
            />
            <span className="toggle-control"></span>
            <span>Email each portion</span>
          </label>

          <label className="toggle-row">
            <input
              checked={taskForm.smsEnabled}
              name="smsEnabled"
              onChange={onUpdate}
              type="checkbox"
            />
            <span className="toggle-control"></span>
            <span>SMS each portion</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="secondary-button" onClick={onReset} type="button">
            Clear
          </button>
          <button
            className="primary-button"
            disabled={!isFormReady || isSaving}
            type="submit"
          >
            {isSaving ? 'Scheduling...' : 'Add Task'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default TaskForm
