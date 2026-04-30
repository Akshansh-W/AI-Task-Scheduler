import MetricsGrid from './MetricsGrid'
import TaskColumn from './TaskColumn'
import './RecordsPage.css'

function RecordsPage({
  completedTasks,
  isLoading,
  onComplete,
  onFilterChange,
  onReopen,
  remainingTasks,
  statusFilter,
  tasks,
  totalMinutes,
  visibleTasks,
}) {
  const visibleRemainingTasks =
    statusFilter === 'completed'
      ? []
      : visibleTasks.filter((task) => task.status === 'remaining')
  const visibleCompletedTasks =
    statusFilter === 'remaining'
      ? []
      : visibleTasks.filter((task) => task.status === 'completed')

  return (
    <section className="records-page">
      <div className="records-header">
        <div>
          <p className="eyebrow">AI Schedule</p>
          <h2>Tasks split into scheduled portions</h2>
        </div>
        <div className="record-filters" aria-label="Record filters">
          <button
            className={statusFilter === 'all' ? 'active' : ''}
            onClick={() => onFilterChange('all')}
            type="button"
          >
            All
          </button>
          <button
            className={statusFilter === 'remaining' ? 'active' : ''}
            onClick={() => onFilterChange('remaining')}
            type="button"
          >
            Remaining
          </button>
          <button
            className={statusFilter === 'completed' ? 'active' : ''}
            onClick={() => onFilterChange('completed')}
            type="button"
          >
            Completed
          </button>
        </div>
      </div>

      <MetricsGrid
        completedCount={completedTasks.length}
        remainingCount={remainingTasks.length}
        totalCount={tasks.length}
        totalMinutes={totalMinutes}
      />

      <div className="task-board">
        <TaskColumn
          emptyText={
            isLoading ? 'Loading remaining tasks...' : 'No remaining tasks in this view.'
          }
          onComplete={onComplete}
          onReopen={onReopen}
          status="remaining"
          tasks={visibleRemainingTasks}
          title="Remaining Tasks"
        />

        <TaskColumn
          emptyText={
            isLoading ? 'Loading completed tasks...' : 'No completed tasks in this view.'
          }
          onComplete={onComplete}
          onReopen={onReopen}
          status="completed"
          tasks={visibleCompletedTasks}
          title="Completed Tasks"
        />
      </div>
    </section>
  )
}

export default RecordsPage
