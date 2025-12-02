const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function checkTeacherData() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 CHECKING TEACHER DATA FOR FRONTEND\n');
    
    // Check all teachers
    const teachers = await client.query(`
      SELECT t.id, u.email, u.first_name, u.last_name, t.employee_id
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.id
      ORDER BY t.id
    `);
    
    console.log('📋 ALL TEACHERS:');
    teachers.rows.forEach(t => {
      console.log(`  [Teacher ID: ${t.id}] ${t.first_name} ${t.last_name} - ${t.email}`);
    });
    
    // Check what teacher ID 1 has
    console.log('\n\n🔍 CHECKING TEACHER ID 1 DATA:\n');
    
    const timetable = await client.query(`
      SELECT COUNT(*) as count
      FROM timetable_slots
      WHERE teacher_id = 1 AND is_active = true
    `);
    console.log(`Timetable Slots: ${timetable.rows[0].count}`);
    
    const sessions = await client.query(`
      SELECT COUNT(*) as count
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      WHERE ts.teacher_id = 1
    `);
    console.log(`Sessions: ${sessions.rows[0].count}`);
    
    const subjects = await client.query(`
      SELECT COUNT(*) as count
      FROM teacher_subjects
      WHERE teacher_id = 1
    `);
    console.log(`Subjects Taught: ${subjects.rows[0].count}`);
    
    const groups = await client.query(`
      SELECT COUNT(DISTINCT group_id) as count
      FROM teacher_subjects
      WHERE teacher_id = 1
    `);
    console.log(`Groups Taught: ${groups.rows[0].count}`);
    
    const absenceRequests = await client.query(`
      SELECT COUNT(*) as count
      FROM absence_requests ar
      INNER JOIN absences a ON ar.absence_id = a.id
      INNER JOIN sessions sess ON a.session_id = sess.id
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      WHERE ts.teacher_id = 1
    `);
    console.log(`Absence Requests: ${absenceRequests.rows[0].count}`);
    
    // Now check teacher ID 2
    console.log('\n\n🔍 CHECKING TEACHER ID 2 DATA:\n');
    
    const timetable2 = await client.query(`
      SELECT COUNT(*) as count
      FROM timetable_slots
      WHERE teacher_id = 2 AND is_active = true
    `);
    console.log(`Timetable Slots: ${timetable2.rows[0].count}`);
    
    const sessions2 = await client.query(`
      SELECT COUNT(*) as count
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      WHERE ts.teacher_id = 2
    `);
    console.log(`Sessions: ${sessions2.rows[0].count}`);
    
    const subjects2 = await client.query(`
      SELECT COUNT(*) as count
      FROM teacher_subjects
      WHERE teacher_id = 2
    `);
    console.log(`Subjects Taught: ${subjects2.rows[0].count}`);
    
    const groups2 = await client.query(`
      SELECT COUNT(DISTINCT group_id) as count
      FROM teacher_subjects
      WHERE teacher_id = 2
    `);
    console.log(`Groups Taught: ${groups2.rows[0].count}`);
    
    const absenceRequests2 = await client.query(`
      SELECT COUNT(*) as count
      FROM absence_requests ar
      INNER JOIN absences a ON ar.absence_id = a.id
      INNER JOIN sessions sess ON a.session_id = sess.id
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      WHERE ts.teacher_id = 2
    `);
    console.log(`Absence Requests: ${absenceRequests2.rows[0].count}`);
    
    // Show actual sessions for teacher 2
    console.log('\n\n📅 SAMPLE SESSIONS FOR TEACHER ID 2:\n');
    const sampleSessions = await client.query(`
      SELECT 
        sess.id,
        sess.session_date,
        sess.start_time,
        sess.status,
        subj.name as subject,
        g.name as group_name
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN groups g ON ts.group_id = g.id
      WHERE ts.teacher_id = 2
      ORDER BY sess.session_date DESC
      LIMIT 5
    `);
    
    sampleSessions.rows.forEach(s => {
      console.log(`  Session #${s.id}: ${s.subject} - ${s.group_name} - ${s.session_date} ${s.start_time} (${s.status})`);
    });
    
    console.log('\n\n💡 RECOMMENDATION:');
    if (sessions2.rows[0].count > sessions.rows[0].count) {
      console.log('✅ Use Teacher ID 2 for testing - has more data!');
      const teacher2 = teachers.rows.find(t => t.id === 2);
      if (teacher2) {
        console.log(`   Login with: ${teacher2.email}`);
        console.log(`   Name: ${teacher2.first_name} ${teacher2.last_name}`);
      }
    } else {
      console.log('✅ Teacher ID 1 should work fine');
    }
    console.log('\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTeacherData();
