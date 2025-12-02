const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function checkExistingData() {
  const client = await pool.connect();
  
  try {
    console.log('\n📊 CURRENT DATABASE STATUS:');
    console.log('================================================');
    
    const tables = [
      'users', 'teachers', 'students', 'departments', 'specialties', 
      'levels', 'groups', 'subjects', 'rooms', 'teacher_subjects',
      'timetable_slots', 'sessions', 'absences', 'absence_requests',
      'makeup_sessions', 'messages', 'notifications'
    ];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table.padEnd(20)} : ${result.rows[0].count} rows`);
    }
    
    console.log('================================================\n');
    
    // Show existing users
    const users = await client.query(`
      SELECT id, email, role, first_name, last_name 
      FROM users 
      ORDER BY id 
      LIMIT 10
    `);
    
    if (users.rows.length > 0) {
      console.log('📋 EXISTING USERS:');
      users.rows.forEach(u => {
        console.log(`  [${u.id}] ${u.first_name} ${u.last_name} - ${u.email} (${u.role})`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkExistingData();
