const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask
} = require('../controllers/taskController');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/move')
  .put(protect, moveTask);

module.exports = router;