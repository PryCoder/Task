const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  // Status Request System Fields
  requestedStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', null],
    default: null
  },
  statusRequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  statusRequestedAt: {
    type: Date,
    default: null
  },
  statusRequestMessage: {
    type: String,
    default: ''
  },
  statusRequestStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null
  }
});

// Middleware to check overdue status
taskSchema.pre('save', function(next) {
  if (this.status !== 'Completed' && this.dueDate < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);