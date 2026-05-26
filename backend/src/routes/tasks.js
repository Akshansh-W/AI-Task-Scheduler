import { Router } from 'express'
import {
  createTask,
  deleteCompletedTask,
  getTasks,
  updateTaskStatus,
} from '../controllers/tasksController.js'

const router = Router()

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', deleteCompletedTask)

export default router
