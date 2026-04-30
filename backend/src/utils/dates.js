export function combineDateAndTime(date, time) {
  return `${date} ${String(time || '09:00').slice(0, 5)}:00`
}

export function formatDateValue(value) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatTimeValue(value) {
  if (!value) {
    return '09:00'
  }

  return String(value).slice(0, 5)
}

export function formatDisplayDate(value) {
  if (!value) {
    return undefined
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
