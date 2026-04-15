const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password', // MySQL root password
  database: process.env.MYSQL_DATABASE || 'ai_study_planner',
  port: Number(process.env.MYSQL_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
let pool = null;

const initializeDatabase = async () => {
  try {
    // First, create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    // Create database once and keep data across restarts
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`
    );
    console.log(`✓ Database '${dbConfig.database}' ready.`);
    await connection.end();

    // Create the pool
    pool = mysql.createPool(dbConfig);

    // Get a connection to create tables
    const poolConnection = await pool.getConnection();

    // Create users table
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
        salt VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        passwordHash VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create profiles table
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
        fullName VARCHAR(255),
        studentId VARCHAR(100),
        program VARCHAR(255),
        fatherName VARCHAR(255),
        motherName VARCHAR(255),
        permanentAddress TEXT,
        correspondenceAddress TEXT,
        contactNo VARCHAR(20),
        dateOfBirth VARCHAR(50),
        gender VARCHAR(50),
        classLevel VARCHAR(100),
        interests TEXT,
        targetCareer VARCHAR(255),
        location VARCHAR(255),
        photoUrl LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT profiles_ibfk_1 FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS practice_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        subject VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        level TINYINT NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        bestScore INT NULL,
        latestScore INT NULL,
        unlocked TINYINT(1) NOT NULL DEFAULT 0,
        completed TINYINT(1) NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_progress (email, subject, level),
        INDEX idx_progress_email (email),
        CONSTRAINT practice_progress_ibfk_1 FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
        CHECK (level >= 1 AND level <= 10)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Database tables created/verified successfully.');
    poolConnection.release();

    return pool;
  } catch (error) {
    console.error('\n❌ DATABASE INITIALIZATION ERROR:');
    console.error('Error Details:', error.message);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n📋 MySQL Connection Issues:');
      console.error('   • MySQL80 may not be running');
      console.error('   • Ensure MySQL80 service is started');
      console.error('   • Check service status: services.msc (Windows)');
      console.error('   • Or run: net start MYSQL80 (as Administrator)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔒 Authentication Error:');
      console.error('   • Check MySQL username and password in database.js');
      console.error('   • Default user: root (usually no password)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔌 Connection Refused:');
      console.error('   • MySQL is not listening on localhost:3306');
      console.error('   • Verify MySQL is running on the correct port');
    }
    
    console.error('\n📖 See MYSQL_SETUP.md in the project root for detailed setup instructions.\n');
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase first.');
  }
  return pool;
};

const getConnection = async () => {
  const pool = getPool();
  return await pool.getConnection();
};

// User operations
const createUser = async (email, salt, passwordHash) => {
  const connection = await getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO users (email, salt, passwordHash) VALUES (?, ?, ?)',
      [email, salt, passwordHash]
    );
    return result;
  } finally {
    connection.release();
  }
};

const getUserByEmail = async (email) => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

const getAllUsers = async () => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM users');
    return rows;
  } finally {
    connection.release();
  }
};

// Profile operations
const getProfileByEmail = async (email) => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM profiles WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

const createOrUpdateProfile = async (email, profileData) => {
  const connection = await getConnection();
  try {
    // Check if profile exists using the same connection.
    const [existingRows] = await connection.query(
      'SELECT id FROM profiles WHERE email = ?',
      [email]
    );
    const existing = existingRows.length > 0;

    if (existing) {
      // Update existing profile
      const [result] = await connection.query(
        `UPDATE profiles SET 
          fullName = ?, studentId = ?, program = ?, fatherName = ?, motherName = ?,
          permanentAddress = ?, correspondenceAddress = ?, contactNo = ?,
          dateOfBirth = ?, gender = ?, classLevel = ?, interests = ?,
          targetCareer = ?, location = ?, photoUrl = ?
         WHERE email = ?`,
        [
          profileData.fullName,
          profileData.studentId,
          profileData.program,
          profileData.fatherName,
          profileData.motherName,
          profileData.permanentAddress,
          profileData.correspondenceAddress,
          profileData.contactNo,
          profileData.dateOfBirth,
          profileData.gender,
          profileData.classLevel,
          profileData.interests,
          profileData.targetCareer,
          profileData.location,
          profileData.photoUrl,
          email,
        ]
      );
      return result;
    } else {
      // Create new profile
      const [result] = await connection.query(
        `INSERT INTO profiles 
          (email, fullName, studentId, program, fatherName, motherName,
           permanentAddress, correspondenceAddress, contactNo,
           dateOfBirth, gender, classLevel, interests, targetCareer, location, photoUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email,
          profileData.fullName,
          profileData.studentId,
          profileData.program,
          profileData.fatherName,
          profileData.motherName,
          profileData.permanentAddress,
          profileData.correspondenceAddress,
          profileData.contactNo,
          profileData.dateOfBirth,
          profileData.gender,
          profileData.classLevel,
          profileData.interests,
          profileData.targetCareer,
          profileData.location,
          profileData.photoUrl,
        ]
      );
      return result;
    }
  } finally {
    connection.release();
  }
};

const deleteProfileByEmail = async (email) => {
  const connection = await getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM profiles WHERE email = ?',
      [email]
    );
    return result;
  } finally {
    connection.release();
  }
};

const getPracticeProgressByEmail = async (email) => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT email, subject, level, attempts, bestScore, latestScore, unlocked, completed
       FROM practice_progress
       WHERE email = ?
       ORDER BY subject ASC, level ASC`,
      [email],
    );
    return rows;
  } finally {
    connection.release();
  }
};

const upsertPracticeProgressResult = async ({ email, subject, level, score, passed }) => {
  const connection = await getConnection();
  try {
    await connection.query(
      `INSERT INTO practice_progress (email, subject, level, attempts, bestScore, latestScore, unlocked, completed)
       VALUES (?, ?, ?, 1, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         attempts = attempts + 1,
         bestScore = GREATEST(COALESCE(bestScore, 0), VALUES(bestScore)),
         latestScore = VALUES(latestScore),
         unlocked = 1,
         completed = IF(VALUES(completed) = 1, 1, completed)`,
      [email, subject, level, score, score, passed ? 1 : 0],
    );

    if (passed && level < 10) {
      await connection.query(
        `INSERT INTO practice_progress (email, subject, level, attempts, bestScore, latestScore, unlocked, completed)
         VALUES (?, ?, ?, 0, NULL, NULL, 1, 0)
         ON DUPLICATE KEY UPDATE unlocked = 1`,
        [email, subject, level + 1],
      );
    }

    const [rows] = await connection.query(
      `SELECT email, subject, level, attempts, bestScore, latestScore, unlocked, completed
       FROM practice_progress
       WHERE email = ? AND subject = ? AND level = ?`,
      [email, subject, level],
    );

    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

module.exports = {
  initializeDatabase,
  getPool,
  getConnection,
  createUser,
  getUserByEmail,
  getAllUsers,
  getProfileByEmail,
  createOrUpdateProfile,
  deleteProfileByEmail,
  getPracticeProgressByEmail,
  upsertPracticeProgressResult,
};
