# GDG Attendance Management System

A complete, production-ready attendance management system for Google Developers Groups (GDG). Built with React, Tailwind CSS, and Google Sheets with Google Apps Script backend.

## Overview

This system allows GDG members to submit attendance records through a clean, professional web form, while administrators can track attendance through a secure dashboard with search, filter, and export capabilities.

**Key Features:**
- 🎯 Simple attendance form for members
- 📊 Admin dashboard with real-time statistics
- 🔐 Secure admin login with authentication
- 🔍 Search and filter attendance records
- 📥 Export attendance data to CSV
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Professional blue color theme
- 📈 Real-time data updates
- 🚀 No paid services required
- ☁️ Google Sheets as database

---

## Getting Started

### Prerequisites

- Google Account
- Node.js 16+
- npm/yarn package manager
- GitHub account (for deployment)

### Quick Start

1. **Follow the [Deployment Guide](DEPLOYMENT_GUIDE.md)** for step-by-step setup
2. Copy your Google Apps Script URL
3. Update `.env` file with the URL
4. Deploy frontend to Vercel/Netlify/GitHub Pages
5. Share the form URL with GDG members

---

## System Architecture

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Build Tool:** Vite

### Backend
- **Platform:** Google Apps Script
- **Execution:** Cloud-based serverless
- **Authentication:** Simple username/password (stored in Google Sheets)

### Database
- **Service:** Google Sheets
- **Structure:** 3 sheets (Attendance, Events, Admin)
- **Data:** Plain text, easy to view and edit directly

---

## File Structure

```
project/
├── src/
│   ├── components/
│   │   ├── AttendanceForm.tsx      # Public attendance form
│   │   ├── AdminLogin.tsx          # Admin login page
│   │   └── AdminDashboard.tsx      # Admin dashboard
│   ├── utils/
│   │   └── api.ts                  # API calls to Google Apps Script
│   ├── App.tsx                     # Main app component
│   ├── index.css                   # Global styles
│   └── main.tsx                    # Entry point
├── GOOGLE_APPS_SCRIPT.js           # Backend code (deploy to Apps Script)
├── GOOGLE_SHEETS_SCHEMA.md         # Database schema documentation
├── DEPLOYMENT_GUIDE.md             # Step-by-step deployment instructions
├── README.md                        # This file
├── package.json                    # Dependencies
├── vite.config.ts                  # Build configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── .env                            # Environment variables
```

---

## Customization Guide

### 1. Branding & Text

#### Change Form Title and Description

**File:** `src/components/AttendanceForm.tsx`

Find these lines:
```tsx
<h1 className="text-4xl font-bold text-blue-900 mb-2">GDG Attendance</h1>
<p className="text-gray-600">Google Developers Group</p>
```

Change to:
```tsx
<h1 className="text-4xl font-bold text-blue-900 mb-2">Your Group Name</h1>
<p className="text-gray-600">Your description here</p>
```

#### Change Success Message

Find:
```tsx
<p className="text-green-700">Thank you for submitting your attendance</p>
```

Change the message as needed.

### 2. Form Fields

#### Add a New Field (Example: College Name)

**File:** `src/components/AttendanceForm.tsx`

1. Add to `formData` state:
```tsx
const [formData, setFormData] = useState({
  // ... existing fields
  collegeName: '',  // Add this
});
```

2. Add input field in the form:
```tsx
<div>
  <label htmlFor="collegeName" className="block text-sm font-semibold text-gray-700 mb-2">
    College Name
  </label>
  <input
    type="text"
    id="collegeName"
    value={formData.collegeName}
    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Your college name"
  />
</div>
```

3. Update the API call to send this field:
```tsx
const response = await callGoogleAppsScript('submitAttendance', {
  // ... existing fields
  collegeName: formData.collegeName.trim(),
});
```

4. Update `GOOGLE_APPS_SCRIPT.js`:
   - Add column to Attendance sheet
   - Update `submitAttendance()` function to handle the field

#### Remove a Field

1. Remove from form component
2. Remove from validation logic
3. Remove from API call
4. Remove column from Google Sheets Attendance sheet

### 3. Color Theme

The system uses a **blue color theme**. To change colors:

#### Change Primary Blue

**File:** `src/components/AttendanceForm.tsx` and other components

Find all instances of `bg-blue-*` classes and replace with your color:
```tsx
// Current
className="bg-blue-600 hover:bg-blue-700"

// Change to (example: green)
className="bg-green-600 hover:bg-green-700"
```

#### Tailwind Color Reference

Available colors: `red`, `green`, `yellow`, `blue`, `purple`, `pink`, `orange`, etc.

### 4. Events Management

#### Add a New Event

1. Open your Google Sheet
2. Go to "Events" sheet
3. Add a new row:
   - Column A: `1704067200005` (unique ID, or use timestamp)
   - Column B: `Your Event Name`
4. Save - it appears in form dropdown immediately!

#### Modify Event Name

1. Open "Events" sheet in Google Sheets
2. Find the event row
3. Edit the Event Name column
4. Changes appear immediately in the form

#### Delete an Event

