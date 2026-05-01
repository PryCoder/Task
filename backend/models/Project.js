const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Admin', 'Member'],
      default: 'Member'
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Project', projectSchema);