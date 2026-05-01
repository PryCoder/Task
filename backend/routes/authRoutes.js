const express = require('express');
const { register, login, getMe, getUsers, getProjectMembers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/', getUsers);
router.get('/project/:id/members', getProjectMembers);
module.exports = router;