1. Open "Events" sheet
2. Right-click the row and delete
3. Event no longer appears in dropdown

### 5. Admin Credentials

#### Change Admin Password

1. Open your Google Sheet
2. Go to "Admin" sheet
3. Change the password in column B, row 2
4. Save - use new password to login

#### Add Multiple Admins (Currently Limited)

Current system supports 1 admin account. To add multiple admins:

1. Go to "Admin" sheet
2. Add new rows with username, password, role
3. Update `GOOGLE_APPS_SCRIPT.js`:
```javascript
function adminLogin(username, password) {
  // ... existing code ...
  for (let i = 1; i < adminData.length; i++) {  // This loops all rows now
    if (adminData[i][0] === username && adminData[i][1] === password) {
      // Login successful
    }
  }
}
```

### 6. Dashboard Statistics

#### Change Statistics Display

**File:** `src/components/AdminDashboard.tsx`

The dashboard displays:
- Total submissions
- Present count
- Absent count
- Excused count

To add more statistics (e.g., registration rate):

```tsx
// Add new stat card
<div className="bg-white rounded-lg shadow p-6">
  <p className="text-gray-600 text-sm font-semibold mb-2">Registration Rate</p>
  <p className="text-4xl font-bold text-blue-900">75%</p>
</div>
```

### 7. Export Format

#### Customize CSV Export

**File:** `GOOGLE_APPS_SCRIPT.js`

Find the `exportToCSV()` function:

```javascript
function exportToCSV(records) {
  let csv = 'Roll Number,Full Name,Email,Event Name,Status,Notes,Timestamp\n';
  // Add more columns to header
  // Add more fields to CSV row
  return {
    success: true,
    csv: csv
  };
}
```

### 8. Styling & Layout

#### Change Input Field Colors

Find input classes:
```tsx
className="border border-gray-300 focus:ring-2 focus:ring-blue-500"
```

Change to:
```tsx
className="border border-blue-200 focus:ring-2 focus:ring-blue-600"
```

#### Adjust Spacing

Tailwind spacing: `p-4` (padding), `m-4` (margin), `gap-4` (gaps)

Change numbers: `p-2`, `p-4`, `p-6`, `p-8`

#### Change Button Sizes

```tsx
// Small button
<button className="px-3 py-1 text-sm">Small</button>

// Medium button
<button className="px-4 py-2 text-base">Medium</button>

// Large button
<button className="px-6 py-3 text-lg">Large</button>
```

---

## Maintenance Guide

### Regular Maintenance Tasks

#### Weekly
- Review new attendance submissions
- Check for any errors in form submissions
- Verify admin dashboard is working

#### Monthly
- Export attendance data for backup
- Review admin logs (if logging is implemented)
- Check for data integrity issues

#### Quarterly
- Update events list if new events are planned
- Review and update admin credentials
- Check system performance

### Database Maintenance

#### Backup Data

1. Open the admin dashboard
2. Click "Export CSV" button
3. Save the CSV file
4. Store in cloud storage or local backup

#### Clean Up Old Records

1. Open Google Sheet
2. Go to "Attendance" sheet
3. Select old rows
4. Right-click and delete rows
5. Save sheet

**Warning:** This is permanent. Export data first!

#### Archiving

1. Create a backup Google Sheet named "Archive_2024"
2. Copy old attendance records to archive sheet
3. Delete from main Attendance sheet
4. Keep archive for historical records

### Performance Optimization

#### If System Gets Slow

1. **Reduce data:** Delete old attendance records (after backup)
2. **Optimize sheet:** Remove hidden rows/columns
3. **Clear cache:** Use Ctrl+Shift+Delete in Chrome

#### Monitor Hits

Use Google Apps Script logs:
1. Go to your Apps Script project
2. Click "View" → "Logs"
3. Check for errors or bottlenecks

---

## Troubleshooting

### Form Issues

**Problem:** "Failed to load events"
- Check VITE_GOOGLE_APPS_SCRIPT_URL in .env
- Verify Apps Script deployment is active
- Check browser console for CORS errors

**Problem:** Form submit fails silently
- Check browser console (F12)
- Verify Google Sheet has "Events" sheet with data
- Check Apps Script logs for errors

**Problem:** Success message doesn't show
- Check if backend returned `success: true`
- Verify API response in browser DevTools Network tab

### Admin Dashboard Issues

**Problem:** "Unauthorized" error
- Token may have expired
- Clear browser cache and login again
- Check if token is being stored in localStorage

**Problem:** No data appears in dashboard
- Check "Attendance" sheet has records
- Verify admin authentication is working
- Check Google Apps Script logs

**Problem:** Search/filter not working
- Clear browser cache
- Refresh the page
- Check console for JavaScript errors

### Google Sheets Issues

**Problem:** New events don't appear in form
- Save the Google Sheet (Ctrl+S)
- Refresh the web form page
- Check "Events" sheet has data in columns A and B

**Problem:** Duplicate submission error when roll number is new
- The same roll number cannot submit twice for same event
- This is intentional to prevent duplicates
- Try different roll number or different event

**Problem:** Admin sheet is empty
- Create new rows manually with username and password
- Or delete and let Apps Script recreate on next run

