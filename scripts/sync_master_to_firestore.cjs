const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
const conf = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = conf.tokens.access_token;
const projectId = 'ccap-testportal';
const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'master_database_backup.json'), 'utf8'));

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue),
      },
    };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }
  return fields;
}

async function putDoc(collection, docId, data) {
  const cleanId = docId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${cleanId}`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn(`[WARN] ${collection}/${cleanId}: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[ERR] ${collection}/${cleanId}:`, err.message);
    return false;
  }
}

async function runInPool(tasks, poolSize = 6) {
  const results = [];
  for (let i = 0; i < tasks.length; i += poolSize) {
    const chunk = tasks.slice(i, i + poolSize);
    const chunkResults = await Promise.all(chunk.map((fn) => fn()));
    results.push(...chunkResults);
    process.stdout.write(`.` );
  }
  process.stdout.write('\n');
  return results;
}

async function main() {
  console.log('--- Uploading Master Database to Firebase Firestore (Pooled) ---');

  // 1. Upload Profiles (Admins, Developers, Teachers, Students)
  const allUsers = [
    ...(db.cca_developers_v2 || []).map((u) => ({ ...u, role: 'developer' })),
    ...(db.cca_admins_v2 || []).map((u) => ({ ...u, role: 'admin' })),
    ...(db.cca_teachers_v2 || []).map((u) => ({ ...u, role: 'teacher' })),
    ...(db.cca_students_v2 || []).map((u) => ({ ...u, role: 'student' })),
  ];

  const profileTasks = [];
  for (const user of allUsers) {
    const loginId = user.loginId || user.id;
    if (!loginId) continue;
    profileTasks.push(() =>
      putDoc('profiles', loginId, {
        ...user,
        deleted: false,
        updatedAt: user.updatedAt || new Date().toISOString(),
      })
    );
    if (user.email && user.email.toLowerCase() !== loginId.toLowerCase()) {
      profileTasks.push(() =>
        putDoc('profiles', user.email, {
          ...user,
          deleted: false,
          updatedAt: user.updatedAt || new Date().toISOString(),
        })
      );
    }
  }

  process.stdout.write(`Syncing ${profileTasks.length} profiles... `);
  await runInPool(profileTasks, 8);
  console.log(`Profiles synchronized.`);

  // 2. Upload Quizzes
  const quizTasks = (db.cca_quizzes_v2 || []).map((quiz) => () =>
    putDoc('quizzes', quiz.id, {
      ...quiz,
      updatedAt: quiz.updatedAt || new Date().toISOString(),
    })
  );
  process.stdout.write(`Syncing ${quizTasks.length} quizzes... `);
  await runInPool(quizTasks, 8);
  console.log(`Quizzes synchronized.`);

  // 3. Upload Submissions
  const subTasks = (db.cca_submissions_v2 || []).map((sub) => () =>
    putDoc('submissions', sub.id, sub)
  );
  process.stdout.write(`Syncing ${subTasks.length} submissions... `);
  await runInPool(subTasks, 8);
  console.log(`Submissions synchronized.`);

  // 4. Upload Subscriptions
  const subscriptionTasks = (db.cca_subscriptions_v2 || []).map((s) => () =>
    putDoc('subscriptions', s.id, s)
  );
  process.stdout.write(`Syncing ${subscriptionTasks.length} subscriptions... `);
  await runInPool(subscriptionTasks, 8);
  console.log(`Subscriptions synchronized.`);

  // 5. Upload Master Backup Snapshot to app_data
  console.log('Writing app_data/master_database snapshot...');
  await putDoc('app_data', 'master_database', {
    admins: db.cca_admins_v2 || [],
    developers: db.cca_developers_v2 || [],
    teachers: db.cca_teachers_v2 || [],
    students: db.cca_students_v2 || [],
    quizzes: db.cca_quizzes_v2 || [],
    submissions: db.cca_submissions_v2 || [],
    subscriptions: db.cca_subscriptions_v2 || [],
    updatedAt: new Date().toISOString(),
    totalQuizzes: (db.cca_quizzes_v2 || []).length,
    totalStudents: (db.cca_students_v2 || []).length,
    totalTeachers: (db.cca_teachers_v2 || []).length,
  });

  // 6. Update sync_state
  console.log('Writing app_data/sync_state...');
  await putDoc('app_data', 'sync_state', {
    lastSyncedAt: new Date().toISOString(),
    version: 2,
    totalQuizzes: (db.cca_quizzes_v2 || []).length,
    totalStudents: (db.cca_students_v2 || []).length,
    totalTeachers: (db.cca_teachers_v2 || []).length,
    system: 'Cadets Coaching Academy Assessment Portal',
  });

  console.log('=== Firestore Master Database Sync Complete & Verified! ===');
}

main().catch(console.error);
