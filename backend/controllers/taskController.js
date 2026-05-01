const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.project) {
      query.project = req.query.project;
    }
    
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    if (req.user.role !== 'Admin') {
      query.$or = [{ assignedTo: req.user.id }, { assignedBy: req.user.id }];
    }
    
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('statusRequestedBy', 'name email');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const project = await Project.findById(req.body.project);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const isTeamMember = project.teamMembers.some(member => member.user.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;

    if (req.user.role !== 'Admin' && !isTeamMember && !isOwner) {
      return res.status(401).json({ success: false, error: 'Not authorized to create tasks in this project' });
    }

    // Handle assignedTo - convert email to User ID if needed
    let assignedToId = req.body.assignedTo;
    
    if (assignedToId && typeof assignedToId === 'string') {
      if (assignedToId.includes('@') && assignedToId.includes('.')) {
        const user = await User.findOne({ email: assignedToId });
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found with this email. Please register the user first.' });
        }
        assignedToId = user._id;
      } 
      else if (!assignedToId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID or email format' });
      }
    }

    req.body.assignedBy = req.user.id;
    req.body.assignedTo = assignedToId;
    
    const task = await Task.create(req.body);
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Member: Request status change
exports.requestStatusChange = async (req, res) => {
  try {
    const { requestedStatus, message } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Only assigned person can request status change
    if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Only assigned member can request status change' });
    }

    // Validate requested status
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(requestedStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status requested' });
    }

    // Can't request same status
    if (task.status === requestedStatus) {
      return res.status(400).json({ success: false, error: 'Task already has this status' });
    }

    // If admin,可以直接更改状态
    if (req.user.role === 'Admin') {
      task.status = requestedStatus;
      if (requestedStatus === 'Completed') {
        task.completedAt = Date.now();
      }
      task.requestedStatus = null;
      task.statusRequestStatus = null;
      await task.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Status updated directly by admin',
        data: task 
      });
    }

    // Member: Create status request
    task.requestedStatus = requestedStatus;
    task.statusRequestedBy = req.user.id;
    task.statusRequestedAt = Date.now();
    task.statusRequestMessage = message || `Request to change status to ${requestedStatus}`;
    task.statusRequestStatus = 'pending';

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('statusRequestedBy', 'name email');

    res.status(200).json({ 
      success: true, 
      message: 'Status change request sent to admin',
      data: populatedTask 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Admin: Approve status change
exports.approveStatusChange = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Only admin can approve/reject
    if (req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Only admin can approve status changes' });
    }

    // Check if there's a pending request
    if (!task.requestedStatus || task.statusRequestStatus !== 'pending') {
      return res.status(400).json({ success: false, error: 'No pending status change request' });
    }

    if (action === 'approve') {
      // Approve: Change the status
      task.status = task.requestedStatus;
      if (task.requestedStatus === 'Completed') {
        task.completedAt = Date.now();
      }
      task.statusRequestStatus = 'approved';
      
      await task.save();
      
      return res.status(200).json({ 
        success: true, 
        message: `Status changed to ${task.requestedStatus} approved`,
        data: task 
      });
    } 
    else if (action === 'reject') {
      // Reject: Clear the request
      task.requestedStatus = null;
      task.statusRequestedBy = null;
      task.statusRequestedAt = null;
      task.statusRequestMessage = '';
      task.statusRequestStatus = 'rejected';
      
      await task.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Status change request rejected',
        data: task 
      });
    }
    else {
      return res.status(400).json({ success: false, error: 'Invalid action. Use "approve" or "reject"' });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get tasks with pending requests (Admin only)
exports.getPendingRequests = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      statusRequestStatus: 'pending',
      requestedStatus: { $ne: null }
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('statusRequestedBy', 'name email');

    res.status(200).json({ 
      success: true, 
      count: tasks.length, 
      data: tasks 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Original update function (now deprecated for members)
exports.updateTaskStatus = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Only admin can directly update status
    if (req.user.role !== 'Admin') {
      return res.status(401).json({ 
        success: false, 
        error: 'Members must request status change. Use /request-status endpoint instead.' 
      });
    }

    if (req.body.status === 'Completed') {
      req.body.completedAt = Date.now();
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ assignedTo: req.user.id }, { assignedBy: req.user.id }]
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;

    const tasksByPriority = {
      Low: tasks.filter(t => t.priority === 'Low').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      High: tasks.filter(t => t.priority === 'High').length,
      Urgent: tasks.filter(t => t.priority === 'Urgent').length
    };

    const recentTasks = tasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        tasksByPriority,
        recentTasks,
        completionRate: totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};