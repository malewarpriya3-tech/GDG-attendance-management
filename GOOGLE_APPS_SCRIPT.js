/*
  ============================================
  GDG ATTENDANCE MANAGEMENT SYSTEM
  Google Apps Script Backend
  ============================================

  This is the backend code for the GDG Attendance Management System.
  To deploy:
  1. Go to https://script.google.com
  2. Create a new project
  3. Copy all code from this file into the script editor
  4. Create a .clasp.json file and deploy using Clasp, OR
  5. Deploy as Web App: Project Settings > Deploy > New Deployment > Web App
     - Execute as: Your account
     - Who has access: Anyone
  6. Get the deployment URL and add to .env file as VITE_GOOGLE_APPS_SCRIPT_URL
*/

const SHEET_NAME_ATTENDANCE = "Attendance";
const SHEET_NAME_EVENTS = "Events";
const SHEET_NAME_ADMIN = "Admin";
const SHEET_ID = "1dPVHu4w3DX3R3Eil7yN6VxEaKTSN3m2aP3D4lYvwH_g"; // Will be set in setupSheets()

let spreadsheet;

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    switch (action) {
      case "getEvents":
        return returnJSON(getEvents());

      case "submitAttendance":
        return returnJSON(submitAttendance(payload));

      case "adminLogin":
        return returnJSON(adminLogin(payload.username, payload.password));

      case "getDashboardData":
        return returnJSON(getDashboardData(payload.token));

      case "exportToCSV":
        return returnJSON(exportToCSV(payload.records));

      default:
        return returnJSON({ success: false, error: "Unknown action" });
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error);
    return returnJSON({
      success: false,
      error: "Server error: " + error.toString(),
    });
  }
}

function returnJSON(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getSpreadsheet() {
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  return spreadsheet;
}

function getOrCreateSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

function initializeSheets() {
  const ss = getSpreadsheet();

  const attendanceSheet = getOrCreateSheet(SHEET_NAME_ATTENDANCE);
  if (attendanceSheet.getLastRow() === 0) {
    attendanceSheet.appendRow([
      "Roll Number",
      "Full Name",
      "Email",
      "Event ID",
      "Event Name",
      "Status",
      "Notes",
      "Timestamp",
    ]);
  }

  const eventsSheet = getOrCreateSheet(SHEET_NAME_EVENTS);
  if (eventsSheet.getLastRow() === 0) {
    eventsSheet.appendRow(["Event ID", "Event Name"]);

    const timestamp = Date.now();
    eventsSheet.appendRow([timestamp + "_1", "GDG DevFest 2024"]);
    eventsSheet.appendRow([timestamp + "_2", "Android Study Jams"]);
    eventsSheet.appendRow([timestamp + "_3", "Cloud Study Jams"]);
    eventsSheet.appendRow([timestamp + "_4", "Web Development Bootcamp"]);
  }

  const adminSheet = getOrCreateSheet(SHEET_NAME_ADMIN);
  if (adminSheet.getLastRow() === 0) {
    adminSheet.appendRow(["Username", "Password", "Role"]);
    adminSheet.appendRow(["admin", "password123", "admin"]);
  }
}

function getEvents() {
  initializeSheets();

  const sheet = getOrCreateSheet(SHEET_NAME_EVENTS);
  const data = sheet.getDataRange().getValues();

  const events = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      events.push({
        id: data[i][0],
        name: data[i][1],
      });
    }
  }

  return {
    success: true,
    data: events,
  };
}

