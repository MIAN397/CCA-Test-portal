const PROJECT_ID = 'cadets-coaching-academy-1234';
const API_KEY = 'AIzaSyBxv4qGeAqogGIh_O-2twI_-rdoiSvN6bw';
const TARGET_TEACHER_ID = 'tch-1792153549134';
const TARGET_TEACHER_NAME = 'M.Afzal';

const QUIZ_IDS = [
  // 10 PAF College Sargodha Quizzes
  'quiz-paf-eng-1',
  'quiz-paf-eng-2',
  'quiz-paf-intel-1',
  'quiz-paf-intel-2',
  'quiz-paf-math-1',
  'quiz-paf-math-2',
  'quiz-paf-math-3',
  'quiz-paf-sci-1',
  'quiz-paf-sci-2',
  'quiz-paf-urdu-1',
  // 14 M.Afzal legacy quizzes
  'quiz_09a1u0ems',
  'quiz_0rw1hets6',
  'quiz_4othr8xzv',
  'quiz_4pyvoal4e',
  'quiz_calujxhwy',
  'quiz_era5xywtd',
  'quiz_f9mmafqvp',
  'quiz_fd0j5pgwx',
  'quiz_gwjwr7zgt',
  'quiz_huni16pkh',
  'quiz_kogfbdrw0',
  'quiz_oiz5tqi57',
  'quiz_q5yvkcclx',
  'quiz_rziyy1gs6',
];

async function reallot() {
  console.log(`Reallotting and normalizing ${QUIZ_IDS.length} quizzes for ${TARGET_TEACHER_NAME} (${TARGET_TEACHER_ID})...`);

  const nowIso = new Date().toISOString();
  let updatedCount = 0;

  for (const qId of QUIZ_IDS) {
    try {
      const getUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quizzes/${qId}?key=${API_KEY}`;
      const getRes = await fetch(getUrl);
      if (!getRes.ok) {
        console.warn(`Could not fetch ${qId}: HTTP ${getRes.status}`);
        continue;
      }

      const doc = await getRes.json();
      const fields = doc.fields || {};

      fields.teacherId = { stringValue: TARGET_TEACHER_ID };
      fields.teacherName = { stringValue: TARGET_TEACHER_NAME };
      fields.isInQuizBank = { booleanValue: true };
      fields.updatedAt = { stringValue: nowIso };

      if (!fields.targetClass || !fields.targetClass.stringValue) {
        fields.targetClass = { stringValue: 'Class VIII (PAF College Sargodha Prep)' };
      }

      if (!fields.allocation || !fields.allocation.mapValue) {
        fields.allocation = {
          mapValue: {
            fields: {
              mode: { stringValue: 'classes' },
              targetClasses: {
                arrayValue: {
                  values: [{ stringValue: fields.targetClass.stringValue || 'Class VIII (PAF College Sargodha Prep)' }],
                },
              },
              targetStudentIds: { arrayValue: { values: [] } },
            },
          },
        };
      }

      const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quizzes/${qId}?key=${API_KEY}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      if (patchRes.ok) {
        console.log(`✓ Reallotted & normalized ${qId}`);
        updatedCount++;
      } else {
        console.warn(`Failed patching ${qId}: HTTP ${patchRes.status}`);
      }
    } catch (err) {
      console.error(`Error on ${qId}:`, err.message);
    }
  }

  // Also fix any other quiz missing allocation in Firestore
  const allRes = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quizzes?pageSize=100&key=${API_KEY}`);
  const allData = await allRes.json();
  for (const doc of allData.documents || []) {
    const f = doc.fields || {};
    const qId = f.id?.stringValue || doc.name.split('/').pop();
    if (!f.allocation || !f.allocation.mapValue) {
      f.allocation = {
        mapValue: {
          fields: {
            mode: { stringValue: 'classes' },
            targetClasses: {
              arrayValue: {
                values: [{ stringValue: f.targetClass?.stringValue || 'Class 8 (Cadet Prep)' }],
              },
            },
            targetStudentIds: { arrayValue: { values: [] } },
          },
        },
      };
      await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quizzes/${qId}?key=${API_KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: f }),
      });
      console.log(`✓ Added default allocation to ${qId}`);
    }
  }

  // Update sync_state in Cloud Firestore to trigger immediate cross-device client update
  const syncStateUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/app_data/sync_state?key=${API_KEY}`;
  await fetch(syncStateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        lastSyncedAt: { stringValue: new Date().toISOString() },
        version: { integerValue: String(Date.now()) },
        system: { stringValue: 'Cadets Coaching Academy Assessment Portal' },
        reallottedTeacher: { stringValue: TARGET_TEACHER_ID },
      },
    }),
  });

  console.log(`\nSuccessfully reallotted ${updatedCount} quizzes to M.Afzal (${TARGET_TEACHER_ID}) with full allocation metadata. Global sync_state bumped.`);
}

reallot();
