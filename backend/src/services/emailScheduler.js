import cron from 'node-cron'
import Task from '../models/Task.js'
import { formatTimeValue } from '../utils/dates.js'
import { sendTaskPortionEmail } from './emailService.js'

let isRunning = false

async function fetchDuePortions() {
  const now = new Date()
  const tasks = await Task.find({
    status: 'remaining',
    emailEnabled: true,
    emailAddress: { $nin: ['', null] },
    parts: {
      $elemMatch: {
        emailStatus: 'pending',
        scheduledAt: { $lte: now },
      },
    },
  }).select('title emailAddress parts')

  return tasks
    .flatMap((task) =>
      task.parts
        .filter((part) => part.emailStatus === 'pending' && part.scheduledAt <= now)
        .map((part) => ({
          taskId: task._id,
          partId: part._id,
          taskTitle: task.title,
          emailAddress: task.emailAddress,
          partTitle: part.title,
          objective: part.objective,
          startTime: part.startTime,
          endTime: part.endTime,
          scheduledAt: part.scheduledAt,
        })),
    )
    .sort((first, second) => first.scheduledAt - second.scheduledAt)
    .slice(0, 20)
}

async function updateEmailStatus(taskId, partId, status, error = '') {
  const fields = {
    'parts.$.emailStatus': status,
    'parts.$.emailError': error,
  }

  if (status === 'sent' || status === 'skipped') {
    fields['parts.$.emailSentAt'] = new Date()
  }

  await Task.updateOne(
    { _id: taskId, 'parts._id': partId },
    { $set: fields },
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
          emailAddress: portion.emailAddress,
          taskTitle: portion.taskTitle,
          portion: {
            title: portion.partTitle,
            objective: portion.objective,
            startTime: formatTimeValue(portion.startTime),
            endTime: formatTimeValue(portion.endTime),
          },
        })

        await updateEmailStatus(portion.taskId, portion.partId, result.status, result.error)
      } catch (error) {
        await updateEmailStatus(portion.taskId, portion.partId, 'failed', error.message)
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
