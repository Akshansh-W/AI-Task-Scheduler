import 'dotenv/config'
import { app } from './app.js'
import { initializeDatabase } from './config/db.js'
import { startEmailScheduler } from './services/emailScheduler.js'
import { startSmsScheduler } from './services/smsScheduler.js'

const port = process.env.PORT || 5000

async function startServer() {
  try {
    await initializeDatabase()
    startEmailScheduler()
    startSmsScheduler()

    app.listen(port)
  } catch {
    process.exit(1)
  }
}

startServer()
