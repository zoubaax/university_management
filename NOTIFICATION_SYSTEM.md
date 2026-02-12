# Notification System - Implementation Summary

## Overview
A complete notification system for the university management platform that alerts users about important events and actions.

## Features Implemented

### Backend (API)
✅ **Database Schema**
- `notifications` table with:
  - User ID (recipient)
  - Type (file_upload, certificate_request, absence_alert, grade_posted, announcement, general)
  - Title and message
  - Optional link to related page
  - Related entity ID
  - Read/unread status
  - Timestamps

✅ **API Endpoints** (`/api/v1/notifications`)
- `GET /` - Get user's notifications
- `GET /unread/count` - Get unread notification count
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `DELETE /:id` - Delete notification
- `POST /announcement` - Create announcement (admin only)

✅ **Helper Methods**
- `notifyFileUpload()` - Notify when student uploads file
- `notifyCertificateRequest()` - Notify when student requests certificate
- `notifyAbsence()` - Notify when student is marked absent
- `notifyGradePosted()` - Notify student when grade is posted
- `createAnnouncement()` - Send announcement to multiple users

### Frontend (UI)

✅ **NotificationBell Component**
- **Bell Icon** in header with unread count badge
- **Dropdown Panel** showing recent notifications (up to 20)
- **Auto-refresh** every 30 seconds
- **Click to navigate** to related page
- **Mark as read** automatically when clicked
- **Mark all as read** button
- **Delete** individual notifications
- **Icon indicators** for different notification types:
  - 📄 File Upload (blue)
  - 🎓 Certificate Request (purple)
  - ⚠️ Absence Alert (red)
  - 📈 Grade Posted (green)
  - 📢 Announcement (orange)

## Notification Types

### 1. File Upload Alert
**Trigger**: Student uploads a file
**Recipients**: Professor, Department Head
**Example**: "John Doe uploaded a new file: Assignment1.pdf"

### 2. Certificate Request
**Trigger**: Student requests a certificate
**Recipients**: Department Head, Responsible Department
**Example**: "Jane Smith requested a Enrollment Certificate"

### 3. Absence Alert
**Trigger**: Professor marks student absent
**Recipients**: Student, Department Head
**Example**: "You were marked absent in Mathematics on Feb 12, 2026"

### 4. Grade Posted
**Trigger**: Professor posts a grade
**Recipients**: Student
**Example**: "Your grade for Physics has been posted: 85/100"

### 5. Announcement
**Trigger**: Admin creates announcement
**Recipients**: Selected users/roles
**Example**: "Campus will be closed on Monday for maintenance"

## How to Use

### For Developers - Triggering Notifications

#### Example 1: Notify when file is uploaded
```javascript
const Notification = require('../models/Notification');

// In your file upload controller
const professorUserId = '...'; // Get professor's user_id
const departmentHeadUserId = '...'; // Get department head's user_id

await Notification.notifyFileUpload(
    studentName,
    fileName,
    fileId,
    [professorUserId, departmentHeadUserId]
);
```

#### Example 2: Notify when certificate is requested
```javascript
// In your certificate request controller
const responsibleDeptUserIds = [...]; // Get user_ids of department staff

await Notification.notifyCertificateRequest(
    studentName,
    studentId,
    certificateType,
    responsibleDeptUserIds
);
```

#### Example 3: Notify when grade is posted
```javascript
// In your grade controller
const studentUserId = '...'; // Get student's user_id

await Notification.notifyGradePosted(
    studentUserId,
    moduleName,
    grade
);
```

#### Example 4: Create announcement
```javascript
// Admin creates announcement
const allUserIds = [...]; // Get all user_ids to notify

await Notification.createAnnouncement(
    'Campus Closure',
    'Campus will be closed on Monday for maintenance',
    allUserIds,
    '/announcements'
);
```

### For Users

1. **View Notifications**
   - Click the bell icon (🔔) in the header
   - See unread count badge
   - Dropdown shows recent notifications

2. **Read Notifications**
   - Click on any notification
   - Automatically marked as read
   - Navigates to related page if available

3. **Manage Notifications**
   - Mark all as read (button in dropdown)
   - Delete individual notifications (X button)
   - Unread notifications have blue dot indicator

## Integration Points

### Where to Add Notifications

1. **File Upload** (`courseResource.js` controller)
   ```javascript
   // After file is uploaded
   await Notification.notifyFileUpload(...);
   ```

2. **Certificate Request** (`certificate.js` controller)
   ```javascript
   // After certificate request is created
   await Notification.notifyCertificateRequest(...);
   ```

3. **Absence Marking** (`studentAttendance.js` controller)
   ```javascript
   // After marking student absent
   await Notification.notifyAbsence(...);
   ```

4. **Grade Posting** (`grade.js` controller)
   ```javascript
   // After grade is posted
   await Notification.notifyGradePosted(...);
   ```

## Files Created/Modified

### Backend
- ✅ `backend/src/models/Notification.js` - Notification model
- ✅ `backend/src/controllers/notifications.js` - Notification controllers
- ✅ `backend/src/routes/notifications.js` - API routes
- ✅ `backend/src/migrations/011_create_notifications.sql` - Database schema
- ✅ `backend/src/runNotificationsMigration.js` - Migration runner
- ✅ `backend/src/app.js` - Registered notification routes

### Frontend
- ✅ `frontend/src/api/services/notificationService.js` - API client
- ✅ `frontend/src/components/NotificationBell.jsx` - Notification bell component
- ✅ `frontend/src/layouts/DashboardLayout.jsx` - Added NotificationBell to header

## Next Steps - Integration

To make the system fully functional, you need to integrate notifications into existing features:

### 1. File Upload Integration
Edit: `backend/src/controllers/courseResource.js`
```javascript
// Add after successful file upload
const Notification = require('../models/Notification');

// Get professor and department head user IDs
const professorUserId = ...; // From class/module
const deptHeadUserId = ...; // From department

await Notification.notifyFileUpload(
    req.user.first_name + ' ' + req.user.last_name,
    req.file.originalname,
    resource.id,
    [professorUserId, deptHeadUserId]
);
```

### 2. Certificate Request Integration
Edit: `backend/src/controllers/certificate.js`
```javascript
// Add after certificate request is created
const Notification = require('../models/Notification');

// Get department staff user IDs
const deptStaffUserIds = ...; // Query from database

await Notification.notifyCertificateRequest(
    studentName,
    studentId,
    certificateType,
    deptStaffUserIds
);
```

### 3. Absence Integration
Edit: `backend/src/controllers/studentAttendance.js`
```javascript
// Add after marking absent
const Notification = require('../models/Notification');

// Get student user ID
const studentUserId = ...; // From student record

await Notification.notifyAbsence(
    studentName,
    className,
    date,
    [studentUserId]
);
```

### 4. Grade Integration
Edit: `backend/src/controllers/grade.js`
```javascript
// Add after grade is posted
const Notification = require('../models/Notification');

// Get student user ID
const studentUserId = ...; // From student record

await Notification.notifyGradePosted(
    studentUserId,
    moduleName,
    grade
);
```

## Testing

1. ✅ Database migration successful
2. ✅ Backend API endpoints working
3. ✅ Frontend service connected
4. ✅ NotificationBell component renders
5. ✅ Bell icon in header
6. [ ] Test notification creation
7. [ ] Test notification display
8. [ ] Test mark as read
9. [ ] Test delete
10. [ ] Test auto-refresh

---

**Status**: ✅ Complete - Ready for Integration
**Last Updated**: February 12, 2026
