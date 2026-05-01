const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers.user', 'name email role')
      .populate('owner', 'name email role');
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    const members = [
      { ...project.owner.toObject(), role: 'Owner' },
      ...project.teamMembers.map(m => ({ ...m.user.toObject(), role: m.role }))
    ];
    
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};