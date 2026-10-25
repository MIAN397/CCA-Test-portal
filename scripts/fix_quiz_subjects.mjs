const PROJECT_ID = 'cadets-coaching-academy-1234';
const API_KEY = 'AIzaSyBxv4qGeAqogGIh_O-2twI_-rdoiSvN6bw';

const SUBJECT_MAPPINGS = {
  'quiz_gwjwr7zgt': 'Mathematics',
  'quiz_calujxhwy': 'Intelligence Test',
  'quiz_kogfbdrw0': 'Intelligence Test',
  'quiz_oiz5tqi57': 'Intelligence Test',
  'quiz_4othr8xzv': 'Intelligence Test',
  'quiz_era5xywtd': 'Intelligence Test',
  'quiz_q5yvkcclx': 'Intelligence Test',
  'quiz_09a1u0ems': 'General Science',
  'quiz_f9mmafqvp': 'General Science',
  'quiz_huni16pkh': 'General Science',
  'quiz_0rw1hets6': 'General Science',
  'quiz_fd0j5pgwx': 'General Science',
  'quiz_4pyvoal4e': 'General Science',
  'quiz_rziyy1gs6': 'General Science',
  'quiz_j1p1dr9tv': 'General Science',
  'quiz_dga8ugj9w': 'General Science',
  'quiz_u48yg7a6l': 'General Science',
};

async function fixSubjects() {
  console.log('Ensuring all quizzes in Firestore have valid subjects...');

  const allRes = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quizzes?pageSize=100&key=${API_KEY}`);
  const allData = await allRes.json();
  let fixedCount = 0;

  for (const doc of allData.documents || []) {
    const f = doc.fields || {};
    const qId = f.id?.stringValue || doc.name.split('/').pop();
    if (!f.subject || !f.subject.stringValue || f.subject.stringValue.trim() === '') {
      const assignedSubject = SUBJECT_MAPPINGS[qId] || 'General Science';
      f.subject = { stringValue: assignedSubject };
      f.updatedAt = { stringValue: new Date().toISOString() };

      const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quizzes/${qId}?key=${API_KEY}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: f }),
      });

      if (patchRes.ok) {
        console.log(`✓ Set subject="${assignedSubject}" on ${qId}`);
        fixedCount++;
      }
    }
  }

  // Update sync_state
  const syncStateUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/app_data/sync_state?key=${API_KEY}`;
  await fetch(syncStateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        lastSyncedAt: { stringValue: new Date().toISOString() },
        version: { integerValue: String(Date.now()) },
        system: { stringValue: 'Cadets Coaching Academy Assessment Portal' },
      },
    }),
  });

  console.log(`\nSuccessfully normalized subjects on ${fixedCount} quizzes in Firestore.`);
}

fixSubjects();
