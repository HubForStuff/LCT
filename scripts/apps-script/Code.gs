// scripts/apps-script/Code.gs
// Google Apps Script Web App for LATAM CHINA TECH pre-registration submissions.
// Deploy: bind to the destination spreadsheet, Deploy > New deployment > Web app,
// Execute as: Me, Who has access: Anyone. Paste the /exec URL into PUBLIC_PREREG_SCRIPT_URL.
// SHEET_COLUMNS MUST stay in sync with src/lib/pre-registration/sheet-columns.ts.

var SHEET_NAME = "Submissions";
var DRIVE_FOLDER_NAME = "Pre-Registration Uploads";

var SHEET_COLUMNS = [
  "Submitted At", "Submission ID", "Language", "Competition Slug", "Competition Name",
  "Project Name", "Project Introduction", "Competition Field", "Company Headquarters",
  "Company Location", "Company Full Name", "Office Address", "Applicant Name", "Gender",
  "Date Of Birth", "Nationality", "Graduation Institution", "Highest Degree",
  "WeChat Or WhatsApp", "LinkedIn", "Email", "Elevator Pitch", "Project Overview",
  "Product Features", "Business Model", "Team Introduction", "Investment Value",
  "Funding Amount Requested", "Expected Benefits", "Hear About", "Expansion Plan",
  "Incorporation Timeline", "Pitch Deck Link", "Supplementary Links", "User Agent",
  "Referrer", "Raw JSON"
];

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var folder = getUploadFolder_();

    var deckLink = String(p.deckLink || "");
    if (p.deckFile_base64) {
      deckLink = saveFile_(folder, p.deckFile_base64, p.deckFile_type, p.deckFile_name || "pitch-deck");
    }

    var suppLinks = [];
    var suppCount = parseInt(p.suppFile_count || "0", 10) || 0;
    for (var i = 0; i < suppCount; i++) {
      var b64 = p["suppFile_base64_" + i];
      if (!b64) continue;
      suppLinks.push(saveFile_(folder, b64, p["suppFile_type_" + i], p["suppFile_name_" + i] || ("file-" + i)));
    }

    var row = [
      new Date(),
      p.submissionId || "", p.language || "", p.competitionSlug || "", p.competitionName || "",
      p.projectName || "", p.projectIntro || "", p.compField || "", p.companyHeadquarters || "",
      p.compLocation || "", p.compFullName || "", p.officeAddress || "", p.applicantName || "",
      p.gender || "", p.dob || "", p.nationality || "", p.university || "", p.degree || "",
      p.wechat || "", p.linkedin || "", p.email || "", p.elevatorPitch || "", p.projectOverview || "",
      p.productFeatures || "", p.businessModel || "", p.teamIntroduction || "", p.investmentValue || "",
      p.fundingAmountRequested || "", p.benefits || "", p.hearAbout || "", p.beijingPlan || "",
      p.incorporationTimeline || "", deckLink, suppLinks.join("\n"), p.userAgent || "", p.referrer || "",
      JSON.stringify(p)
    ];

    appendRow_(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function appendRow_(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(SHEET_COLUMNS);
  sheet.appendRow(row);
}

function getUploadFolder_() {
  var existing = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return existing.hasNext() ? existing.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function saveFile_(folder, base64, mimeType, name) {
  var bytes = Utilities.base64Decode(base64);
  var blob = Utilities.newBlob(bytes, mimeType || "application/octet-stream", name);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
