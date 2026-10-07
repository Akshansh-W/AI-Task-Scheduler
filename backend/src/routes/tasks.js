import { Router } from 'express'
import {
  createTask,
  deleteCompletedTask,
  getTasks,
  updateTaskStatus,
} from '../controllers/tasksController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)
router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', deleteCompletedTask)

export default router
