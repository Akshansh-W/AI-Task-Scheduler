import { GoogleGenAI, Type } from '@google/genai'

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toTime(totalMinutes) {
  const minutesInDay = 24 * 60
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function buildFallbackSchedule(task) {
  const duration = Number(task.duration)
  const partsCount = duration >= 90 ? 3 : duration >= 50 ? 2 : 1
  const baseDuration = Math.floor(duration / partsCount)
  const start = toMinutes(task.dueTime || '09:00') - duration

  const parts = Array.from({ length: partsCount }, (_item, index) => {
    const durationMinutes =
      index === partsCount - 1 ? duration - baseDuration * index : baseDuration
    const partStart = start + baseDuration * index
    const partEnd = partStart + durationMinutes

    return {
      title:
        partsCount === 1
          ? 'Complete task'
          : `Part ${index + 1}: ${index === 0 ? 'Prepare' : index === 1 ? 'Execute' : 'Review'}`,
      objective:
        index === 0
          ? `Set up context and begin ${task.title}.`
          : index === partsCount - 1
            ? 'Review the outcome and finish the task cleanly.'
            : `Work through the core execution for ${task.title}.`,
      startTime: toTime(partStart),
      endTime: toTime(partEnd),
      durationMinutes,
      notes: task.dependencies
        ? `Account for dependency: ${task.dependencies}.`
        : 'Generated locally because Gemini is not available.',
    }
  })

  return {
    source: 'local-fallback',
    summary: `Split into ${parts.length} scheduled portion${parts.length === 1 ? '' : 's'} around the requested due time.`,
    parts,
  }
}

function normalizeSchedule(schedule, task) {
  const fallback = buildFallbackSchedule(task)
  const parts = Array.isArray(schedule?.parts) ? schedule.parts : fallback.parts

  return {
    source: 'gemini',
    summary: schedule?.summary || fallback.summary,
    parts: parts
      .map((part, index) => ({
        title: part.title || `Part ${index + 1}`,
        objective: part.objective || `Work on ${task.title}.`,
        startTime: part.startTime || fallback.parts[index]?.startTime || task.dueTime,
        endTime: part.endTime || fallback.parts[index]?.endTime || task.dueTime,
        durationMinutes: Number(part.durationMinutes || fallback.parts[index]?.durationMinutes || 15),
        notes: part.notes || '',
      }))
      .filter((part) => part.durationMinutes > 0),
  }
}

export async function generateTaskSchedule(task) {
  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackSchedule(task)
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: `
        Create a practical scheduler plan for this task.
        Split the total duration into useful, chronological work portions.
        Each portion must have a clear action title, objective, start time, end time, and duration.
        Keep every part within the total task duration and before the due date/time when possible.
        Return local 24-hour HH:MM times for the scheduled task portions.

        Task:
        ${JSON.stringify(task, null, 2)}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'One sentence explaining the overall plan.',
            },
            parts: {
              type: Type.ARRAY,
              description: 'The ordered schedule portions for the task.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  startTime: {
                    type: Type.STRING,
                    description: '24-hour HH:MM local time.',
                  },
                  endTime: {
                    type: Type.STRING,
                    description: '24-hour HH:MM local time.',
                  },
                  durationMinutes: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                },
                required: [
                  'title',
                  'objective',
                  'startTime',
                  'endTime',
                  'durationMinutes',
                  'notes',
                ],
                propertyOrdering: [
                  'title',
                  'objective',
                  'startTime',
                  'endTime',
                  'durationMinutes',
                  'notes',
                ],
              },
            },
          },
          required: ['summary', 'parts'],
          propertyOrdering: ['summary', 'parts'],
        },
      },
    })

    return normalizeSchedule(JSON.parse(response.text), task)
  } catch {
    return buildFallbackSchedule(task)
  }
}