function submitAttendance(payload) {
  initializeSheets();

  const { rollNumber, fullName, email, eventId, status, notes } = payload;

  if (!rollNumber || !fullName || !email || !eventId || !status) {
    return {
      success: false,
      error: "Missing required fields",
    };
  }

  const attendanceSheet = getOrCreateSheet(SHEET_NAME_ATTENDANCE);
  const eventsSheet = getOrCreateSheet(SHEET_NAME_EVENTS);

  const eventData = eventsSheet.getDataRange().getValues();
  let eventName = "";

  for (let i = 1; i < eventData.length; i++) {
    if (eventData[i][0] === eventId) {
      eventName = eventData[i][1];
      break;
    }
  }

  if (!eventName) {
    return {
      success: false,
      error: "Event not found",
    };
  }

  const attendanceData = attendanceSheet.getDataRange().getValues();
  for (let i = 1; i < attendanceData.length; i++) {
    if (
      attendanceData[i][0] &&
      attendanceData[i][0].toString().toUpperCase() === rollNumber.toUpperCase()
    ) {
      return {
        success: false,
        error: "Roll number already submitted for this event",
      };
    }
  }

  const timestamp = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  attendanceSheet.appendRow([
    rollNumber,
    fullName,
    email,
    eventId,
    eventName,
    status,
    notes,
    timestamp,
  ]);

  return {
    success: true,
    message: "Attendance submitted successfully",
  };
}

function adminLogin(username, password) {
  initializeSheets();

  if (!username || !password) {
    return {
      success: false,
      error: "Username and password required",
    };
  }

  const adminSheet = getOrCreateSheet(SHEET_NAME_ADMIN);
  const adminData = adminSheet.getDataRange().getValues();

  for (let i = 1; i < adminData.length; i++) {
    if (adminData[i][0] === username && adminData[i][1] === password) {
      const token = Utilities.getUuid();

      const cacheService = CacheService.getScriptCache();
      cacheService.put(
        "admin_token_" + token,
        JSON.stringify({
          username: username,
          timestamp: new Date().getTime(),
        }),
        86400
      );

      return {
        success: true,
        token: token,
        message: "Login successful",
      };
    }
  }

  return {
    success: false,
    error: "Invalid username or password",
  };
}

function verifyToken(token) {
  const cacheService = CacheService.getScriptCache();
  const tokenData = cacheService.get("admin_token_" + token);

  return tokenData !== null;
}

function getDashboardData(token) {
  if (!verifyToken(token)) {
    return {
      success: false,
      error: "Unauthorized: Invalid or expired token",
    };
  }

  initializeSheets();

  const attendanceSheet = getOrCreateSheet(SHEET_NAME_ATTENDANCE);
  const eventsSheet = getOrCreateSheet(SHEET_NAME_EVENTS);

  const attendanceData = attendanceSheet.getDataRange().getValues();
  const eventsData = eventsSheet.getDataRange().getValues();

  const events = [];
  for (let i = 1; i < eventsData.length; i++) {
    if (eventsData[i][0] && eventsData[i][1]) {
      events.push({
        id: eventsData[i][0],
        name: eventsData[i][1],
      });
    }
  }

  const records = [];
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  for (let i = 1; i < attendanceData.length; i++) {
    const row = attendanceData[i];

    if (row[0]) {
      const status = row[5] || "";

      if (status === "Present") presentCount++;
      else if (status === "Absent") absentCount++;
      else if (status === "Excused") excusedCount++;

      records.push({
        rollNumber: row[0],
        fullName: row[1],
        email: row[2],
        eventName: row[4],
        status: status,
        notes: row[6] || "",
        timestamp: row[7] || "",
      });
    }
  }

  return {
    success: true,
    data: {
      totalCount: records.length,
      presentCount: presentCount,
      absentCount: absentCount,
      excusedCount: excusedCount,
      records: records,
      events: events,
    },
  };
}

function exportToCSV(records) {
  if (!records || !Array.isArray(records)) {
    return {
      success: false,
      error: "Invalid records",
    };
  }

  let csv = "Roll Number,Full Name,Email,Event Name,Status,Notes,Timestamp\n";

  for (const record of records) {
    const escapedNotes = (record.notes || "").replace(/"/g, '""');
    csv += `"${record.rollNumber}","${record.fullName}","${record.email}","${record.eventName}","${record.status}","${escapedNotes}","${record.timestamp}"\n`;
  }

  return {
    success: true,
    csv: csv,
  };
}
