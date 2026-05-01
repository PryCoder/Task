const Project = require('../models/Project');
const User = require('../models/User');

exports.getProjects = async (req, res) => {
  try {
    let query;
    
    if (req.user.role === 'Admin') {
      query = Project.find({ $or: [{ owner: req.user.id }, { 'teamMembers.user': req.user.id }] });
    } else {
      query = Project.find({ 'teamMembers.user': req.user.id });
    }
    
    const projects = await query.populate('owner', 'name email').populate('teamMembers.user', 'name email');
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('teamMembers.user', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const isTeamMember = project.teamMembers.some(member => member.user._id.toString() === req.user.id);
    const isOwner = project.owner._id.toString() === req.user.id;

    if (req.user.role !== 'Admin' && !isTeamMember && !isOwner) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const alreadyMember = project.teamMembers.some(member => member.user.toString() === user._id.toString());
    if (alreadyMember) {
      return res.status(400).json({ success: false, error: 'User is already a team member' });
    }

    project.teamMembers.push({ user: user._id, role: role || 'Member' });
    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};