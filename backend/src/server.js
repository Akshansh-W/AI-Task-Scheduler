import 'dotenv/config'
import { app } from './app.js'
import { connectMongoDB, disconnectMongoDB } from './config/db.js'
import { startEmailScheduler } from './services/emailScheduler.js'

const port = process.env.PORT || 5000

async function startServer() {
  try {
    await connectMongoDB()
    await new Promise((resolve, reject) => {
      const server = app.listen(port, () => resolve(server))
      server.once('error', reject)
    })

    console.log(`API listening on port ${port}`)
    startEmailScheduler()
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`)
    await disconnectMongoDB().catch(() => {})
    process.exitCode = 1
  }
}

startServer()
