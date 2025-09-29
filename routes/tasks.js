const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
  body('status').optional().isIn(['pending', 'done']).withMessage('Status must be pending or done')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, status, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      status,
      dueDate,
      owner: req.user.id
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', auth, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
  body('status').optional().isIn(['pending', 'done']).withMessage('Invalid status')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });


    const allowed = ['title', 'description', 'status', 'dueDate'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    await task.remove();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;