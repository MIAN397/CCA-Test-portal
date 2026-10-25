import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import * as masterData from './data/masterData_bundle.js';

dotenv.config();

async function runMigration() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas. Starting data migration...');

  let usersMigrated = 0;
  let quizzesMigrated = 0;

  // 1. Admins
  for (const adm of (masterData.MASTER_ADMINS || [])) {
    await User.findOneAndUpdate(
      { $or: [{ id: adm.id }, { loginId: adm.loginId }] },
      { ...adm, role: 'admin' },
      { upsert: true, new: true }
    );
    usersMigrated++;
  }

  // 2. Developers
  for (const dev of (masterData.MASTER_DEVELOPERS || [])) {
    await User.findOneAndUpdate(
      { $or: [{ id: dev.id }, { loginId: dev.loginId }] },
      { ...dev, role: 'developer' },
      { upsert: true, new: true }
    );
    usersMigrated++;
  }

  // 3. Teachers
  for (const tch of (masterData.MASTER_TEACHERS || [])) {
    const assignments = [...(tch.assignments || [])];
    if (tch.loginId === 'm.afzal' || tch.id === 'tch-1792153549134') {
      if (!assignments.some(a => a.subject.toLowerCase() === 'biology')) {
        assignments.push({ className: 'Class VIII (PAF College Sargodha Prep)', subject: 'Biology' });
        assignments.push({ className: 'Class 12 (Intermediate Pre-Medical)', subject: 'Biology' });
      }
    }
    await User.findOneAndUpdate(
      { $or: [{ id: tch.id }, { loginId: tch.loginId }] },
      { ...tch, role: 'teacher', assignments, maxClasses: 20, lifetimeClassesCreated: 2 },
      { upsert: true, new: true }
    );
    usersMigrated++;
  }

  // 4. Students
  for (const std of (masterData.MASTER_STUDENTS || [])) {
    await User.findOneAndUpdate(
      { $or: [{ id: std.id }, { loginId: std.loginId }] },
      { ...std, role: 'student' },
      { upsert: true, new: true }
    );
    usersMigrated++;
  }

  // 5. Default Quizzes
  for (const q of (masterData.MASTER_QUIZZES || [])) {
    await Quiz.findOneAndUpdate({ id: q.id }, { ...q }, { upsert: true, new: true });
    quizzesMigrated++;
  }

  // 6. Biology Quizzes
  const bioQuizzes = JSON.parse(fs.readFileSync('./data/biologyQuizzes.json', 'utf8'));
  for (const bq of bioQuizzes) {
    await Quiz.findOneAndUpdate({ id: bq.id }, { ...bq }, { upsert: true, new: true });
    quizzesMigrated++;
  }

  const finalUserCount = await User.countDocuments();
  const finalQuizCount = await Quiz.countDocuments();

  console.log('🎉 Migration Completed Successfully!');
  console.log('📊 Total Users in MongoDB Atlas:', finalUserCount);
  console.log('📊 Total Quizzes in MongoDB Atlas:', finalQuizCount);

  const bioInDb = await Quiz.find({ subject: 'Biology' });
  console.log('\n🔬 Class 12 Biology Quizzes in MongoDB Atlas:');
  bioInDb.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.title}`);
    console.log(`     - Document ID: ${q.id}`);
    console.log(`     - Questions: ${q.questions?.length} MCQs (${q.totalMarks} Marks)`);
    console.log(`     - Status: ${q.publishStatus}`);
    console.log(`     - Teacher: ${q.teacherName} (${q.teacherId})`);
  });

  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
