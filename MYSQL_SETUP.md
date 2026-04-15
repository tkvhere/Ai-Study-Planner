# MySQL Database Setup Guide for AI Study Planner

## Prerequisites
- MySQL80 must be installed on your system
- MySQL server must be running

## Setup Instructions

### 1. Start MySQL80 Service (Windows)

**Option A: Using Services App (GUI)**
- Press `Win + R` and type `services.msc`
- Find `MYSQL80` in the list
- Right-click → Click "Start" (or change Startup Type to "Automatic")

**Option B: Using Command Prompt (Admin)**
- Open Command Prompt as Administrator
- Run: `net start MYSQL80`
- You should see: "The MYSQL80 service is starting. The MYSQL80 service has been started successfully."

### 2. Verify MySQL Connection
Run this command in PowerShell:
```powershell
mysql -h localhost -u root -p
```
- When prompted for password, press Enter (or use your password if you set one)
- If successful, you'll see: `mysql>`
- Type `exit;` to quit

### 3. Database Configuration

In `f:\Ai study Planner\backend\database.js`, update the configuration if needed:

```javascript
const dbConfig = {
  host: 'localhost',           // MySQL server address
  user: 'root',                // Default MySQL user
  password: '',                // Leave empty if no password set, otherwise enter your password
  database: 'ai_study_planner', // Will be created automatically
  port: 3306,                  // Default MySQL port
  // ... rest of config
};
```

### 4. Change MySQL Root Password (Optional)

If you want to set a password:
```command
mysql -h localhost -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
```

Then update `database.js`:
```javascript
password: 'your_password',
```

### 5. Start the Backend Server

Once MySQL is running:
```powershell
cd 'f:\Ai study Planner\backend'
npm start
```

You should see:
```
Backend server listening on port 5000
Database initialized successfully.
Database tables created/verified successfully.
```

### 6. Troubleshooting

**Error: "ECONNREFUSED 127.0.0.1:3306"**
- MySQL is not running. Start it using steps above.

**Error: "Access denied for user 'root'@'localhost'"**
- Password is incorrect. Update `database.js` with the correct password.

**Error: "Authentication plugin 'caching_sha2_password' cannot be loaded"**
- This is a MySQL driver issue. The code uses mysql2 which supports this.

**Database tables not created**
- Check error logs in the terminal output
- Ensure MySQL user has CREATE DATABASE and CREATE TABLE privileges

## Verification

Once servers are running, test the connection:
```powershell
$resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing
$resp.Content
```

Expected response:
```json
{"status":"ok","database":"connected"}
```
