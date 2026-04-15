# MySQL Database Integration - Complete Setup Guide

## ✅ What Has Been Completed

### Backend Changes
1. **Installed MySQL driver**: `npm install mysql2` ✓
2. **Created database.js module** ✓
   - Handles all database connections
   - Manages connection pooling
   - Provides helper functions for users and profiles

3. **Updated server.js** ✓
   - Replaced all JSON file operations with MySQL queries
   - Updated endpoints: `/api/login`, `/api/profile` (GET/POST), `/api/health`, `/api/auth/status`
   - Added async/await for database operations
   - Improved error handling

4. **Database Schema** ✓
   - **users table**: Stores email, password hash, salt, timestamps
   - **profiles table**: Stores student profile details (name, ID, program, addresses, contact, etc.)
   - Foreign key relationship between profiles and users
   - Indexes on email for fast lookups

## ⚠️ What You Need to Do

### Step 1: Start MySQL80 Service
Choose one method:

**Option A - GUI (Easiest)**
1. Press `Win+R`
2. Type `services.msc` and press Enter
3. Scroll down and find "MYSQL80"
4. Right-click on it
5. Click "Start" (or "Properties" → "Startup type" → "Automatic" for auto-start)
6. Wait 2-3 seconds until status shows "Running"

**Option B - PowerShell (Admin)**
1. Right-click PowerShell → "Run as Administrator"
2. Copy-paste this:
```powershell
Start-Service -Name MYSQL80
Start-Sleep -Seconds 2
Get-Service -Name MYSQL80 | Select-Object Name, Status
```
3. Should show "Running"

**Option C - Command Prompt (Admin)**
1. Right-click Command Prompt → "Run as Administrator"
2. Run: `net start MYSQL80`

### Step 2: Verify MySQL Connection
Open PowerShell and run:
```powershell
mysql -h localhost -u root -p
```
- Press Enter when asked for password (no password by default)
- You should see `mysql>` prompt
- Type `exit;` and press Enter

### Step 3: Start the Backend Server
Open PowerShell and run:
```powershell
cd 'f:\Ai study Planner\backend'
npm start
```

You should see:
```
Backend server listening on port 5000
✓ Database 'ai_study_planner' ready.
✓ Database tables created/verified successfully.
```

### Step 4: Start the Frontend (if not running)
Open another PowerShell and run:
```powershell
cd 'f:\Ai study Planner\my-app'
npm start
```

## 📁 New Files Created

1. **backend/database.js** - MySQL connection and operations module
2. **MYSQL_SETUP.md** - Detailed setup instructions (in project root)

## 🔄 How Data Now Flows

```
React App (Port 3000)
    ↓
Express Backend (Port 5000) ← NEW CODE
    ↓
MySQL Database (Port 3306)
```

**Before**: Data → JSON files on disk
**Now**: Data → MySQL database with proper schema

## ✨ Benefits of MySQL Integration

✓ Persistent data storage with proper database structure
✓ Support for multiple users with no file conflicts
✓ Fast lookups with database indexes
✓ Data integrity with foreign keys
✓ Scalable for future features
✓ Professional database solution

## 🔐 Default MySQL Credentials

- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: (empty - press Enter when asked)

To change the password or credentials, edit `backend/database.js` line 4-12.

## 📊 Database Schema

### users table
```
id (PK)           | INT PRIMARY KEY AUTO_INCREMENT
email (UNIQUE)    | VARCHAR(255) - Login email
salt              | VARCHAR(255) - Password salt for hashing
passwordHash      | VARCHAR(255) - Hashed password
createdAt         | TIMESTAMP
updatedAt         | TIMESTAMP
```

### profiles table
```
id (PK)                  | INT PRIMARY KEY AUTO_INCREMENT
email (FK, UNIQUE)       | VARCHAR(255) - Links to users.email
fullName                 | VARCHAR(255)
studentId                | VARCHAR(100)
program                  | VARCHAR(255)
fatherName               | VARCHAR(255)
motherName               | VARCHAR(255)
permanentAddress         | TEXT
correspondenceAddress    | TEXT
contactNo                | VARCHAR(20)
dateOfBirth              | VARCHAR(50)
gender                   | VARCHAR(50)
classLevel               | VARCHAR(100)
interests                | TEXT
targetCareer             | VARCHAR(255)
location                 | VARCHAR(255)
photoUrl                 | LONGTEXT (for base64 encoded images)
createdAt                | TIMESTAMP
updatedAt                | TIMESTAMP
```

## 🧪 Test the API After Setup

Once MySQL is running and servers are started, test these endpoints:

**Health Check**:
```powershell
$resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing
$resp.Content
# Expected: {"status":"ok","database":"connected"}
```

**Create User/Login**:
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    rememberMe = $true
} | ConvertTo-Json

$resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/login' `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body `
    -UseBasicParsing

$resp.Content | ConvertFrom-Json | Format-Table
```

**Get Profile**:
```powershell
$resp = Invoke-WebRequest -Uri 'http://localhost:3000/api/profile?email=test@example.com' -UseBasicParsing
$resp.Content | ConvertFrom-Json | Format-Table
```

## ❌ Troubleshooting

### "ECONNREFUSED 127.0.0.1:3306"
**Solution**: MySQL is not running
- Start MySQL using Step 1 above
- Check if MYSQL80 service is running: `Get-Service MYSQL80 | Select Status`

### "Access denied for user 'root'@'localhost'"
**Solution**: Password is incorrect
- Default password is empty (just press Enter)
- If you set one, update `backend/database.js` line 6

### "Can't connect to MySQL server"
**Most likely causes**:
1. MySQL not installed
2. MySQL stopped/not running
3. Connection string wrong in database.js
4. Port 3306 firewalled

**Fix**:
- Verify MySQL is running: Check services.msc
- Check connection settings: Edit `backend/database.js`
- Ensure port 3306 is accessible

## 📝 Next Steps

1. Start MySQL80 service (see Step 1 above)
2. Run backend: `npm start` in backend folder
3. Backend will automatically create database and tables
4. Run frontend: `npm start` in my-app folder
5. Open http://localhost:3000 and test the app

## 🎯 Success Indicators

✓ Backend shows "Database 'ai_study_planner' ready."
✓ Backend shows "Database tables created/verified successfully."
✓ Endpoints respond with data from MySQL
✓ Profile data saves and loads persistently
✓ Multiple users can login independently

---

**Questions?** Check MYSQL_SETUP.md for more detailed instructions.
