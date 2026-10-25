import express from 'express';
import User, { normalizeGmail } from '../models/User.js';

const router = express.Router();

/**
 * GET /api/users
 * Optional filter: ?role=teacher | student | admin | developer
 */
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

/**
 * GET /api/users/teachers
 * Retrieve all registered faculty teachers
 */
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: teachers.length, teachers });
  } catch (err) {
    console.error('Fetch teachers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers.' });
  }
});

/**
 * GET /api/users/students
 * Retrieve all registered cadet students
 */
router.get('/students', async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = { role: 'student' };
    if (teacherId) {
      filter.$or = [
        { enrolledByTeacherId: teacherId },
        { 'enrolledClasses.enrolledByTeacherId': teacherId }
      ];
    }

    const students = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('Fetch students error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
});

/**
 * POST /api/users
 * Create user (e.g. recruit teacher or enroll student)
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const userId = data.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const cleanEmail = normalizeGmail(data.email);

    const user = new User({
      ...data,
      id: userId,
      email: cleanEmail || undefined,
      loginId: (data.loginId || cleanEmail?.split('@')[0] || '').toLowerCase().trim(),
      password: data.password || 'password123'
    });

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, user: userObj });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create user.' });
  }
});

/**
 * PUT /api/users/:id
 * Update teacher/student/admin details, assignments, or quota
 */
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { loginId: req.params.id.toLowerCase() }] },
      { ...data },
      { new: true, upsert: false }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      $or: [{ id: req.params.id }, { loginId: req.params.id.toLowerCase() }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found to delete.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

export default router;
