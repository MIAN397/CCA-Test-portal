import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import * as masterData from '../data/masterData_bundle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/seed
 * Seed / Migrate all institutional users, default quizzes, and the 2 Biology quizzes into MongoDB Atlas.
 * Safe upsert: running multiple times never causes duplicate records.
 */
router.post('/', async (req, res) => {
  try {
    let usersCreated = 0;
    let usersUpdated = 0;
    let quizzesCreated = 0;
    let quizzesUpdated = 0;

    // 1. Migrate Admins
    if (masterData.MASTER_ADMINS) {
      for (const adm of masterData.MASTER_ADMINS) {
        const query = { $or: [{ id: adm.id }, { loginId: adm.loginId }] };
        const update = {
          id: adm.id,
          name: adm.name,
          email: adm.email,
          phone: adm.phone || '',
          loginId: adm.loginId,
          password: adm.password || 'password123',
          role: 'admin',
          googleId: adm.googleId || '',
          googlePicture: adm.googlePicture || '',
          subscription: adm.subscription || null
        };
        const r = await User.findOneAndUpdate(query, update, { upsert: true, new: true, rawResult: true });
        if (r.lastErrorObject?.updatedExisting) usersUpdated++;
        else usersCreated++;
      }
    }

    // 2. Migrate Developers
    if (masterData.MASTER_DEVELOPERS) {
      for (const dev of masterData.MASTER_DEVELOPERS) {
        const query = { $or: [{ id: dev.id }, { loginId: dev.loginId }] };
        const update = {
          id: dev.id,
          name: dev.name,
          email: dev.email,
          phone: dev.phone || '',
          loginId: dev.loginId,
          password: dev.password || 'password123',
          role: 'developer',
          googleId: dev.googleId || '',
          googlePicture: dev.googlePicture || '',
          subscription: dev.subscription || null
        };
        const r = await User.findOneAndUpdate(query, update, { upsert: true, new: true, rawResult: true });
        if (r.lastErrorObject?.updatedExisting) usersUpdated++;
        else usersCreated++;
      }
    }

    // 3. Migrate Teachers (ensuring M.Afzal has both Class VIII and Class 12 Biology)
    if (masterData.MASTER_TEACHERS) {
      for (const tch of masterData.MASTER_TEACHERS) {
        const assignments = [...(tch.assignments || [])];
        if (tch.loginId === 'm.afzal' || tch.id === 'tch-1792153549134') {
          // Guarantee Biology is in assignments
          if (!assignments.some(a => a.subject.toLowerCase() === 'biology')) {
            assignments.push({ className: 'Class VIII (PAF College Sargodha Prep)', subject: 'Biology' });
            assignments.push({ className: 'Class 12 (Intermediate Pre-Medical)', subject: 'Biology' });
          }
        }

        const query = { $or: [{ id: tch.id }, { loginId: tch.loginId }] };
        const update = {
          id: tch.id,
          name: tch.name,
          email: tch.email,
          phone: tch.phone || '',
          loginId: tch.loginId,
          password: tch.password || 'password123',
          role: 'teacher',
          assignments,
          maxClasses: 20,
          lifetimeClassesCreated: 2,
          googleId: tch.googleId || '',
          googlePicture: tch.googlePicture || '',
          subscription: tch.subscription || null,
          recruitedAt: tch.recruitedAt || new Date().toISOString()
        };
        const r = await User.findOneAndUpdate(query, update, { upsert: true, new: true, rawResult: true });
        if (r.lastErrorObject?.updatedExisting) usersUpdated++;
        else usersCreated++;
      }
    }

    // 4. Migrate Students
    if (masterData.MASTER_STUDENTS) {
      for (const std of masterData.MASTER_STUDENTS) {
        const query = { $or: [{ id: std.id }, { loginId: std.loginId }] };
        const update = {
          id: std.id,
          name: std.name,
          email: std.email || '',
          phone: std.phone || '',
          className: std.className || '',
          loginId: std.loginId,
          password: std.password || 'password123',
          role: 'student',
          enrolledByTeacherId: std.enrolledByTeacherId || '',
          enrolledClasses: std.enrolledClasses || [],
          googleId: std.googleId || '',
          googlePicture: std.googlePicture || '',
          subscription: std.subscription || null,
          enrolledAt: std.enrolledAt || new Date().toISOString()
        };
        const r = await User.findOneAndUpdate(query, update, { upsert: true, new: true, rawResult: true });
        if (r.lastErrorObject?.updatedExisting) usersUpdated++;
        else usersCreated++;
      }
    }

    // 5. Migrate Quizzes from masterData
    if (masterData.MASTER_QUIZZES) {
      for (const q of masterData.MASTER_QUIZZES) {
        const query = { id: q.id };
        const r = await Quiz.findOneAndUpdate(query, { ...q }, { upsert: true, new: true, rawResult: true });
        if (r.lastErrorObject?.updatedExisting) quizzesUpdated++;
        else quizzesCreated++;
      }
    }

    // 6. Migrate Biology Quizzes (Chapter 15 Homeostasis & Chapter 21 Cell Cycle)
    const bioPath = path.join(__dirname, '../data/biologyQuizzes.json');
    if (fs.existsSync(bioPath)) {
      const bioQuizzes = JSON.parse(fs.readFileSync(bioPath, 'utf8'));
      for (const bq of bioQuizzes) {
        const query = { id: bq.id };
        const r = await Quiz.findOneAndUpdate(query, { ...bq }, { upsert: true, new: true, rawResult: true });
        if (r.lastErrorObject?.updatedExisting) quizzesUpdated++;
        else quizzesCreated++;
      }
    }

    const totalQuizzes = await Quiz.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      message: 'MongoDB database successfully seeded and synchronized!',
      stats: {
        usersCreated,
        usersUpdated,
        totalUsersInDB: totalUsers,
        quizzesCreated,
        quizzesUpdated,
        totalQuizzesInDB: totalQuizzes
      }
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, message: 'Seeding failed: ' + err.message });
  }
});

export default router;
