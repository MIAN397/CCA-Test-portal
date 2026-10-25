import express from 'express';
import Submission from '../models/Submission.js';

const router = express.Router();

/**
 * GET /api/submissions
 * Query filters: ?teacherId=...&studentId=...&quizId=...
 */
router.get('/', async (req, res) => {
  try {
    const { teacherId, studentId, quizId } = req.query;
    const filter = {};

    if (teacherId) filter.teacherId = teacherId;
    if (studentId) filter.studentId = studentId;
    if (quizId) filter.quizId = quizId;

    const submissions = await Submission.find(filter).sort({ submittedAt: -1, createdAt: -1 });
    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    console.error('Fetch submissions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
  }
});

/**
 * GET /api/submissions/:id
 * Retrieve single submission report
 */
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({ success: true, submission });
  } catch (err) {
    console.error('Fetch submission by id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch submission.' });
  }
});

/**
 * POST /api/submissions
 * Submit new cadet test attempt
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const subId = data.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const submission = new Submission({
      ...data,
      id: subId,
      submittedAt: data.submittedAt || new Date().toISOString()
    });

    await submission.save();
    res.status(201).json({ success: true, submission });
  } catch (err) {
    console.error('Save submission error:', err);
    res.status(500).json({ success: false, message: 'Failed to save submission.' });
  }
});

export default router;
