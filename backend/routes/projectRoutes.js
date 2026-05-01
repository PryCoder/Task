const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  addTeamMember
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin'), updateProject);

router.put('/:id/addmember', authorize('Admin'), addTeamMember);

module.exports = router;