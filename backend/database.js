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

const userColumnDefinitions = [
  ['username', 'VARCHAR(100)'],
  ['emailVerified', 'TINYINT(1) NOT NULL DEFAULT 0'],
  ['accountStatus', "VARCHAR(20) NOT NULL DEFAULT 'active'"],
  ['lastLoginAt', 'TIMESTAMP NULL DEFAULT NULL'],
  ['lastLoginIp', 'VARCHAR(45)'],
  ['lastLoginUserAgent', 'TEXT'],
  ['loginCount', 'INT NOT NULL DEFAULT 0'],
];

const profileColumnDefinitions = [
  ['username', 'VARCHAR(100)'],
  ['fullName', 'VARCHAR(255)'],
  ['studentId', 'VARCHAR(100)'],
  ['program', 'VARCHAR(255)'],
  ['fatherName', 'VARCHAR(255)'],
  ['motherName', 'VARCHAR(255)'],
  ['phoneNumber', 'VARCHAR(20)'],
  ['permanentAddress', 'TEXT'],
  ['correspondenceAddress', 'TEXT'],
  ['contactNo', 'VARCHAR(20)'],
  ['dateOfBirth', 'VARCHAR(50)'],
  ['gender', 'VARCHAR(50)'],
  ['classLevel', 'VARCHAR(100)'],
  ['interests', 'TEXT'],
  ['bio', 'TEXT'],
  ['country', 'VARCHAR(100)'],
  ['state', 'VARCHAR(100)'],
  ['city', 'VARCHAR(100)'],
  ['targetCareer', 'VARCHAR(255)'],
  ['career', 'VARCHAR(255)'],
  ['location', 'VARCHAR(255)'],
  ['photoUrl', 'LONGTEXT'],
  ['profilePictureUrl', 'LONGTEXT'],
];

const careerPathAliases = {
  Engineering: ['engineering', 'engineer', 'engeneering', 'engg', 'btech', 'technology'],
  Medical: ['medical', 'doctor', 'mbbs', 'healthcare'],
  Commerce: ['commerce', 'bcom', 'business', 'finance', 'accounting'],
  Design: ['design', 'designer', 'architecture', 'animation', 'ui', 'ux'],
};

const normalizeCareerPath = (value) => {
  const text = String(value || '').trim().toLowerCase();

  if (!text) {
    return '';
  }

  const entry = Object.entries(careerPathAliases).find(([, aliases]) =>
    aliases.some((alias) => text.includes(alias)),
  );

  return entry ? entry[0] : '';
};

const practiceProgressCurricula = {
  Engineering: ['Mathematics', 'Physics', 'Chemistry'],
  Medical: ['Biology', 'Chemistry', 'Physics'],
  Commerce: ['Accountancy', 'Economics', 'Business Studies'],
  Design: ['Design Fundamentals', 'Color Theory', 'Composition'],
};

const getPracticeProgressSubjects = (careerPath) => {
  const normalizedCareerPath = normalizeCareerPath(careerPath) || 'Engineering';
  return practiceProgressCurricula[normalizedCareerPath] || practiceProgressCurricula.Engineering;
};

const activityLogDefinitions = `
  CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId INT NULL,
    email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    action VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    entityType VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    entityId VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    payload LONGTEXT,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_email (email),
    INDEX idx_activity_userId (userId),
    INDEX idx_activity_action (action),
    CONSTRAINT activity_logs_ibfk_1 FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT activity_logs_ibfk_2 FOREIGN KEY (email) REFERENCES users(email) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const userDataSnapshotDefinitions = `
  CREATE TABLE IF NOT EXISTS user_data_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId INT NULL,
    email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    category VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    payload LONGTEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_snapshot_user_category (email, category),
    INDEX idx_snapshot_userId (userId),
    INDEX idx_snapshot_category (category),
    CONSTRAINT user_data_snapshots_ibfk_1 FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT user_data_snapshots_ibfk_2 FOREIGN KEY (email) REFERENCES users(email) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const ensureTableColumn = async (connection, tableName, columnName, columnDefinition) => {
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`);
    return true;
  }

  return false;
};

const ensureColumns = async (connection, tableName, definitions) => {
  for (const [columnName, columnDefinition] of definitions) {
    await ensureTableColumn(connection, tableName, columnName, columnDefinition);
  }
};

const createJsonPayload = (value) => {
  return JSON.stringify(value ?? null);
};

const getDerivedUsername = (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail.includes('@')) {
    return '';
  }

  return normalizedEmail.split('@')[0].slice(0, 100);
};

const ensureUserSchema = async (connection) => {
  await ensureColumns(connection, 'users', userColumnDefinitions);

  await connection.query(
    `UPDATE users
     SET username = COALESCE(NULLIF(username, ''), SUBSTRING_INDEX(email, '@', 1))
     WHERE username IS NULL OR username = ''`,
  );
};

const ensureProfileSchema = async (connection) => {
  await ensureColumns(connection, 'profiles', profileColumnDefinitions);

  await connection.query(
    `UPDATE profiles
     SET username = COALESCE(NULLIF(username, ''), SUBSTRING_INDEX(email, '@', 1))
     WHERE username IS NULL OR username = ''`,
  );

  await connection.query(
    `UPDATE profiles
     SET targetCareer = COALESCE(NULLIF(targetCareer, ''), career)
     WHERE (targetCareer IS NULL OR targetCareer = '')
       AND career IS NOT NULL
       AND career <> ''`,
  );

  await connection.query(
    `UPDATE profiles
     SET career = COALESCE(NULLIF(career, ''), targetCareer)
     WHERE (career IS NULL OR career = '')
       AND targetCareer IS NOT NULL
       AND targetCareer <> ''`,
  );

  const [profiles] = await connection.query('SELECT id, targetCareer, career FROM profiles');
  for (const profile of profiles) {
    const canonicalCareer = normalizeCareerPath(profile.targetCareer || profile.career);

    if (canonicalCareer && (profile.targetCareer !== canonicalCareer || profile.career !== canonicalCareer)) {
      await connection.query(
        'UPDATE profiles SET targetCareer = ?, career = ? WHERE id = ?',
        [canonicalCareer, canonicalCareer, profile.id],
      );
    }
  }
};

const ensureAuditSchema = async (connection) => {
  await connection.query(activityLogDefinitions);
  await connection.query(userDataSnapshotDefinitions);
};

const recordActivity = async ({ email = null, userId = null, action, entityType = null, entityId = null, payload = null, ipAddress = null, userAgent = null }) => {
  const connection = await getConnection();
  try {
    await connection.query(
      `INSERT INTO activity_logs (userId, email, action, entityType, entityId, payload, ipAddress, userAgent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email,
        action,
        entityType,
        entityId,
        createJsonPayload(payload),
        ipAddress,
        userAgent,
      ],
    );
  } finally {
    connection.release();
  }
};

