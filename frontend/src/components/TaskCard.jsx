import { buildAiSuggestion, formatSchedule } from "../utils/schedule";
import "./TaskCard.css";

function TaskCard({ onComplete, onReopen, status, task }) {
  return (
    <article className="task-card">
      <div className="task-card-head">
        <div>
          <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
          <h4>{task.title}</h4>
          <p className="task-deadline">{formatSchedule(task)}</p>
        </div>
        <span className={`status-pill ${task.status}`}>{task.status}</span>
      </div>

      <p>{task.taskBrief}</p>

      <dl className="task-meta">
        <div>
          <dt>Total duration</dt>
          <dd>{task.duration} min</dd>
        </div>
        <div>
          <dt>Email reminders</dt>
          <dd>{task.emailEnabled ? task.emailAddress : "Off"}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{task.owner}</dd>
        </div>
      </dl>

      <div className="ai-note">
        <span>AI</span>
        <p>{task.scheduleSummary || buildAiSuggestion(task)}</p>
      </div>

      {task.parts?.length ? (
        <div className="task-portions">
          <div className="portions-title">
            <span>AI generated portions</span>
            <strong>{task.parts.length}</strong>
          </div>
          <ol>
            {task.parts.map((part) => (
              <li key={part.id || part.sequence}>
                <div>
                  <strong>{part.title}</strong>
                  <span>
                    {part.startTime} - {part.endTime} | {part.durationMinutes} min
                  </span>
                </div>
                <p>{part.objective}</p>
                {part.notes ? <small>{part.notes}</small> : null}
                {part.emailStatus ? <small className={`email-state ${part.emailStatus}`}>Email: {part.emailStatus}</small> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="task-actions">
        {status === "remaining" ? (
          <button type="button" onClick={() => onComplete(task.id)}>
            Mark Complete
          </button>
        ) : (
          <button type="button" onClick={() => onReopen(task.id)}>
            Reopen
          </button>
        )}
      </div>
    </article>
  );
}

export default TaskCard;
