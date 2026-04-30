import twilio from 'twilio'

let client

function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null
  }

  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  }

  return client
}

export async function sendTaskPortionSms({ mobileNumber, taskTitle, portion }) {
  const twilioClient = getTwilioClient()
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!twilioClient || !from) {
    return {
      status: 'skipped',
      error: 'Twilio credentials are not configured.',
    }
  }

  await twilioClient.messages.create({
    body: [
      `Scheduler reminder: ${taskTitle}`,
      `${portion.title} (${portion.startTime} - ${portion.endTime})`,
      portion.objective,
    ].join('\n'),
    from,
    to: mobileNumber,
  })

  return {
    status: 'sent',
    error: '',
  }
}
