import { Router } from 'express'
import {
  createTask,
  getTasks,
  updateTaskStatus,
} from '../controllers/tasksController.js'

const router = Router()

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id/status', updateTaskStatus)

export default router
