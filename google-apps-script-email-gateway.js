/**
 * Google Apps Script — CCAP Portal Email Gateway
 * 
 * Free, unlimited transactional email dispatcher for Cadets Coaching Academy.
 * Sends OTP verification emails directly from your Gmail to any recipient personal email.
 * 
 * SETUP INSTRUCTIONS (Takes ~45 seconds):
 * 1. Open https://script.google.com/ in your browser (signed in with your Academy Gmail).
 * 2. Click "New project" (+ icon).
 * 3. Replace all default code with this entire file.
 * 4. Click "Deploy" (top-right blue button) -> "New deployment".
 * 5. Click the gear icon next to "Select type" -> choose "Web app".
 * 6. Set:
 *    - Description: CCAP Email Gateway
 *    - Execute as: "Me (<your-gmail>)"
 *    - Who has access: "Anyone"   <--- CRITICAL! Must be "Anyone" so the portal can send OTPs.
 * 7. Click "Deploy" -> "Authorize access" (choose your Google account -> Advanced -> Go to Untitled project).
 * 8. Copy the "Web app URL" (starts with https://script.google.com/macros/s/.../exec).
 * 9. Paste that URL into your .env file as:
 *    VITE_EMAIL_GATEWAY_URL="https://script.google.com/macros/s/.../exec"
 */

function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    if (!data.toEmail) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing toEmail recipient"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var subject = data.subject || ("Your CCA Password Reset Code: " + (data.otpCode || ""));
    var htmlBody = data.htmlBody || ("<p>Your CCA verification code is: <strong>" + data.otpCode + "</strong></p>");

    MailApp.sendEmail({
      to: data.toEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: "Cadets Coaching Academy (CCA)"
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      messageId: "cca-gas-" + new Date().getTime()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "CCA Google Apps Script Email Gateway",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
