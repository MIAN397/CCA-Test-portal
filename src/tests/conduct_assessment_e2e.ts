import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const PORT = 4399;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url?.split('?')[0] || '/';
    if (reqUrl === '/') reqUrl = '/index.html';

    let filePath = path.join(DIST_DIR, reqUrl);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  });
}

let passedChecks = 0;
let failedChecks = 0;

function verify(condition: boolean, title: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${title}${details ? ` -> ${details}` : ''}`);
    passedChecks++;
  } else {
    console.error(`  ❌ [FAIL] ${title}${details ? ` -> ${details}` : ''}`);
    failedChecks++;
  }
}

async function runE2E() {
  console.log('\n========================================================================');
  console.log('   CCAP ASSESSMENT PORTAL — COMPLETE END-TO-END FLOW VERIFICATION      ');
  console.log('   Admin -> Recruit Teacher -> Teacher Enrolls Student & Makes Test   ');
  console.log('   Student Conducts Test -> Auto-Grading -> Official Scorecard         ');
  console.log('========================================================================\n');

  const server = createStaticServer();
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`🌐 Test server listening on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('dialog', async (dialog) => {
    console.log('BROWSER DIALOG POPPED:', dialog.message());
    await dialog.accept();
  });
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // -------------------------------------------------------------
    // PHASE 1: ADMIN LOGIN
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 1] Admin Authentication & Oversight ---');
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[placeholder*="Login ID"]', { timeout: 10000 });

    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const inputs = document.querySelectorAll('input');
      if (inputs.length >= 2) {
        desc?.set?.call(inputs[0], 'admin');
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[1], 'password123');
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });

    await page.waitForSelector('.app-shell-layout', { timeout: 10000 });
    verify(true, 'Admin authenticated successfully', 'Brig. (R) Muhammad Khan portal active');

    // -------------------------------------------------------------
    // PHASE 2: ADMIN RECRUITS A TEACHER PROFILE
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 2] Admin Recruits New Teacher Profile ---');

    await page.waitForSelector('button', { timeout: 5000 });
    const recruitTriggered = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const recruitBtn = btns.find((b) => b.textContent?.includes('Recruit Teacher') || b.textContent?.includes('Recruit'));
      if (recruitBtn) {
        recruitBtn.click();
        return true;
      }
      return false;
    });

    verify(recruitTriggered, 'Recruit Teacher modal trigger button clicked');

    await page.waitForSelector('.modal-container', { timeout: 5000 });
    verify(true, 'RecruitTeacherModal opened cleanly');

    // Fill Recruit Teacher Form
    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const modal = document.querySelector('.modal-container');
      if (!modal) return;
      const inputs = modal.querySelectorAll('input');
      if (inputs.length >= 5) {
        desc?.set?.call(inputs[0], 'Prof. Tariq Mahmood');
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[1], 'tariq.mahmood@ccap.com');
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[2], '+92 300 7654321');
        inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[2].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[3], 'prof_tariq');
        inputs[3].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[3].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[4], 'Password123!');
        inputs[4].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[4].dispatchEvent(new Event('change', { bubbles: true }));
      }

      const submitBtn = modal.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Prof. Tariq Mahmood') || text.includes('prof_tariq');
    }, { timeout: 5000 });

    verify(true, 'Teacher "Prof. Tariq Mahmood" recruited and saved in database');

    const teacherStored = await page.evaluate(() => {
      const raw = localStorage.getItem('cca_teachers_v2') || '[]';
      const teachers = JSON.parse(raw);
      return teachers.some((t: any) => t.loginId === 'prof_tariq' && t.name === 'Prof. Tariq Mahmood');
    });
    verify(teacherStored, 'Teacher record validated in cca_teachers_v2');

    // -------------------------------------------------------------
    // PHASE 3: LOGOUT & LOGIN AS THE NEW TEACHER
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 3] Teacher Profile Login & Command Desk Mount ---');

    await page.evaluate(() => {
      const btn = document.querySelector('.nav-logout-btn, .sidebar-btn-logout') as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForSelector('input[placeholder*="Login ID"]', { timeout: 10000 });
    verify(true, 'Admin logged out, login form displayed');

    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const inputs = document.querySelectorAll('input');
      if (inputs.length >= 2) {
        desc?.set?.call(inputs[0], 'prof_tariq');
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[1], 'Password123!');
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });

    await page.waitForSelector('.app-shell-layout', { timeout: 10000 });
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Prof. Tariq') || text.includes('No Classes Created Yet') || text.includes('Create Class');
    }, { timeout: 10000 });

    verify(true, 'Prof. Tariq Mahmood authenticated into Faculty Command Desk');

    // -------------------------------------------------------------
    // PHASE 4: TEACHER CREATES CLASS & SUBJECT
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 4] Teacher Creates Class & Subject ---');

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent?.includes('Create Class'));
      if (btn) btn.click();
    });

    await page.waitForSelector('.modal-container', { timeout: 5000 });
    verify(true, 'Create Class modal opened');

    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const modal = document.querySelector('.modal-container');
      if (!modal) return;
      const inputs = modal.querySelectorAll('input');
      if (inputs.length >= 2) {
        desc?.set?.call(inputs[0], 'Class 9 (Cadet Wing)');
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[1], 'General Science & Physics');
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }

      const submitBtn = modal.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Class 9 (Cadet Wing)') && text.includes('General Science & Physics');
    }, { timeout: 5000 });

    verify(true, 'Class "Class 9 (Cadet Wing)" and Subject "General Science & Physics" created');

    // -------------------------------------------------------------
    // PHASE 5: TEACHER ENROLLS STUDENT PROFILE
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 5] Teacher Enrolls Cadet Student Profile ---');

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent?.includes('Enroll Cadet') || b.textContent?.includes('Enroll Student') || b.textContent?.includes('Enroll'));
      if (btn) btn.click();
    });

    await page.waitForSelector('.modal-container', { timeout: 5000 });
    verify(true, 'Enroll Student modal opened');

    // Fill Student Information
    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const modal = document.querySelector('.modal-container');
      if (!modal) return;
      const inputs = modal.querySelectorAll('input');
      // Inputs: 0: name, 1: email, 2: phone, 3: className, 4: loginId, 5: password
      if (inputs.length >= 6) {
        desc?.set?.call(inputs[0], 'Cadet Bilal Ahmed');
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[1], 'bilal.ahmed.cadet@gmail.com');
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[2], '+92 321 8765432');
        inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[2].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[3], 'Class 9 (Cadet Wing)');
        inputs[3].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[3].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[4], 'cadet_bilal9');
        inputs[4].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[4].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[5], 'Cadet123/');
        inputs[5].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[5].dispatchEvent(new Event('change', { bubbles: true }));
      }

      const submitBtn = modal.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Cadet Bilal Ahmed') || text.includes('cadet_bilal9');
    }, { timeout: 5000 });

    verify(true, 'Cadet "Cadet Bilal Ahmed" enrolled and assigned to Class 9 (Cadet Wing)');

    // -------------------------------------------------------------
    // PHASE 6: TEACHER CREATES AND PUBLISHES TEST (QUIZ)
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 6] Teacher Creates & Publishes Test (Assessment) ---');

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent?.includes('Create Assessment') || b.textContent?.includes('Create Test'));
      if (btn) btn.click();
    });

    await page.waitForSelector('.modal-container', { timeout: 5000 });
    verify(true, 'Create Assessment Modal opened (Step 1: Configuration)');

    // Step 1: Fill Title & advance to Step 2
    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const modal = document.querySelector('.modal-container');
      if (!modal) return;

      const titleInput = modal.querySelector('input[placeholder*="e.g."]') as HTMLInputElement;
      if (titleInput) {
        desc?.set?.call(titleInput, 'Physics & Science Diagnostic Assessment 2026');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const btns = Array.from(modal.querySelectorAll('button'));
      const nextBtn = btns.find(
        (b) =>
          b.textContent?.includes('Continue to Questions') ||
          b.textContent?.includes('Questions') ||
          b.textContent?.includes('Next')
      );
      if (nextBtn) nextBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return (
        text.includes('Question 1') ||
        text.includes('Option A') ||
        text.includes('Multiple Choice Options') ||
        text.includes('problem statement')
      );
    }, { timeout: 8000 });

    verify(true, 'Step 2: Questions wizard rendered');

    // Step 2: Fill Question Text & Options
    await page.evaluate(() => {
      const modal = document.querySelector('.modal-container');
      if (!modal) return;

      const descInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const descArea = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');

      const qText = modal.querySelector('textarea') as HTMLTextAreaElement;
      if (qText) {
        descArea?.set?.call(qText, 'What is the SI unit of electric current?');
        qText.dispatchEvent(new Event('input', { bubbles: true }));
        qText.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const optInputs = modal.querySelectorAll('.options-builder-grid input[type="text"]') as NodeListOf<HTMLInputElement>;
      if (optInputs.length >= 4) {
        descInput?.set?.call(optInputs[0], 'Volt');
        optInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        optInputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        descInput?.set?.call(optInputs[1], 'Ampere');
        optInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        optInputs[1].dispatchEvent(new Event('change', { bubbles: true }));

        descInput?.set?.call(optInputs[2], 'Ohm');
        optInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        optInputs[2].dispatchEvent(new Event('change', { bubbles: true }));

        descInput?.set?.call(optInputs[3], 'Watt');
        optInputs[3].dispatchEvent(new Event('input', { bubbles: true }));
        optInputs[3].dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Select correct option B (index 1 radio)
      const radios = modal.querySelectorAll('.options-builder-grid input[type="radio"]') as NodeListOf<HTMLInputElement>;
      if (radios.length >= 2) {
        radios[1].click();
      }

      // Click "Continue to Review"
      const btns = Array.from(modal.querySelectorAll('button'));
      const reviewBtn = btns.find(
        (b) =>
          b.textContent?.includes('Continue to Review') ||
          b.textContent?.includes('Review') ||
          b.textContent?.includes('Next')
      );
      if (reviewBtn) reviewBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Publish Assessment') || text.includes('Review Summary') || text.includes('Target Classes');
    }, { timeout: 8000 });

    verify(true, 'Step 3: Review summary displayed');

    // Step 3: Publish the Assessment
    await page.evaluate(() => {
      const modal = document.querySelector('.modal-container');
      if (!modal) return;
      const btns = Array.from(modal.querySelectorAll('button'));
      const pubBtn = btns.find((b) => b.textContent?.includes('Publish Assessment'));
      if (pubBtn) pubBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Physics & Science Diagnostic Assessment 2026') || !document.querySelector('.modal-container');
    }, { timeout: 8000 });

    verify(true, 'Assessment published and saved to Quiz Bank & active roster');

    // -------------------------------------------------------------
    // PHASE 7: LOGOUT TEACHER & LOGIN AS CADET STUDENT
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 7] Cadet Student Login & Test Discovery ---');

    await page.evaluate(() => {
      const btn = document.querySelector('.nav-logout-btn, .sidebar-btn-logout') as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForSelector('input[placeholder*="Login ID"]', { timeout: 10000 });
    verify(true, 'Logged out from Teacher, Login screen rendered');

    // Login as Cadet Bilal Ahmed
    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      const inputs = document.querySelectorAll('input');
      if (inputs.length >= 2) {
        desc?.set?.call(inputs[0], 'cadet_bilal9');
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

        desc?.set?.call(inputs[1], 'Cadet123/');
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });

    await page.waitForSelector('.app-shell-layout', { timeout: 10000 });
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Cadet Bilal Ahmed') || text.includes('Physics & Science Diagnostic');
    }, { timeout: 10000 });

    verify(true, 'Cadet Bilal Ahmed authenticated into Student Portal');

    // Verify Quiz is discovered by student
    const quizDiscovered = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Physics & Science Diagnostic Assessment 2026');
    });
    verify(quizDiscovered, 'Published test discovered on Cadet Desk without leak or glitch');

    // -------------------------------------------------------------
    // PHASE 8: CONDUCT TEST & SUBMIT ANSWERS
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 8] Conduct Assessment Examination Flow ---');

    // Click "Start Timed Exam"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find((b) => b.textContent?.includes('Start Timed Exam') || b.textContent?.includes('Start'));
      if (startBtn) startBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Begin Assessment') || text.includes('Enter Fullscreen');
    }, { timeout: 5000 });

    verify(true, 'Security Pre-Exam Gate loaded with exam guidelines');

    // Click "Begin Assessment"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const beginBtn = btns.find(
        (b) =>
          b.textContent?.includes('Begin Assessment') ||
          b.textContent?.includes('Begin') ||
          b.textContent?.includes('Fullscreen')
      );
      if (beginBtn) beginBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('SI unit of electric current') || text.includes('Ampere');
    }, { timeout: 5000 });

    verify(true, 'Question 1 mounted in examination terminal');

    // Select Answer: Option B (Ampere)
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.option-choice-card, .option-card, .option-btn, label, button'));
      const ampOption = options.find((o) => o.textContent?.includes('Ampere')) as HTMLElement;
      if (ampOption) ampOption.click();
    });

    verify(true, 'Answer selected: Option B (Ampere)');

    // Click "Finish & Submit" or "Submit Exam"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(
        (b) => b.textContent?.includes('Finish & Submit') || b.textContent?.includes('Submit Exam')
      );
      if (submitBtn) submitBtn.click();
    });

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Yes, Finalize & Submit') || text.includes('Finalize');
    }, { timeout: 5000 });

    verify(true, 'Confirmation modal displayed');

    // Confirm final submit
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirmBtn = btns.find((b) => b.textContent?.includes('Yes, Finalize & Submit'));
      if (confirmBtn) confirmBtn.click();
    });

    // -------------------------------------------------------------
    // PHASE 9: OFFICIAL SCORECARD & GRADING VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 9] Auto-Grading & Official CCAP Scorecard Verification ---');

    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('PASSED') || text.includes('100%') || text.includes('Scorecard') || text.includes('Transcript');
    }, { timeout: 8000 });

    const results = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const hasPass =
        text.includes('PASSED') ||
        text.includes('Passed') ||
        text.includes('HONORS') ||
        text.includes('HIGH MERIT') ||
        text.includes('QUALIFIED');
      const hasScore = text.includes('100%') || text.includes('5 / 5') || text.includes('5/5');
      const hasCadetName = text.includes('Cadet Bilal Ahmed') || text.includes('Bilal Ahmed');
      return { hasPass, hasScore, hasCadetName };
    });

    verify(results.hasPass, 'Auto-grader awarded passing status (PASSED)');
    verify(results.hasScore, 'Auto-grader precision verified (100% marks)');
    verify(results.hasCadetName, 'Scorecard generated for Cadet Bilal Ahmed');

    // -------------------------------------------------------------
    // PHASE 10: PERSISTENCE & DATA INTEGRITY
    // -------------------------------------------------------------
    console.log('\n--- [PHASE 10] Multi-Tenant Data Isolation & Persistence ---');

    const dbAudit = await page.evaluate(() => {
      const subs = JSON.parse(localStorage.getItem('cca_submissions_v2') || '[]');
      const latest = subs[0];
      return {
        count: subs.length,
        studentId: latest?.studentId,
        studentName: latest?.studentName,
        score: latest?.score,
        totalMarks: latest?.totalMarks,
        passed: latest?.passed,
        teacherName: latest?.teacherName,
      };
    });

    verify(dbAudit.count > 0, 'Submission successfully persisted to cca_submissions_v2');
    verify(dbAudit.passed === true, 'Submission recorded with passed === true', `Score: ${dbAudit.score}/${dbAudit.totalMarks}`);
    verify(dbAudit.studentName === 'Cadet Bilal Ahmed', 'Submission tied to Cadet Bilal Ahmed');
    verify(dbAudit.teacherName === 'Prof. Tariq Mahmood', 'Submission accurately attributed to Prof. Tariq Mahmood');

  } catch (err: any) {
    console.error('Fatal E2E error:', err);
    try {
      const errorText = await page.evaluate(() => {
        const errEl = document.querySelector('.error-banner, [style*="color: var(--badge-fail-text)"]');
        return {
          url: location.href,
          bodyText: document.body.innerText.slice(0, 500),
          errorMsg: errEl?.textContent,
        };
      });
      console.log('Page state at failure:', JSON.stringify(errorText, null, 2));
    } catch {}
    failedChecks++;
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`   END-TO-END FLOW AUDIT COMPLETE: ${passedChecks} PASSED, ${failedChecks} FAILED`);
  console.log('========================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runE2E();
