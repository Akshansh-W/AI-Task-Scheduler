const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) 
{
  const token = window.localStorage.getItem('chronos-token')
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export async function signUp(credentials) {
  return request('/auth/signup', {
    body: JSON.stringify(credentials),
    method: 'POST',
  })
}

export async function logIn(credentials) {
  return request('/auth/login', {
    body: JSON.stringify(credentials),
    method: 'POST',
  })
}

export async function fetchTasks() {
  const data = await request('/tasks')
  return data.tasks
}

export async function createTask(task) {
  const data = await request('/tasks', {
    body: JSON.stringify(task),
    method: 'POST',
  })

  return data.task
}

export async function updateTaskStatus(taskId, status) {
  const data = await request(`/tasks/${taskId}/status`, {
    body: JSON.stringify({ status }),
    method: 'PATCH',
  })

  return data.task
}
