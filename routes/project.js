import express from 'express'
const router = express.Router()
import {
  getProjects,
  getProjectById,
  deleteProject,
  createProject,
  updateProject,
  createProjectReview,

} from '../controllers/project.js'
import { protect } from '../middleware/auth.js'

router.route('/').get(getProjects).post(protect, createProject)
router.route('/:id/reviews').post(protect, createProjectReview)
router
  .route('/:id')
  .get(getProjectById)
  .delete(protect,deleteProject)
  .put(protect,updateProject)

export default router