import TaskCard from './TaskCard'
import './TaskColumn.css'

function TaskColumn({ emptyText, onComplete, onReopen, status, tasks, title }) {
  return (
    <section className="task-column">
      <div className="column-title">
        <h3>{title}</h3>
        <span>{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty-state">{emptyText}</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              onComplete={onComplete}
              onReopen={onReopen}
              status={status}
              task={task}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default TaskColumn
