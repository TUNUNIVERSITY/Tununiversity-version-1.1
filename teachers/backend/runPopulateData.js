const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function populateTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database population...\n');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'populate_test_data.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('\n✅ Database population completed successfully!');
    
    // Display summary
    console.log('\n================================================');
    console.log('DATABASE SUMMARY');
    console.log('================================================');
    
    const counts = {
      users: await client.query('SELECT COUNT(*) FROM users'),
      admins: await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin'"),
      teachers: await client.query("SELECT COUNT(*) FROM users WHERE role = 'teacher'"),
      students: await client.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
      teachersTable: await client.query('SELECT COUNT(*) FROM teachers'),
      studentsTable: await client.query('SELECT COUNT(*) FROM students'),
      departments: await client.query('SELECT COUNT(*) FROM departments'),
      subjects: await client.query('SELECT COUNT(*) FROM subjects'),
      groups: await client.query('SELECT COUNT(*) FROM groups'),
      rooms: await client.query('SELECT COUNT(*) FROM rooms'),
      timetableSlots: await client.query('SELECT COUNT(*) FROM timetable_slots'),
      sessions: await client.query('SELECT COUNT(*) FROM sessions'),
      completedSessions: await client.query("SELECT COUNT(*) FROM sessions WHERE status = 'completed'"),
      scheduledSessions: await client.query("SELECT COUNT(*) FROM sessions WHERE status = 'scheduled'"),
      absences: await client.query('SELECT COUNT(*) FROM absences'),
      justifiedAbsences: await client.query("SELECT COUNT(*) FROM absences WHERE absence_type = 'justified'"),
      unjustifiedAbsences: await client.query("SELECT COUNT(*) FROM absences WHERE absence_type = 'unjustified'"),
      absenceRequests: await client.query('SELECT COUNT(*) FROM absence_requests'),
      pendingRequests: await client.query("SELECT COUNT(*) FROM absence_requests WHERE status = 'pending'"),
      approvedRequests: await client.query("SELECT COUNT(*) FROM absence_requests WHERE status = 'approved'"),
      rejectedRequests: await client.query("SELECT COUNT(*) FROM absence_requests WHERE status = 'rejected'"),
      makeupSessions: await client.query('SELECT COUNT(*) FROM makeup_sessions'),
      messages: await client.query('SELECT COUNT(*) FROM messages'),
      notifications: await client.query('SELECT COUNT(*) FROM notifications'),
    };
    
    console.log(`Users: ${counts.users.rows[0].count} total`);
    console.log(`  - Admins: ${counts.admins.rows[0].count}`);
    console.log(`  - Teachers: ${counts.teachers.rows[0].count}`);
    console.log(`  - Students: ${counts.students.rows[0].count}`);
    console.log('------------------------------------------------');
    console.log(`Teachers (detailed): ${counts.teachersTable.rows[0].count}`);
    console.log(`Students (detailed): ${counts.studentsTable.rows[0].count}`);
    console.log(`Departments: ${counts.departments.rows[0].count}`);
    console.log(`Subjects: ${counts.subjects.rows[0].count}`);
    console.log(`Groups: ${counts.groups.rows[0].count}`);
    console.log(`Rooms: ${counts.rooms.rows[0].count}`);
    console.log('------------------------------------------------');
    console.log(`Timetable Slots: ${counts.timetableSlots.rows[0].count}`);
    console.log(`Sessions: ${counts.sessions.rows[0].count}`);
    console.log(`  - Completed: ${counts.completedSessions.rows[0].count}`);
    console.log(`  - Scheduled: ${counts.scheduledSessions.rows[0].count}`);
    console.log('------------------------------------------------');
    console.log(`Absences: ${counts.absences.rows[0].count}`);
    console.log(`  - Justified: ${counts.justifiedAbsences.rows[0].count}`);
    console.log(`  - Unjustified: ${counts.unjustifiedAbsences.rows[0].count}`);
    console.log(`Absence Requests: ${counts.absenceRequests.rows[0].count}`);
    console.log(`  - Pending: ${counts.pendingRequests.rows[0].count}`);
    console.log(`  - Approved: ${counts.approvedRequests.rows[0].count}`);
    console.log(`  - Rejected: ${counts.rejectedRequests.rows[0].count}`);
    console.log('------------------------------------------------');
    console.log(`Makeup Sessions: ${counts.makeupSessions.rows[0].count}`);
    console.log(`Messages: ${counts.messages.rows[0].count}`);
    console.log(`Notifications: ${counts.notifications.rows[0].count}`);
    console.log('================================================');
    console.log('\n🎓 READY TO TEST YOUR TEACHER SERVICE!');
    console.log('================================================');
    console.log('📧 Teacher Login: ahmed.missaoui@university.edu');
    console.log('🔑 Password: (use your hashed password)');
    console.log('👤 Teacher ID: 1');
    console.log('📚 Teaching: Database Management Systems to G1-SE-2025');
    console.log('👥 Students: 10 students in the group');
    console.log('📅 Sessions: Multiple past and upcoming sessions');
    console.log('✉️  Messages: 6 messages to test messaging system');
    console.log('🔔 Notifications: Multiple notifications to test');
    console.log('================================================\n');
    
    // Display sample students for attendance testing
    console.log('📋 Sample Students for Attendance Testing:');
    const students = await client.query(`
      SELECT u.first_name, u.last_name, u.email, s.student_number
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.group_id = 1
      ORDER BY u.first_name
      LIMIT 5
    `);
    
    students.rows.forEach((student, idx) => {
      console.log(`   ${idx + 1}. ${student.first_name} ${student.last_name} (${student.student_number})`);
    });
    console.log(`   ... and ${counts.studentsTable.rows[0].count - 5} more students\n`);
    
  } catch (error) {
    console.error('❌ Error populating database:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

populateTestData();
