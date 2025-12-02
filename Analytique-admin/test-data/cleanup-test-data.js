const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'university_platform',
  user: 'postgres',
  password: 'admin123'
});

async function cleanupTestData() {
  console.log('🧹 CLEANING UP TEST DATA...\n');

  try {
    // Delete in correct order to respect foreign key constraints
    
    // 1. Delete teacher_subjects (has foreign keys to teachers and subjects)
    console.log('Deleting teacher_subjects...');
    const ts = await pool.query(`
      DELETE FROM teacher_subjects 
      WHERE teacher_id IN (1, 2, 3) 
      OR subject_id IN (
        SELECT id FROM subjects WHERE code IN ('CS101', 'CS102', 'CS103', 'CS201', 'MATH101')
      )
    `);
    console.log(`   ✓ Deleted ${ts.rowCount} teacher_subject assignments`);

    // 2. Delete subjects
    console.log('Deleting test subjects...');
    const subj = await pool.query(`
      DELETE FROM subjects 
      WHERE code IN ('CS101', 'CS102', 'CS103', 'CS201', 'MATH101')
    `);
    console.log(`   ✓ Deleted ${subj.rowCount} subjects`);

    // 3. Delete students (and their user accounts)
    console.log('Deleting test students...');
    const studUsers = await pool.query(`
      SELECT user_id FROM students 
      WHERE student_number IN ('STU2025001', 'STU2025002', 'STU2025003', 'STU2025004', 'STU2025005')
    `);
    
    if (studUsers.rows.length > 0) {
      const userIds = studUsers.rows.map(r => r.user_id);
      await pool.query(`DELETE FROM students WHERE user_id = ANY($1)`, [userIds]);
      await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [userIds]);
      console.log(`   ✓ Deleted ${studUsers.rows.length} students and their user accounts`);
    } else {
      console.log(`   ✓ No test students found`);
    }

    // 4. Delete teachers (and their user accounts)
    console.log('Deleting test teachers...');
    const teachUsers = await pool.query(`
      SELECT user_id FROM teachers 
      WHERE employee_id IN ('EMP-2001', 'EMP-2002', 'EMP-2003')
    `);
    
    if (teachUsers.rows.length > 0) {
      const userIds = teachUsers.rows.map(r => r.user_id);
      await pool.query(`DELETE FROM teachers WHERE user_id = ANY($1)`, [userIds]);
      await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [userIds]);
      console.log(`   ✓ Deleted ${teachUsers.rows.length} teachers and their user accounts`);
    } else {
      console.log(`   ✓ No test teachers found`);
    }

    // 5. Delete rooms
    console.log('Deleting test rooms...');
    const rooms = await pool.query(`
      DELETE FROM rooms 
      WHERE code IN ('LAB101', 'LAB102', 'AMP201', 'CLASS301', 'WS101')
    `);
    console.log(`   ✓ Deleted ${rooms.rowCount} rooms`);

    // 6. Delete groups
    console.log('Deleting test groups...');
    const groups = await pool.query(`
      DELETE FROM groups 
      WHERE code IN ('G3', 'G4', 'G2M')
    `);
    console.log(`   ✓ Deleted ${groups.rowCount} groups`);

    console.log('\n✅ CLEANUP COMPLETE! You can now import fresh test data.\n');
    
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

cleanupTestData();
