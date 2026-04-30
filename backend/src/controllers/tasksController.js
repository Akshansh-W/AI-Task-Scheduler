import { getPool } from '../config/db.js'
import { generateTaskSchedule } from '../services/geminiService.js'
import {
  combineDateAndTime,
  formatDateValue,
  formatDisplayDate,
  formatTimeValue,
} from '../utils/dates.js'

function mapTaskRows(rows) {
  const taskMap = new Map()

  rows.forEach((row) => {
    if (!taskMap.has(row.id)) {
      taskMap.set(row.id, {
        id: row.id,
        title: row.title,
        owner: row.owner,
        type: row.type,
        priority: row.priority,
        dueDate: formatDateValue(row.due_date),
        dueTime: formatTimeValue(row.due_time),
        duration: String(row.duration),
        focusWindow: row.focus_window,
        reminder: row.reminder,
        taskBrief: row.task_brief,
        dependencies: row.dependencies || '',
        aiInstructions: row.ai_instructions || '',
        autoPlan: Boolean(row.auto_plan),
        mobileNumber: row.mobile_number || '',
        smsEnabled: Boolean(row.sms_enabled),
        emailAddress: row.email_address || '',
        emailEnabled: Boolean(row.email_enabled),
        status: row.status,
        scheduleSummary: row.schedule_summary || '',
        aiSource: row.ai_source,
        createdAt: formatDisplayDate(row.created_at),
        completedAt: formatDisplayDate(row.completed_at),
        parts: [],
      })
    }

    if (row.part_id) {
      taskMap.get(row.id).parts.push({
        id: row.part_id,
        sequence: row.sequence,
        title: row.part_title,
        objective: row.objective,
        startTime: formatTimeValue(row.start_time),
        endTime: formatTimeValue(row.end_time),
        scheduledAt: row.scheduled_at,
        durationMinutes: row.duration_minutes,
        notes: row.notes || '',
        smsStatus: row.sms_status || 'pending',
        smsSentAt: row.sms_sent_at,
        smsError: row.sms_error || '',
        emailStatus: row.email_status || 'pending',
        emailSentAt: row.email_sent_at,
        emailError: row.email_error || '',
      })
    }
  })

  return Array.from(taskMap.values())
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

  if (task.smsEnabled && !String(task.mobileNumber || '').trim()) {
    const error = new Error('mobileNumber is required when SMS reminders are enabled')
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
  const db = getPool()
  const [rows] = await db.query(`
    SELECT
      tasks.*,
      task_parts.id AS part_id,
      task_parts.sequence,
      task_parts.title AS part_title,
      task_parts.objective,
      task_parts.start_time,
      task_parts.end_time,
      task_parts.scheduled_at,
      task_parts.duration_minutes,
      task_parts.notes,
      task_parts.sms_status,
      task_parts.sms_sent_at,
      task_parts.sms_error,
      task_parts.email_status,
      task_parts.email_sent_at,
      task_parts.email_error
    FROM tasks
    LEFT JOIN task_parts ON task_parts.task_id = tasks.id
    ORDER BY tasks.created_at DESC, task_parts.sequence ASC
  `)

  return mapTaskRows(rows)
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
  const db = getPool()
  const connection = await db.getConnection()

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

    await connection.beginTransaction()

    const [result] = await connection.query(
      `
        INSERT INTO tasks (
          title,
          owner,
          type,
          priority,
          due_date,
          due_time,
          duration,
          focus_window,
          reminder,
          task_brief,
          dependencies,
          ai_instructions,
          auto_plan,
          mobile_number,
          sms_enabled,
          email_address,
          email_enabled,
          schedule_summary,
          ai_source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        task.title.trim(),
        task.owner?.trim() || 'Unassigned',
        task.type,
        task.priority,
        task.dueDate,
        task.dueTime || '09:00',
        duration,
        task.focusWindow,
        task.reminder,
        task.taskBrief.trim(),
        task.dependencies || '',
        task.aiInstructions || '',
        task.autoPlan ? 1 : 0,
        task.mobileNumber?.trim() || null,
        task.smsEnabled ? 1 : 0,
        task.emailAddress?.trim() || null,
        task.emailEnabled ? 1 : 0,
        schedule.summary,
        schedule.source,
      ],
    )

    const taskId = result.insertId

    for (const [index, part] of schedule.parts.entries()) {
      await connection.query(
        `
          INSERT INTO task_parts (
            task_id,
            sequence,
            title,
            objective,
            start_time,
            end_time,
            scheduled_at,
            duration_minutes,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          taskId,
          index + 1,
          part.title,
          part.objective,
          part.startTime,
          part.endTime,
          combineDateAndTime(task.dueDate, part.startTime),
          part.durationMinutes,
          part.notes || '',
        ],
      )
    }

    await connection.commit()

    const tasks = await fetchTasks()
    const createdTask = tasks.find((item) => item.id === taskId)

    response.status(201).json({ task: createdTask })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
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

    const db = getPool()
    await db.query(
      `
        UPDATE tasks
        SET status = ?, completed_at = ?
        WHERE id = ?
      `,
      [status, status === 'completed' ? new Date() : null, id],
    )

    const tasks = await fetchTasks()
    const updatedTask = tasks.find((task) => task.id === Number(id))

    response.json({ task: updatedTask })
  } catch (error) {
    next(error)
  }
}