### Deployment Issues

**Problem:** Frontend shows blank page
- Check .env file has VITE_GOOGLE_APPS_SCRIPT_URL
- Check deployment logs in Vercel/Netlify
- Verify npm build completed without errors

**Problem:** "Cannot find module" errors
- Run `npm install` to install dependencies
- Delete `node_modules` and `.next` folders
- Run `npm install` again

**Problem:** CORS errors in browser console
- Ensure Apps Script is deployed with "Anyone" access
- Check deployment URL is correct in .env
- Try redeploying Apps Script

---

## Advanced Customization

### Add Email Notifications

**Requirement:** Google Forms with email notification (separate setup)

1. Create a Google Form connected to the same Google Sheet
2. Set up email notifications in Form settings
3. Users receive confirmation emails

### Add Data Validation

To add validation for specific fields:

**File:** `GOOGLE_APPS_SCRIPT.js`

```javascript
function submitAttendance(payload) {
  // Add validation
  if (!/^[A-Z]{2}\d{3}$/.test(payload.rollNumber)) {
    return {
      success: false,
      error: 'Invalid roll number format'
    };
  }
  // ... rest of function
}
```

### Add Reporting Features

Extend the dashboard with:
- Charts and graphs
- Export to PDF
- Attendance percentage calculation
- Trend analysis

**Tools:** Use Chart.js or Recharts library (requires npm install)

### Add File Upload

Store files in Google Drive from Apps Script:

```javascript
function uploadFile(fileData) {
  const blob = Utilities.newBlob(fileData, 'application/octet-stream');
  DriveApp.createFile(blob);
}
```

---

## Security Best Practices

1. **Change Default Credentials**
   - Change admin password immediately after setup
   - Do not share default credentials publicly

2. **Limit Sheet Access**
   - Only share Google Sheet with trusted admins
   - Use "View" or "Comment" permissions for non-admin staff

3. **Backup Data Regularly**
   - Export CSV daily or weekly
   - Store backups securely

4. **Monitor Access**
   - Check who has access to the Google Sheet
   - Review login attempts in deployment logs

5. **Keep Dependencies Updated**
   - Run `npm update` periodically
   - Review security advisories

---

## FAQ

**Q: Can I use this for multiple events?**
A: Yes! Add events to the Events sheet. Students can submit once per event.

**Q: How many submissions can the system handle?**
A: Google Sheets can handle thousands of rows. Performance remains good up to 50,000+ records.

**Q: Is this system suitable for production?**
A: Yes! It's designed for production use with proper security, validation, and error handling.

**Q: Can I customize the colors?**
A: Yes, easily! Edit Tailwind classes in component files. See Customization section.

**Q: Can multiple admins log in?**
A: Currently designed for 1 admin. Multiple admins can be added with code modification.

**Q: How do I backup attendance data?**
A: Use the "Export CSV" button in the dashboard. This exports all filtered records.

**Q: Can students modify their submissions?**
A: Currently, submissions are final. To allow editing, you'd need to add an edit feature (requires development).

**Q: How often is data updated?**
A: Dashboard updates every 10 seconds with fresh data from Google Sheets.

**Q: Can I deploy without Vercel?**
A: Yes! Use Netlify or GitHub Pages. See Deployment Guide for details.

**Q: Is there a mobile app?**
A: The web app is fully responsive and works on all devices. No native app needed.

---

## Support & Contributing

### Getting Help

1. Check this README for common issues
2. Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for setup help
3. Check [GOOGLE_SHEETS_SCHEMA.md](GOOGLE_SHEETS_SCHEMA.md) for data structure
4. Google Apps Script logs: Project → View → Logs
5. Browser console: F12 → Console tab

### Reporting Issues

Include:
- What you were trying to do
- Error message (if any)
- Steps to reproduce
- Environment (OS, browser)

### Contributing

To improve this system:
1. Make changes locally
2. Test thoroughly
3. Document your changes
4. Submit a pull request

---

## License

This project is provided as-is for GDG use.

---

## Version History

**v1.0.0** (Current)
- Initial release
- Public attendance form
- Admin dashboard with authentication
- Event management
- CSV export
- Fully responsive design
- Production-ready backend

---

## Quick Reference

### Default Credentials
- **Username:** `admin`
- **Password:** `password123`

### Key Files
- Frontend form: `src/components/AttendanceForm.tsx`
- Admin dashboard: `src/components/AdminDashboard.tsx`
- Backend logic: `GOOGLE_APPS_SCRIPT.js`
- Database schema: `GOOGLE_SHEETS_SCHEMA.md`

### Common Tasks
- **Add event:** Edit "Events" sheet in Google Sheets
- **Change password:** Edit "Admin" sheet in Google Sheets
- **Change colors:** Edit Tailwind classes in components
- **Export data:** Click "Export CSV" in dashboard

---

## Next Steps

1. Complete [Deployment Guide](DEPLOYMENT_GUIDE.md)
2. Test the complete system
3. Customize branding and colors
4. Share the form URL with GDG members
5. Monitor attendance submissions
6. Export data regularly for records

---

**Happy managing attendance! 🎉**
