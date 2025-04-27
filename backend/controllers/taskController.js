const Task = require('../models/task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'username email');
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


const createTask = async (req, res) => {
  try {
    // Add logged in user as createdBy
    req.body.createdBy = req.user.id;
    
    const task = await Task.create(req.body);
    
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: 'Invalid task data'
    });
  }
};


const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify task ownership
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: 'Invalid task data'
    });
  }
};


const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify task ownership
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    // Use deleteOne instead of remove
    await Task.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


// @desc    Move task status
// @route   PUT /api/tasks/:id/move
// @access  Private
const moveTask = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['To Do', 'In Progress', 'Done'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify task ownership
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      data: populatedTask
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask
};