const upsertUserSnapshot = async ({ email = null, userId = null, category, payload = {} }) => {
  const connection = await getConnection();
  try {
    await connection.query(
      `INSERT INTO user_data_snapshots (userId, email, category, payload)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         userId = VALUES(userId),
         payload = VALUES(payload),
         updatedAt = CURRENT_TIMESTAMP`,
      [userId, email, category, createJsonPayload(payload)],
    );
  } finally {
    connection.release();
  }
};

const getUserIdentity = async (email) => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query('SELECT id, email FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

const updateUserLoginMetadata = async ({ email, ipAddress = null, userAgent = null }) => {
  const connection = await getConnection();
  try {
    await connection.query(
      `UPDATE users
       SET lastLoginAt = CURRENT_TIMESTAMP,
           lastLoginIp = ?,
           lastLoginUserAgent = ?,
           loginCount = loginCount + 1,
           accountStatus = 'active'
       WHERE email = ?`,
      [ipAddress, userAgent, email],
    );
  } finally {
    connection.release();
  }
};

const seedPracticeProgressForEmail = async ({ email, careerPath }) => {
  const connection = await getConnection();
  try {
    const subjects = getPracticeProgressSubjects(careerPath);

    for (const subject of subjects) {
      for (let level = 1; level <= 10; level += 1) {
        await connection.query(
          `INSERT IGNORE INTO practice_progress (email, subject, level, attempts, bestScore, latestScore, unlocked, completed)
           VALUES (?, ?, ?, 0, NULL, NULL, ?, 0)`,
          [email, subject, level, level === 1 ? 1 : 0],
        );
      }
    }
  } finally {
    connection.release();
  }
};

const backfillPracticeProgressForProfiles = async () => {
  const connection = await getConnection();
  try {
    const [profiles] = await connection.query('SELECT email, targetCareer, career FROM profiles');

    for (const profile of profiles) {
      await seedPracticeProgressForEmail({
        email: profile.email,
        careerPath: normalizeCareerPath(profile.targetCareer || profile.career) || 'Engineering',
      });
    }
  } finally {
    connection.release();
  }
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
        username VARCHAR(100),
        emailVerified TINYINT(1) NOT NULL DEFAULT 0,
        accountStatus VARCHAR(20) NOT NULL DEFAULT 'active',
        lastLoginAt TIMESTAMP NULL DEFAULT NULL,
        lastLoginIp VARCHAR(45),
        lastLoginUserAgent TEXT,
        loginCount INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await ensureUserSchema(poolConnection);

    // Create profiles table
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
        username VARCHAR(100),
        fullName VARCHAR(255),
        studentId VARCHAR(100),
        program VARCHAR(255),
        fatherName VARCHAR(255),
        motherName VARCHAR(255),
        phoneNumber VARCHAR(20),
        permanentAddress TEXT,
        correspondenceAddress TEXT,
        contactNo VARCHAR(20),
        dateOfBirth VARCHAR(50),
        gender VARCHAR(50),
        classLevel VARCHAR(100),
        interests TEXT,
        bio TEXT,
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        targetCareer VARCHAR(255),
        career VARCHAR(255),
        location VARCHAR(255),
        photoUrl LONGTEXT,
        profilePictureUrl LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT profiles_ibfk_1 FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await ensureProfileSchema(poolConnection);

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

    await ensureAuditSchema(poolConnection);

    await backfillPracticeProgressForProfiles();

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
    const username = getDerivedUsername(email);
    const [result] = await connection.query(
      `INSERT INTO users
        (email, salt, passwordHash, username, emailVerified, accountStatus, loginCount)
       VALUES (?, ?, ?, ?, 0, 'active', 0)`,
      [email, salt, passwordHash, username]
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
    if (rows.length === 0) {
      return null;
    }

    return {
      ...rows[0],
      username: rows[0].username || getDerivedUsername(rows[0].email),
      emailVerified: Number(rows[0].emailVerified) || 0,
      accountStatus: rows[0].accountStatus || 'active',
      loginCount: Number(rows[0].loginCount) || 0,
    };
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

const getAllProfiles = async () => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM profiles ORDER BY updatedAt DESC, createdAt DESC');
    return rows.map((row) => ({
      ...row,
      targetCareer: normalizeCareerPath(row.targetCareer || row.career) || row.targetCareer || row.career || '',
      career: normalizeCareerPath(row.career || row.targetCareer) || row.career || row.targetCareer || '',
    }));
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
    if (rows.length === 0) {
      return null;
    }

    return {
      ...rows[0],
      username: rows[0].username || getDerivedUsername(rows[0].email),
      phoneNumber: rows[0].phoneNumber || rows[0].contactNo || '',
      bio: rows[0].bio || '',
      country: rows[0].country || '',
      state: rows[0].state || '',
      city: rows[0].city || '',
      targetCareer: normalizeCareerPath(rows[0].targetCareer || rows[0].career) || rows[0].targetCareer || rows[0].career || '',
      career: normalizeCareerPath(rows[0].career || rows[0].targetCareer) || rows[0].career || rows[0].targetCareer || '',
      profilePictureUrl: rows[0].profilePictureUrl || rows[0].photoUrl || '',
    };
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
          username = ?, fullName = ?, studentId = ?, program = ?, fatherName = ?, motherName = ?,
          phoneNumber = ?, permanentAddress = ?, correspondenceAddress = ?, contactNo = ?,
          dateOfBirth = ?, gender = ?, classLevel = ?, interests = ?, bio = ?, country = ?, state = ?, city = ?,
          targetCareer = ?, career = ?, location = ?, photoUrl = ?, profilePictureUrl = ?
         WHERE email = ?`,
        [
          profileData.username || getDerivedUsername(email),
          profileData.fullName,
          profileData.studentId,
          profileData.program,
          profileData.fatherName,
          profileData.motherName,
          profileData.phoneNumber || profileData.contactNo,
          profileData.permanentAddress,
          profileData.correspondenceAddress,
          profileData.contactNo,
          profileData.dateOfBirth,
          profileData.gender,
          profileData.classLevel,
          profileData.interests,
          profileData.bio,
          profileData.country,
          profileData.state,
          profileData.city,
          profileData.targetCareer,
          profileData.targetCareer,
          profileData.location,
          profileData.photoUrl,
          profileData.photoUrl,
          email,
        ]
      );
      return result;
    } else {
      // Create new profile
      const [result] = await connection.query(
        `INSERT INTO profiles 
          (email, username, fullName, studentId, program, fatherName, motherName,
           phoneNumber, permanentAddress, correspondenceAddress, contactNo,
           dateOfBirth, gender, classLevel, interests, bio, country, state, city,
           targetCareer, career, location, photoUrl, profilePictureUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email,
          profileData.username || getDerivedUsername(email),
          profileData.fullName,
          profileData.studentId,
          profileData.program,
          profileData.fatherName,
          profileData.motherName,
          profileData.phoneNumber || profileData.contactNo,
          profileData.permanentAddress,
          profileData.correspondenceAddress,
          profileData.contactNo,
          profileData.dateOfBirth,
          profileData.gender,
          profileData.classLevel,
          profileData.interests,
          profileData.bio,
          profileData.country,
          profileData.state,
          profileData.city,
          profileData.targetCareer,
          profileData.targetCareer,
          profileData.location,
          profileData.photoUrl,
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

const getPracticeProgressSummary = async () => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT email,
              COUNT(*) AS totalRecords,
              SUM(completed) AS completedCount,
              SUM(unlocked) AS unlockedCount,
              MAX(updatedAt) AS lastActivityAt
       FROM practice_progress
       GROUP BY email`,
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
  getAllProfiles,
  getProfileByEmail,
  createOrUpdateProfile,
  deleteProfileByEmail,
  getPracticeProgressByEmail,
  getPracticeProgressSummary,
  upsertPracticeProgressResult,
  seedPracticeProgressForEmail,
  backfillPracticeProgressForProfiles,
  normalizeCareerPath,
    recordActivity,
    upsertUserSnapshot,
    getUserIdentity,
    updateUserLoginMetadata,
};
