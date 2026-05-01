const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllProjects,
  deleteAnyProject,
  getAllTasks,
  deleteAnyTask,
  getSystemStats,
  removeTeamMember,
  getSystemOverview
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and Admin role
router.use(protect);
router.use(authorize('Admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Project management
router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteAnyProject);
router.delete('/projects/:projectId/members/:userId', removeTeamMember);

// Task management
router.get('/tasks', getAllTasks);
router.delete('/tasks/:id', deleteAnyTask);

// System statistics
router.get('/stats', getSystemStats);
router.get('/overview', getSystemOverview);

module.exports = router;