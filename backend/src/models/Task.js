import mongoose from 'mongoose'

const taskPartSchema = new mongoose.Schema({
  sequence: { type: Number, required: true },
  title: { type: String, required: true },
  objective: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  notes: { type: String, default: '' },
  emailStatus: { type: String, enum: ['pending', 'sent', 'skipped', 'failed'], default: 'pending' },
  emailSentAt: { type: Date, default: null },
  emailError: { type: String, default: '' },
})

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: { type: String, default: 'Unassigned' },
    type: { type: String, required: true },
    priority: { type: String, required: true },
    dueDate: { type: String, required: true },
    dueTime: { type: String, default: '09:00' },
    duration: { type: Number, required: true, min: 1 },
    focusWindow: { type: String, default: 'Flexible' },
    reminder: { type: String, default: 'At start time' },
    taskBrief: { type: String, required: true },
    dependencies: { type: String, default: '' },
    aiInstructions: { type: String, default: '' },
    autoPlan: { type: Boolean, default: false },
    emailAddress: { type: String, default: '' },
    emailEnabled: { type: Boolean, default: false },
    status: { type: String, enum: ['remaining', 'completed'], default: 'remaining' },
    scheduleSummary: { type: String, default: '' },
    aiSource: { type: String, default: 'local-fallback' },
    completedAt: { type: Date, default: null },
    parts: { type: [taskPartSchema], default: [] },
  },
  { timestamps: true },
)

taskSchema.index({ status: 1, 'parts.emailStatus': 1, 'parts.scheduledAt': 1 })

export default mongoose.model('Task', taskSchema)
