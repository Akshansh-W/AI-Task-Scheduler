import 'dotenv/config'
import { closePool, initializeDatabase } from '../config/db.js'

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME']

function writeLine(message, stream = process.stdout) {
  stream.write(`${message}\n`)
}

async function checkSetup() {
  const missing = requiredEnv.filter((key) => !process.env[key])

  if (missing.length) {
    writeLine(`Missing optional setup values: ${missing.join(', ')}`)
    writeLine('Defaults will be used where available.')
  }

  if (!process.env.GEMINI_API_KEY) {
    writeLine('GEMINI_API_KEY is not set. The API will use local fallback scheduling.')
  }

  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    writeLine('Twilio SMS credentials are not fully set. SMS reminders will be skipped.')
  }

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    writeLine('Email SMTP credentials are not fully set. Email reminders will be skipped.')
  }

  await initializeDatabase()

  writeLine('Database connection is working and tables are ready.')
  await closePool()
}

checkSetup().catch((error) => {
  writeLine(`Setup check failed: ${error.message}`, process.stderr)
  process.exit(1)
})
