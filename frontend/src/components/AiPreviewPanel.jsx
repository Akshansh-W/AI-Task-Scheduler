import "./AiPreviewPanel.css";

function AiPreviewPanel({ preview, remainingTasksCount, totalMinutes }) {
  return (
    <aside className="ai-panel" aria-label="Schedule preview">
      <p className="eyebrow">Plan preview</p>
      <h3>{preview.schedule}</h3>
      <p className="preview-copy">{preview.suggestion}</p>

      <div className="preview-stack">
        <div>
          <span>Effort</span>
          <strong>{preview.effort}</strong>
        </div>
        <div>
          <span>Queue</span>
          <strong>{preview.priority}</strong>
        </div>
        <div>
          <span>Window</span>
          <strong>{preview.focus}</strong>
        </div>
      </div>

      <div className="capacity-box">
        <span>Remaining workload</span>
        <strong>{totalMinutes} min</strong>
        <p>{remainingTasksCount} active tasks before this entry.</p>
      </div>
    </aside>
  );
}

export default AiPreviewPanel;
