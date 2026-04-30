import cron from 'node-cron'
import { getPool } from '../config/db.js'
import { formatTimeValue } from '../utils/dates.js'
import { sendTaskPortionSms } from './smsService.js'

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
      tasks.mobile_number
    FROM task_parts
    INNER JOIN tasks ON tasks.id = task_parts.task_id
    WHERE tasks.status = 'remaining'
      AND tasks.sms_enabled = 1
      AND tasks.mobile_number IS NOT NULL
      AND tasks.mobile_number <> ''
      AND task_parts.sms_status = 'pending'
      AND task_parts.scheduled_at IS NOT NULL
      AND task_parts.scheduled_at <= NOW()
    ORDER BY task_parts.scheduled_at ASC
    LIMIT 20
  `)

  return rows
}

async function updateSmsStatus(partId, status, error = '') {
  const db = getPool()
  await db.query(
    `
      UPDATE task_parts
      SET sms_status = ?,
          sms_sent_at = CASE WHEN ? IN ('sent', 'skipped') THEN NOW() ELSE sms_sent_at END,
          sms_error = ?
      WHERE id = ?
    `,
    [status, status, error, partId],
  )
}

export async function processDueSmsReminders() {
  if (isRunning) {
    return
  }

  isRunning = true

  try {
    const duePortions = await fetchDuePortions()

    for (const portion of duePortions) {
      try {
        const result = await sendTaskPortionSms({
          mobileNumber: portion.mobile_number,
          taskTitle: portion.task_title,
          portion: {
            title: portion.part_title,
            objective: portion.objective,
            startTime: formatTimeValue(portion.start_time),
            endTime: formatTimeValue(portion.end_time),
          },
        })

        await updateSmsStatus(portion.part_id, result.status, result.error)
      } catch (error) {
        await updateSmsStatus(portion.part_id, 'failed', error.message)
      }
    }
  } finally {
    isRunning = false
  }
}

export function startSmsScheduler() {
  cron.schedule('* * * * *', processDueSmsReminders)
  processDueSmsReminders()
}
