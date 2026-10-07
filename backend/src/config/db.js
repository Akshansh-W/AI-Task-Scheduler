import mongoose from 'mongoose'

export async function connectMongoDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required')
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
}

export async function disconnectMongoDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}