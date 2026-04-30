import './MetricsGrid.css'

function MetricsGrid({ completedCount, remainingCount, totalCount, totalMinutes }) {
  return (
    <div className="metrics-grid">
      <div>
        <span>Total tasks</span>
        <strong>{totalCount}</strong>
      </div>
      <div>
        <span>Remaining</span>
        <strong>{remainingCount}</strong>
      </div>
      <div>
        <span>Completed</span>
        <strong>{completedCount}</strong>
      </div>
      <div>
        <span>Open workload</span>
        <strong>{totalMinutes}m</strong>
      </div>
    </div>
  )
}

export default MetricsGrid
