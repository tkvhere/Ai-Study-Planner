const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'ai_study_planner',
  port: Number(process.env.MYSQL_PORT || 3306),
};

async function showData() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('\n✓ Connected to MySQL Database: ai_study_planner\n');

    // Show users
    console.log('═══════════════════════════════════════════════════════');
    console.log('USERS TABLE');
    console.log('═══════════════════════════════════════════════════════');
    const [users] = await connection.query('SELECT id, email, createdAt FROM users');
    if (users.length > 0) {
      console.table(users);
    } else {
      console.log('No users found.');
    }

    // Show profiles
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PROFILES TABLE');
    console.log('═══════════════════════════════════════════════════════');
    const [profiles] = await connection.query(
      'SELECT email, fullName, studentId, program, contactNo, dateOfBirth FROM profiles'
    );
    if (profiles.length > 0) {
      console.table(profiles);
    } else {
      console.log('No profiles found.');
    }

    // Show full profile details
    if (profiles.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('DETAILED PROFILE DATA');
      console.log('═══════════════════════════════════════════════════════');
      const [fullProfiles] = await connection.query('SELECT * FROM profiles');
      fullProfiles.forEach((profile, index) => {
        console.log(`\nProfile ${index + 1} - ${profile.email}:`);
        console.log(JSON.stringify(profile, null, 2));
      });
    }

    console.log('\n✓ Database query complete!\n');
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

showData();
