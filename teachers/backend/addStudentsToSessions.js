const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function addStudentsToSessions() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 CHECKING SESSIONS AND STUDENTS...\n');
    
    // Check which groups have sessions
    const sessionsWithGroups = await client.query(`
      SELECT DISTINCT 
        g.id as group_id,
        g.name as group_name,
        g.code as group_code,
        COUNT(DISTINCT sess.id) as session_count,
        COUNT(DISTINCT s.id) as student_count
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN students s ON s.group_id = g.id
      WHERE ts.teacher_id = 2
      GROUP BY g.id, g.name, g.code
      ORDER BY session_count DESC
    `);
    
    console.log('📊 Groups with Sessions (Teacher ID 2):');
    sessionsWithGroups.rows.forEach(g => {
      console.log(`  ${g.group_name} (${g.group_code}): ${g.session_count} sessions, ${g.student_count} students`);
    });
    
    // Get available students that can be reassigned
    const availableStudents = await client.query(`
      SELECT s.id, u.first_name, u.last_name, u.email, s.group_id, g.name as current_group
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      LEFT JOIN groups g ON s.group_id = g.id
      ORDER BY s.id
    `);
    
    console.log('\n\n👥 Available Students:');
    availableStudents.rows.forEach(s => {
      console.log(`  [${s.id}] ${s.first_name} ${s.last_name} - Currently in: ${s.current_group || 'No Group'}`);
    });
    
    // Now let's assign students to the group with sessions
    const targetGroup = sessionsWithGroups.rows[0]; // Group with most sessions
    
    console.log(`\n\n✨ Adding students to ${targetGroup.group_name}...\n`);
    
    await client.query('BEGIN');
    
    // Update first 8 students to be in this group
    const studentsToUpdate = availableStudents.rows.slice(0, 8);
    
    for (const student of studentsToUpdate) {
      await client.query(
        'UPDATE students SET group_id = $1 WHERE id = $2',
        [targetGroup.group_id, student.id]
      );
      console.log(`  ✓ Moved ${student.first_name} ${student.last_name} to ${targetGroup.group_name}`);
    }
    
    await client.query('COMMIT');
    
    console.log(`\n✅ Successfully added ${studentsToUpdate.length} students to ${targetGroup.group_name}`);
    
    // Verify
    const verification = await client.query(
      'SELECT COUNT(*) as count FROM students WHERE group_id = $1',
      [targetGroup.group_id]
    );
    
    console.log(`\n📊 Final count: ${verification.rows[0].count} students in ${targetGroup.group_name}`);
    
    // Show sample session with students
    console.log('\n\n📅 Sample Session Data:\n');
    const sampleSession = await client.query(`
      SELECT 
        sess.id,
        sess.session_date,
        sess.start_time,
        sess.status,
        subj.name as subject,
        g.name as group_name,
        COUNT(s.id) as student_count
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN students s ON s.group_id = g.id
      WHERE ts.teacher_id = 2 AND sess.status = 'completed'
      GROUP BY sess.id, sess.session_date, sess.start_time, sess.status, subj.name, g.name
      ORDER BY sess.session_date DESC
      LIMIT 3
    `);
    
    sampleSession.rows.forEach(s => {
      console.log(`Session #${s.id}: ${s.subject} - ${s.group_name}`);
      console.log(`  Date: ${s.session_date}, Time: ${s.start_time}`);
      console.log(`  Status: ${s.status}, Students: ${s.student_count}`);
      console.log('');
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addStudentsToSessions();
