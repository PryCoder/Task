const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ 
      success: true, 
      count: users.length, 
      data: users 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get single user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User role updated successfully',
      data: user 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all projects (Admin only)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('owner', 'name email')
      .populate('teamMembers.user', 'name email');
    
    res.status(200).json({ 
      success: true, 
      count: projects.length, 
      data: projects 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete any project (Admin only)
exports.deleteAnyProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Also delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: 'Project and associated tasks deleted successfully' 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all tasks (Admin only)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.status(200).json({ 
      success: true, 
      count: tasks.length, 
      data: tasks 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete any task (Admin only)
exports.deleteAnyTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get system statistics (Admin only)
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const overdueTasks = await Task.countDocuments({ status: 'Overdue' });
    
    const urgentTasks = await Task.countDocuments({ priority: 'Urgent' });
    const highTasks = await Task.countDocuments({ priority: 'High' });
    const mediumTasks = await Task.countDocuments({ priority: 'Medium' });
    const lowTasks = await Task.countDocuments({ priority: 'Low' });
    
    // Users by role
    const adminUsers = await User.countDocuments({ role: 'Admin' });
    const memberUsers = await User.countDocuments({ role: 'Member' });
    
    // Recent activities (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const newUsers = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    const newProjects = await Project.countDocuments({ createdAt: { $gte: lastWeek } });
    const newTasks = await Task.countDocuments({ createdAt: { $gte: lastWeek } });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          members: memberUsers,
          newThisWeek: newUsers
        },
        projects: {
          total: totalProjects,
          newThisWeek: newProjects
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
          byPriority: {
            urgent: urgentTasks,
            high: highTasks,
            medium: mediumTasks,
            low: lowTasks
          },
          newThisWeek: newTasks,
          completionRate: totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Remove team member from project (Admin only)
exports.removeTeamMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Remove user from teamMembers array
    project.teamMembers = project.teamMembers.filter(
      member => member.user.toString() !== userId
    );
    
    await project.save();
    
    // Reassign tasks from removed user to project owner
    await Task.updateMany(
      { project: projectId, assignedTo: userId },
      { assignedTo: project.owner }
    );
    
    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      data: project
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get system logs overview (Admin only)
exports.getSystemOverview = async (req, res) => {
  try {
    // Get counts by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const projectsByDay = await Project.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const tasksByDay = await Task.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        usersByDay,
        projectsByDay,
        tasksByDay
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};