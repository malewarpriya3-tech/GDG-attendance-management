# Google Sheets Schema

This document describes the Google Sheets structure used by the GDG Attendance Management System.

## Overview

The system uses a single Google Sheet with 3 separate sheets (tabs):
1. **Attendance** - Stores all attendance records
2. **Events** - Stores event information
3. **Admin** - Stores admin credentials

---

## Sheet 1: Attendance

**Purpose:** Stores all attendance submissions

**Columns:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| A | Roll Number | Student's college roll number (unique per event) | CS001 |
| B | Full Name | Student's full name | John Doe |
| C | Email | Student's email address | john@example.com |
| D | Event ID | ID of the event (matches Events sheet) | 1704067200001_1 |
| E | Event Name | Name of the event | GDG DevFest 2024 |
| F | Status | Attendance status | Present / Absent / Excused |
| G | Notes | Optional additional notes | Was late by 10 minutes |
| H | Timestamp | When the form was submitted | 12/31/2024 10:30:45 PM |

**Notes:**
- Row 1 contains headers
- Data starts from Row 2
- Roll Number must be unique per event (checked by backend)
- Status must be one of: Present, Absent, Excused
- Timestamp is auto-populated by the backend

---

## Sheet 2: Events

**Purpose:** Stores all events that appear in the attendance form dropdown

**Columns:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| A | Event ID | Unique identifier for the event | 1704067200001_1 |
| B | Event Name | Display name of the event | GDG DevFest 2024 |

**Preloaded Events:**

| Event ID | Event Name |
|----------|------------|
| (timestamp)_1 | GDG DevFest 2024 |
| (timestamp)_2 | Android Study Jams |
| (timestamp)_3 | Cloud Study Jams |
| (timestamp)_4 | Web Development Bootcamp |

**Notes:**
- Row 1 contains headers
- Data starts from Row 2
- Event ID is auto-generated based on timestamp when first initialized
- To add a new event: Simply add a new row with a unique Event ID and Event Name
- New events appear in the form dropdown immediately

---

## Sheet 3: Admin

**Purpose:** Stores admin credentials for dashboard access

**Columns:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| A | Username | Admin username | admin |
| B | Password | Admin password | password123 |
| C | Role | User role | admin |

**Default Credentials:**

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | admin |

**Notes:**
- Row 1 contains headers
- Data starts from Row 2
- Currently only 1 admin account is supported
- You can change the password directly in the sheet
- Username and password are case-sensitive

---

## How to Set Up Google Sheets

### 1. Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Create" → "Blank spreadsheet"
3. Name it: "GDG Attendance Management"

### 2. Initialize the Sheet

The Google Apps Script will automatically create and populate all sheets when first accessed. However, you can manually set them up:

#### Create "Attendance" Sheet:
- Go to the "Sheet1" tab
- Rename it to "Attendance"
- Add headers in Row 1:
  ```
  Roll Number | Full Name | Email | Event ID | Event Name | Status | Notes | Timestamp
  ```

#### Create "Events" Sheet:
- Right-click on sheet tab → Insert 1 below
- Name it "Events"
- Add headers in Row 1:
  ```
  Event ID | Event Name
  ```
- Add initial events (rows 2-5):
  ```
  1704067200001_1 | GDG DevFest 2024
  1704067200001_2 | Android Study Jams
  1704067200001_3 | Cloud Study Jams
  1704067200001_4 | Web Development Bootcamp
  ```

#### Create "Admin" Sheet:
- Right-click on sheet tab → Insert 1 below
- Name it "Admin"
- Add headers in Row 1:
  ```
  Username | Password | Role
  ```
- Add default admin in Row 2:
  ```
  admin | password123 | admin
  ```

### 3. Get Sheet ID

1. Open the sheet in a browser
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Copy the SHEET_ID (long alphanumeric string)
4. Update the `SHEET_ID` variable in GOOGLE_APPS_SCRIPT.js if needed

### 4. Permissions

1. Share the Google Sheet with yourself or your team
2. Click "Share" → Select "Restricted" or "Specific people"
3. The Google Apps Script needs write access to add new records

---

## Adding New Events

To add a new event that appears in the attendance form:

1. Open the Google Sheet
2. Go to the "Events" sheet
3. Click on an empty row (e.g., Row 6)
4. Enter:
   - **Event ID:** A unique identifier (e.g., `1704067200005`)
   - **Event Name:** The event name that will appear in the dropdown
5. Save the sheet
6. The new event appears in the form immediately!

---

## Changing Admin Credentials

To change the admin password:

1. Open the Google Sheet
2. Go to the "Admin" sheet
3. Click on the Password cell (B2)
4. Change the value to your new password
5. Save the sheet
6. Use the new credentials to log in

To add a new admin account:

1. Go to the "Admin" sheet
2. Add a new row with:
   - **Username:** New username
   - **Password:** New password
   - **Role:** admin
3. Save

---

## Data Retention

- Keep the Attendance sheet for record-keeping
- Export attendance data regularly using the "Export CSV" button in the dashboard
- You can delete old records from the Attendance sheet without affecting the system
- The Events and Admin sheets should not be modified by end users

---

## Security Notes

- Admin credentials are stored in plain text in the Google Sheet
- Only share the Google Sheet with trusted administrators
- Change default credentials after first setup
- The Google Apps Script requires appropriate permissions to read/write the sheet
- The system checks authorization before allowing dashboard access
