import nodemailer from 'nodemailer'

let transporter

function getTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  return transporter
}

export async function sendTaskPortionEmail({ emailAddress, taskTitle, portion }) {
  const mailer = getTransporter()

  if (!mailer) {
    return {
      status: 'skipped',
      error: 'Email SMTP credentials are not configured.',
    }
  }

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: emailAddress,
    subject: `Scheduler reminder: ${portion.title}`,
    text: [
      `Task: ${taskTitle}`,
      `Portion: ${portion.title}`,
      `Time: ${portion.startTime} - ${portion.endTime}`,
      '',
      portion.objective,
    ].join('\n'),
  })

  return {
    status: 'sent',
    error: '',
  }
}
