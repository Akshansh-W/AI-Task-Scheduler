import cron from 'node-cron'
import { getPool } from '../config/db.js'
import { formatTimeValue } from '../utils/dates.js'
import { sendTaskPortionEmail } from './emailService.js'

let isRunning = false

async function fetchDuePortions() {
  const db = getPool()
  const [rows] = await db.query(`
    SELECT
      task_parts.id AS part_id,
      task_parts.title AS part_title,
      task_parts.objective,
      task_parts.start_time,
      task_parts.end_time,
      tasks.title AS task_title,
      tasks.email_address
    FROM task_parts
    INNER JOIN tasks ON tasks.id = task_parts.task_id
    WHERE tasks.status = 'remaining'
      AND tasks.email_enabled = 1
      AND tasks.email_address IS NOT NULL
      AND tasks.email_address <> ''
      AND task_parts.email_status = 'pending'
      AND task_parts.scheduled_at IS NOT NULL
      AND task_parts.scheduled_at <= NOW()
    ORDER BY task_parts.scheduled_at ASC
    LIMIT 20
  `)

  return rows
}

async function updateEmailStatus(partId, status, error = '') {
  const db = getPool()
  await db.query(
    `
      UPDATE task_parts
      SET email_status = ?,
          email_sent_at = CASE WHEN ? IN ('sent', 'skipped') THEN NOW() ELSE email_sent_at END,
          email_error = ?
      WHERE id = ?
    `,
    [status, status, error, partId],
  )
}

export async function processDueEmailReminders() {
  if (isRunning) {
    return
  }

  isRunning = true

  try {
    const duePortions = await fetchDuePortions()

    for (const portion of duePortions) {
      try {
        const result = await sendTaskPortionEmail({
          emailAddress: portion.email_address,
          taskTitle: portion.task_title,
          portion: {
            title: portion.part_title,
            objective: portion.objective,
            startTime: formatTimeValue(portion.start_time),
            endTime: formatTimeValue(portion.end_time),
          },
        })

        await updateEmailStatus(portion.part_id, result.status, result.error)
      } catch (error) {
        await updateEmailStatus(portion.part_id, 'failed', error.message)
      }
    }
  } finally {
    isRunning = false
  }
}

export function startEmailScheduler() {
  cron.schedule('* * * * *', processDueEmailReminders)
  processDueEmailReminders()
}
