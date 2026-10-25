import express from 'express';
import Quiz from '../models/Quiz.js';

const router = express.Router();

/**
 * GET /api/quizzes
 * Retrieve quizzes with optional query parameters:
 * ?teacherId=...&subject=...&publishStatus=...&className=...
 */
router.get('/', async (req, res) => {
  try {
    const { teacherId, subject, publishStatus, className, isInQuizBank } = req.query;
    const filter = {};

    if (teacherId) filter.teacherId = teacherId;
    if (subject) filter.subject = new RegExp(`^${subject.trim()}$`, 'i');
    if (publishStatus) filter.publishStatus = publishStatus;
    if (isInQuizBank !== undefined) filter.isInQuizBank = isInQuizBank === 'true';

    if (className) {
      filter.$or = [
        { 'allocation.mode': 'all' },
        { 'allocation.targetClasses': { $regex: new RegExp(className.trim(), 'i') } },
        { targetClass: { $regex: new RegExp(className.trim(), 'i') } },
        { className: { $regex: new RegExp(className.trim(), 'i') } }
      ];
    }

    const quizzes = await Quiz.find(filter).sort({ updatedAt: -1, createdAt: -1 });
    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (err) {
    console.error('Fetch quizzes error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes.' });
  }
});

/**
 * GET /api/quizzes/:id
 * Retrieve a specific quiz
 */
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    res.json({ success: true, quiz });
  } catch (err) {
    console.error('Fetch quiz by id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz.' });
  }
});

/**
 * POST /api/quizzes
 * Create a new quiz
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newId = data.id || `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const quiz = new Quiz({
      ...data,
      id: newId,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await quiz.save();
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create quiz.' });
  }
});

/**
 * PUT /api/quizzes/:id
 * Update an existing quiz
 */
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();

    const quiz = await Quiz.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
      { ...data, updatedAt: now },
      { new: true, upsert: true }
    );

    res.json({ success: true, quiz });
  } catch (err) {
    console.error('Update quiz error:', err);
    res.status(500).json({ success: false, message: 'Failed to update quiz.' });
  }
});

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await Quiz.findOneAndDelete({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Quiz not found to delete.' });
    }

    res.json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete quiz.' });
  }
});

/**
 * POST /api/quizzes/:id/clone
 * Clone a quiz duplicate in Quiz Bank
 */
router.post('/:id/clone', async (req, res) => {
  try {
    const sourceQuiz = await Quiz.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!sourceQuiz) {
      return res.status(404).json({ success: false, message: 'Source quiz not found to clone.' });
    }

    const clonedData = sourceQuiz.toObject();
    delete clonedData._id;
    delete clonedData.__v;

    const clonedId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cloned = new Quiz({
      ...clonedData,
      id: clonedId,
      title: `${clonedData.title} (Copy)`,
      publishStatus: 'draft',
      isInQuizBank: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await cloned.save();
    res.status(201).json({ success: true, quiz: cloned });
  } catch (err) {
    console.error('Clone quiz error:', err);
    res.status(500).json({ success: false, message: 'Failed to clone quiz.' });
  }
});

export default router;
