export function formatSchedule(task) {
  if (!task.dueDate) {
    return 'Date pending'
  }

  const date = new Date(`${task.dueDate}T${task.dueTime || '09:00'}`)

  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function buildAiSuggestion(task) {
  const focus = task.focusWindow.toLowerCase()
  const priority = task.priority.toLowerCase()
  const split = Number(task.duration) > 75 ? ' Split it into two focus blocks.' : ''

  return `Best fit: ${focus} work block with ${priority} queue priority.${split}`
}
