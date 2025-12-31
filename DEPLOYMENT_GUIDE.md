# GDG Attendance Management System - Deployment Guide

This guide provides step-by-step instructions to deploy the complete system.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Google Sheets](#step-1-create-google-sheets)
3. [Step 2: Deploy Google Apps Script](#step-2-deploy-google-apps-script)
4. [Step 3: Deploy Frontend](#step-3-deploy-frontend)
5. [Step 4: Configure Environment](#step-4-configure-environment)
6. [Step 5: Test the System](#step-5-test-the-system)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google Account (with Google Sheets and Google Apps Script access)
- GitHub Account (for frontend code)
- Node.js 16+ installed locally
- npm or yarn package manager

---

## Step 1: Create Google Sheets

### 1.1 Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Create"** button
3. Select **"Blank spreadsheet"**
4. Name it: `GDG Attendance Management`
5. The sheet will be created and opened automatically

### 1.2 Initialize Sheets (Auto or Manual)

**Option A: Automatic (Recommended)**
- The Google Apps Script will auto-create and populate all sheets on first run
- Skip to Step 2

**Option B: Manual Setup**

1. Rename **Sheet1** to **Attendance**
2. Add headers in Row 1:
   ```
   Roll Number | Full Name | Email | Event ID | Event Name | Status | Notes | Timestamp
   ```

3. Create a new sheet named **Events**
4. Add headers in Row 1:
   ```
   Event ID | Event Name
   ```
5. Add preloaded events (starting Row 2):
   ```
   timestamp_1 | GDG DevFest 2024
   timestamp_2 | Android Study Jams
   timestamp_3 | Cloud Study Jams
   timestamp_4 | Web Development Bootcamp
   ```

6. Create a new sheet named **Admin**
7. Add headers in Row 1:
   ```
   Username | Password | Role
   ```
8. Add default admin (Row 2):
   ```
   admin | password123 | admin
   ```

### 1.3 Get the Sheet URL

1. Open the Google Sheet
2. Copy the URL from the address bar
3. It should look like: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
4. Save the SHEET_ID for later (the long alphanumeric string)

---

## Step 2: Deploy Google Apps Script

### 2.1 Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"New project"**
3. Name it: `GDG Attendance Backend`
4. You'll see the script editor

### 2.2 Copy Backend Code

1. Open `GOOGLE_APPS_SCRIPT.js` from the project files
2. Copy **all the code**
3. Go to the Apps Script editor
4. Replace the entire default code with your copied code
5. Press **Ctrl+S** (or Cmd+S) to save

### 2.3 Link to Google Sheet

1. In the Apps Script editor, click **"Project Settings"** (gear icon)
2. Find the "GCP Project ID" field
3. Copy it
4. In the `GOOGLE_APPS_SCRIPT.js` code, update this line:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID_HERE';
   ```
   Replace with your actual Sheet ID from Step 1.3

5. Save again

### 2.4 Deploy as Web App

1. Click **"Deploy"** (top right) → **"New Deployment"**
2. Click the **gear icon** → Select **"Web app"**
3. Configure:
   - **Description:** GDG Attendance Backend
   - **Execute as:** [Your Google Account Email]
   - **Who has access:** Anyone
4. Click **"Deploy"**
5. You'll see a popup with the deployment URL
6. Click **"Copy URL"** (it looks like: `https://script.googleusercontent.com/macros/d/...`)
7. **Save this URL** - you'll need it in the next step

### 2.5 Update Execution Permissions

1. In the deployment dialog, click **"Manage Deployments"**
2. Find your web app deployment
3. Click the **three dots menu** → **"Update"**
4. Keep settings the same, click **"Update"**

---

## Step 3: Deploy Frontend

### 3.1 Prepare Local Environment

1. Clone or download the project code to your computer
2. Open terminal/command prompt
3. Navigate to the project directory:
   ```bash
   cd path-to-project
   ```

### 3.2 Configure Environment Variables

1. Open the `.env` file in the project
2. Find this line:
   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
   ```
3. Replace it with the URL you got from Step 2.4:
   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.googleusercontent.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent
   ```
4. Save the `.env` file

### 3.3 Install Dependencies

```bash
npm install
```

### 3.4 Build the Project

```bash
npm run build
```

The build output will be in the `dist/` folder.

### 3.5 Deploy to Vercel (Recommended)

**Option A: Using Vercel UI (Easiest)**

1. Go to [Vercel](https://vercel.com)
2. Sign up or log in with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add `VITE_GOOGLE_APPS_SCRIPT_URL` and paste your Apps Script URL
7. Click **"Deploy"**
8. Your frontend will be live! Copy the deployment URL

**Option B: Using Netlify**

1. Go to [Netlify](https://netlify.com)
2. Sign up or log in
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your GitHub repository
5. Configure:
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add Environment Variables (in Build & Deploy → Environment):
   - `VITE_GOOGLE_APPS_SCRIPT_URL=<your-apps-script-url>`
7. Click **"Deploy"**

**Option C: Using GitHub Pages**

1. Ensure your code is pushed to a GitHub repository
2. In `.env`, update:
   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=<your-apps-script-url>
   ```
3. Create a GitHub Actions workflow (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```
4. Enable GitHub Pages in repository settings

---

## Step 4: Configure Environment

### 4.1 Update Environment Variables

The `.env` file should have:

```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_GOOGLE_APPS_SCRIPT_URL=https://script.googleusercontent.com/macros/d/.../usercontent
```

### 4.2 Customize Settings

After deployment, you may want to customize:

1. **Change Admin Password:**
   - Open the Google Sheet
   - Go to "Admin" sheet
   - Change password in cell B2
   - Save

2. **Add New Events:**
   - Open the Google Sheet
   - Go to "Events" sheet
   - Add new rows with Event ID and Event Name
   - Changes appear in form dropdown immediately

3. **Customize Text:**
   - Edit `src/components/AttendanceForm.tsx` for form text
   - Edit `src/components/AdminDashboard.tsx` for dashboard text
   - Rebuild and redeploy

---

## Step 5: Test the System

### 5.1 Test Attendance Form

1. Go to your frontend URL
2. Test the attendance form:
   - Fill in Roll Number: `CS001`
   - Fill in Full Name: `Test User`
   - Fill in Email: `test@example.com`
   - Select an Event
   - Select Status: `Present`
   - Add optional Notes
   - Click **"Submit Attendance"**
3. You should see: **"Thank you for submitting your attendance"**

### 5.2 Test Admin Dashboard

1. Click **"Admin"** button on the form
2. Enter credentials:
   - Username: `admin`
   - Password: `password123`
3. Click **"Login"**
4. You should see the dashboard with statistics
5. Test features:
   - **Search:** Enter the roll number `CS001`
   - **Filter by Event:** Select the event
   - **Filter by Status:** Select `Present`
   - **Export CSV:** Click the Export button
   - **Refresh:** Click Refresh to reload data

### 5.3 Verify Data in Google Sheets

1. Open the Google Sheet
2. Go to **"Attendance"** sheet
3. Check if your test submission appears in the rows

---

## Troubleshooting

### Issue: "Failed to connect to the server"

**Solution:**
1. Check if `VITE_GOOGLE_APPS_SCRIPT_URL` is set correctly in `.env`
2. Verify the Apps Script URL is deployed and accessible
3. Try copying the URL again from Apps Script deployment page

### Issue: "Invalid credentials" when logging in

**Solution:**
1. Double-check username and password in the Admin sheet
2. Ensure no extra spaces before/after credentials
3. Credentials are case-sensitive
4. Default credentials: `admin` / `password123`

### Issue: Events dropdown is empty

**Solution:**
1. Open the Google Sheet
2. Go to the "Events" sheet
3. Verify rows exist with Event ID and Event Name
4. Check formatting - no hidden columns or rows
5. Refresh the form page

### Issue: "Duplicate roll number" error

**Solution:**
- The same roll number cannot be submitted twice for the same event
- This is intentional to prevent duplicate submissions
- The check is per event - same student can submit for different events

### Issue: Google Apps Script deployment URL not working

**Solution:**
1. Go to Apps Script project
2. Click **"Deploy"** → **"Manage Deployments"**
3. Find the Web App deployment
4. Click **"Latest Version"** dropdown
5. Click the 3-dot menu → **"Edit Deployment"**
6. Change "Execute as" to your Google account
7. Click **"Update"**
8. Copy the URL again and update `.env`

### Issue: Frontend shows blank page

**Solution:**
1. Open browser dev tools (F12)
2. Check Console tab for errors
3. Common issues:
   - `VITE_GOOGLE_APPS_SCRIPT_URL` is not set
   - Syntax errors in environment variables
   - CORS issues with Apps Script URL

### Issue: "Access Denied" when accessing dashboard

**Solution:**
1. Verify the token is being stored in localStorage
2. Check browser console for errors
3. Try logging in again
4. Clear browser cache and try again

---

## Maintenance

### Regular Tasks

1. **Weekly:** Check attendance data and export for records
2. **Monthly:** Review admin logs (if extended)
3. **As needed:** Add new events to Events sheet
4. **As needed:** Update admin credentials in Admin sheet

### Backup Data

1. Regularly export attendance data using the "Export CSV" button
2. Save CSV files locally or in cloud storage
3. Periodically download the Google Sheet as backup

### Updating the System

1. Make code changes locally
2. Test with `npm run dev`
3. Build with `npm run build`
4. Deploy to Vercel/Netlify/GitHub Pages
5. Changes go live immediately

---

## Getting Help

- Check the [README.md](README.md) for customization options
- Review [GOOGLE_SHEETS_SCHEMA.md](GOOGLE_SHEETS_SCHEMA.md) for data structure
- Check Google Apps Script logs: **View** → **Logs**
- Browser DevTools Console for frontend errors (F12)

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Google Sheet shared only with trusted people
- [ ] Google Apps Script deployed with correct permissions
- [ ] Environment variables in deployment platform are set correctly
- [ ] Frontend URL is HTTPS only
- [ ] No sensitive data in git repository
- [ ] Regular backups of attendance data

---

## Next Steps

After successful deployment:

1. Add more events to the Events sheet as needed
2. Share the form URL with GDG members
3. Monitor submissions from the admin dashboard
4. Regularly export attendance data for records
5. Update admin password for security
