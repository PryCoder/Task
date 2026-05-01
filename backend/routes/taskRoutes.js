const express = require('express');
const {
  getTasks,
  createTask,
  updateTaskStatus,
  getDashboardStats,
  requestStatusChange,
  approveStatusChange,
  getPendingRequests
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.route('/')
  .get(getTasks)
  .post(createTask);


router.put('/:id/status', updateTaskStatus); // Admin only direct update
router.post('/:id/request-status', requestStatusChange); // Member request
router.put('/:id/approve-status', authorize('Admin'), approveStatusChange); // Admin approve
router.get('/pending-requests', authorize('Admin'), getPendingRequests); // Admin view pending
module.exports = router;