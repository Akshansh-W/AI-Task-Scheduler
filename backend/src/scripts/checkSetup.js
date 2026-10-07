import 'dotenv/config'
import { connectMongoDB, disconnectMongoDB } from '../config/db.js'

const requiredEnv = ['MONGO_URI', 'JWT_SECRET']

function writeLine(message, stream = process.stdout) {
  stream.write(`${message}\n`)
}

async function checkSetup() {
  if (!process.env.GEMINI_API_KEY) {
    writeLine('GEMINI_API_KEY is not set. The API will use local fallback scheduling.')
  }

  const missing = requiredEnv.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(', ')}`)
  }

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    writeLine('Email SMTP credentials are not fully set. Email reminders will be skipped.')
  }

  await connectMongoDB()
  writeLine('MongoDB connection is working.')
}

checkSetup()
  .catch((error) => {
  writeLine(`Setup check failed: ${error.message}`, process.stderr)
    process.exitCode = 1
  })
  .finally(disconnectMongoDB)
