import mongoose from 'mongoose'
import Task from '../models/Task.js'
import { generateTaskSchedule } from '../services/geminiService.js'
import {
  combineDateAndTime,
  formatDateValue,
  formatDisplayDate,
  formatTimeValue,
} from '../utils/dates.js'

function mapTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    owner: task.owner,
    type: task.type,
    priority: task.priority,
    dueDate: formatDateValue(task.dueDate),
    dueTime: formatTimeValue(task.dueTime),
    duration: String(task.duration),
    focusWindow: task.focusWindow,
    reminder: task.reminder,
    taskBrief: task.taskBrief,
    dependencies: task.dependencies || '',
    aiInstructions: task.aiInstructions || '',
    autoPlan: Boolean(task.autoPlan),
    emailAddress: task.emailAddress || '',
    emailEnabled: Boolean(task.emailEnabled),
    status: task.status,
    scheduleSummary: task.scheduleSummary || '',
    aiSource: task.aiSource,
    createdAt: formatDisplayDate(task.createdAt),
    completedAt: formatDisplayDate(task.completedAt),
    parts: task.parts
      .slice()
      .sort((first, second) => first.sequence - second.sequence)
      .map((part) => ({
        id: part._id.toString(),
        sequence: part.sequence,
        title: part.title,
        objective: part.objective,
        startTime: formatTimeValue(part.startTime),
        endTime: formatTimeValue(part.endTime),
        scheduledAt: part.scheduledAt,
        durationMinutes: part.durationMinutes,
        notes: part.notes || '',
        emailStatus: part.emailStatus || 'pending',
        emailSentAt: part.emailSentAt,
        emailError: part.emailError || '',
      })),
  }
}

function invalidIdError() {
  const error = new Error('Task not found')
  error.statusCode = 404
  return error
}

function validateTaskInput(task) {
  const requiredFields = ['title', 'type', 'priority', 'dueDate', 'taskBrief']
  const missingField = requiredFields.find((field) => !String(task[field] || '').trim())

  if (missingField) {
    const error = new Error(`${missingField} is required`)
    error.statusCode = 400
    throw error
  }

  const duration = Number(task.duration || 0)

  if (!Number.isFinite(duration) || duration <= 0) {
    const error = new Error('duration must be a positive number')
    error.statusCode = 400
    throw error
  }

  if (task.emailEnabled && !String(task.emailAddress || '').trim()) {
    const error = new Error('emailAddress is required when email reminders are enabled')
    error.statusCode = 400
    throw error
  }
}

async function fetchTasks() {
  const tasks = await Task.find().sort({ createdAt: -1 })
  return tasks.map(mapTask)
}

export async function getTasks(_request, response, next) {
  try {
    const tasks = await fetchTasks()
    response.json({ tasks })
  } catch (error) {
    next(error)
  }
}

export async function createTask(request, response, next) {
  try {
    const task = request.body
    validateTaskInput(task)

    const duration = Number(task.duration)
    const schedule = await generateTaskSchedule({
      ...task,
      duration,
      owner: task.owner || 'Unassigned',
      dueTime: task.dueTime || '09:00',
    })

    const createdTask = await Task.create({
      title: task.title.trim(),
      owner: task.owner?.trim() || 'Unassigned',
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime || '09:00',
      duration,
      focusWindow: task.focusWindow,
      reminder: task.reminder,
      taskBrief: task.taskBrief.trim(),
      dependencies: task.dependencies || '',
      aiInstructions: task.aiInstructions || '',
      autoPlan: Boolean(task.autoPlan),
      emailAddress: task.emailAddress?.trim() || '',
      emailEnabled: Boolean(task.emailEnabled),
      scheduleSummary: schedule.summary,
      aiSource: schedule.source,
      parts: schedule.parts.map((part, index) => ({
        sequence: index + 1,
        title: part.title,
        objective: part.objective,
        startTime: part.startTime,
        endTime: part.endTime,
        scheduledAt: new Date(combineDateAndTime(task.dueDate, part.startTime)),
        durationMinutes: part.durationMinutes,
        notes: part.notes || '',
      })),
    })

    response.status(201).json({ task: mapTask(createdTask) })
  } catch (error) {
    next(error)
  }
}

export async function updateTaskStatus(request, response, next) {
  try {
    const { id } = request.params
    const { status } = request.body

    if (!['remaining', 'completed'].includes(status)) {
      const error = new Error('status must be remaining or completed')
      error.statusCode = 400
      throw error
    }

    if (!mongoose.isValidObjectId(id)) {
      throw invalidIdError()
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status, completedAt: status === 'completed' ? new Date() : null },
      { new: true, runValidators: true },
    )

    if (!updatedTask) {
      throw invalidIdError()
    }

    response.json({ task: mapTask(updatedTask) })
  } catch (error) {
    next(error)
  }
}

export async function deleteCompletedTask(request, response, next) {
  try {
    const { id } = request.params

    if (!mongoose.isValidObjectId(id)) {
      throw invalidIdError()
    }

    const task = await Task.findById(id)
    if (!task) {
      throw invalidIdError()
    }

    if (task.status !== 'completed') {
      const error = new Error('Only completed tasks can be deleted')
      error.statusCode = 400
      throw error
    }

    await task.deleteOne()
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
