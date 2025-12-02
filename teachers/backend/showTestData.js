const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function showTestData() {
  const client = await pool.connect();
  
  try {
    console.log('\n════════════════════════════════════════════════');
    console.log('     📚 UNIVERSITY PLATFORM - TEST DATA OVERVIEW');
    console.log('════════════════════════════════════════════════\n');
    
    // =====================================================
    // 1. TEACHERS
    // =====================================================
    console.log('👨‍🏫 TEACHERS:');
    console.log('────────────────────────────────────────────────');
    const teachers = await client.query(`
      SELECT t.id, u.first_name, u.last_name, u.email, t.employee_id, 
             t.specialization, t.phone, d.name as department
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN departments d ON t.department_id = d.id
      ORDER BY t.id
    `);
    
    teachers.rows.forEach(t => {
      console.log(`\n[ID: ${t.id}] ${t.first_name} ${t.last_name}`);
      console.log(`  📧 Email: ${t.email}`);
      console.log(`  🆔 Employee ID: ${t.employee_id}`);
      console.log(`  🏢 Department: ${t.department}`);
      console.log(`  💼 Specialization: ${t.specialization}`);
      console.log(`  📱 Phone: ${t.phone}`);
    });
    
    // =====================================================
    // 2. STUDENTS IN GROUPS
    // =====================================================
    console.log('\n\n👥 STUDENTS BY GROUP:');
    console.log('────────────────────────────────────────────────');
    const groups = await client.query(`
      SELECT g.id, g.name, g.code, COUNT(s.id) as student_count
      FROM groups g
      LEFT JOIN students s ON g.id = s.group_id
      GROUP BY g.id, g.name, g.code
      ORDER BY g.id
    `);
    
    for (const group of groups.rows) {
      console.log(`\n📚 ${group.name} (${group.code}) - ${group.student_count} students`);
      
      if (group.student_count > 0) {
        const students = await client.query(`
          SELECT u.first_name, u.last_name, u.email, s.student_number
          FROM students s
          INNER JOIN users u ON s.user_id = u.id
          WHERE s.group_id = $1
          ORDER BY u.first_name
        `, [group.id]);
        
        students.rows.forEach((st, idx) => {
          console.log(`  ${idx + 1}. ${st.first_name} ${st.last_name} (${st.student_number}) - ${st.email}`);
        });
      }
    }
    
    // =====================================================
    // 3. SESSIONS AND SCHEDULE
    // =====================================================
    console.log('\n\n📅 CLASS SESSIONS:');
    console.log('────────────────────────────────────────────────');
    const sessions = await client.query(`
      SELECT 
        sess.id,
        sess.session_date,
        sess.start_time,
        sess.end_time,
        sess.status,
        subj.name as subject,
        subj.code as subject_code,
        g.name as group_name,
        r.name as room,
        u.first_name || ' ' || u.last_name as teacher_name
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN groups g ON ts.group_id = g.id
      INNER JOIN rooms r ON sess.room_id = r.id
      INNER JOIN teachers t ON ts.teacher_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      ORDER BY sess.session_date DESC, sess.start_time
      LIMIT 15
    `);
    
    sessions.rows.forEach(s => {
      const statusIcon = s.status === 'completed' ? '✅' : s.status === 'in_progress' ? '🔄' : '📆';
      console.log(`\n${statusIcon} Session #${s.id} - ${s.status.toUpperCase()}`);
      console.log(`  📚 ${s.subject} (${s.subject_code})`);
      console.log(`  👥 Group: ${s.group_name}`);
      console.log(`  👨‍🏫 Teacher: ${s.teacher_name}`);
      console.log(`  📅 Date: ${s.session_date}`);
      console.log(`  ⏰ Time: ${s.start_time} - ${s.end_time}`);
      console.log(`  🏛️  Room: ${s.room}`);
    });
    
    // =====================================================
    // 4. ABSENCES
    // =====================================================
    console.log('\n\n❌ STUDENT ABSENCES:');
    console.log('────────────────────────────────────────────────');
    const absences = await client.query(`
      SELECT 
        a.id,
        a.absence_type,
        u.first_name || ' ' || u.last_name as student_name,
        subj.name as subject,
        sess.session_date
      FROM absences a
      INNER JOIN students st ON a.student_id = st.id
      INNER JOIN users u ON st.user_id = u.id
      INNER JOIN sessions sess ON a.session_id = sess.id
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      ORDER BY sess.session_date DESC
      LIMIT 10
    `);
    
    console.log(`\nTotal Absences: ${absences.rows.length}`);
    absences.rows.forEach(a => {
      const typeIcon = a.absence_type === 'justified' ? '✅' : '❌';
      console.log(`  ${typeIcon} ${a.student_name} - ${a.subject} (${a.session_date}) - ${a.absence_type}`);
    });
    
    // =====================================================
    // 5. ABSENCE REQUESTS
    // =====================================================
    console.log('\n\n📝 ABSENCE JUSTIFICATION REQUESTS:');
    console.log('────────────────────────────────────────────────');
    const requests = await client.query(`
      SELECT 
        ar.id,
        ar.status,
        ar.request_reason,
        u.first_name || ' ' || u.last_name as student_name,
        ar.created_at
      FROM absence_requests ar
      INNER JOIN students st ON ar.student_id = st.id
      INNER JOIN users u ON st.user_id = u.id
      ORDER BY ar.created_at DESC
      LIMIT 10
    `);
    
    requests.rows.forEach(r => {
      const statusIcon = r.status === 'approved' ? '✅' : r.status === 'rejected' ? '❌' : '⏳';
      console.log(`\n${statusIcon} Request #${r.id} - ${r.status.toUpperCase()}`);
      console.log(`  👤 Student: ${r.student_name}`);
      console.log(`  📄 Reason: ${r.request_reason}`);
      console.log(`  📅 Submitted: ${new Date(r.created_at).toLocaleString()}`);
    });
    
    // =====================================================
    // 6. MESSAGES
    // =====================================================
    console.log('\n\n✉️  MESSAGES:');
    console.log('────────────────────────────────────────────────');
    const messages = await client.query(`
      SELECT 
        m.id,
        m.subject,
        m.is_read,
        sender.first_name || ' ' || sender.last_name as sender_name,
        sender.role as sender_role,
        recipient.first_name || ' ' || recipient.last_name as recipient_name,
        recipient.role as recipient_role,
        m.created_at
      FROM messages m
      INNER JOIN users sender ON m.sender_id = sender.id
      INNER JOIN users recipient ON m.recipient_id = recipient.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `);
    
    messages.rows.forEach(m => {
      const readIcon = m.is_read ? '📖' : '📬';
      console.log(`\n${readIcon} Message #${m.id}`);
      console.log(`  ✉️  Subject: ${m.subject}`);
      console.log(`  📤 From: ${m.sender_name} (${m.sender_role})`);
      console.log(`  📥 To: ${m.recipient_name} (${m.recipient_role})`);
      console.log(`  📅 Date: ${new Date(m.created_at).toLocaleString()}`);
    });
    
    // =====================================================
    // 7. NOTIFICATIONS
    // =====================================================
    console.log('\n\n🔔 NOTIFICATIONS:');
    console.log('────────────────────────────────────────────────');
    const notifications = await client.query(`
      SELECT 
        n.id,
        n.title,
        n.message,
        n.notification_type,
        n.is_read,
        u.first_name || ' ' || u.last_name as user_name,
        u.role
      FROM notifications n
      INNER JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 10
    `);
    
    notifications.rows.forEach(n => {
      const readIcon = n.is_read ? '✅' : '🔔';
      const typeIcon = {
        'absence': '❌',
        'timetable': '📅',
        'grade': '📊',
        'general': '📢',
        'alert': '⚠️'
      }[n.notification_type] || '📢';
      
      console.log(`\n${readIcon}${typeIcon} ${n.title}`);
      console.log(`  👤 For: ${n.user_name} (${n.role})`);
      console.log(`  💬 ${n.message}`);
    });
    
    // =====================================================
    // FINAL SUMMARY
    // =====================================================
    const finalCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM teachers) as teachers,
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM sessions) as sessions,
        (SELECT COUNT(*) FROM sessions WHERE status = 'completed') as completed_sessions,
        (SELECT COUNT(*) FROM absences) as absences,
        (SELECT COUNT(*) FROM absence_requests WHERE status = 'pending') as pending_requests,
        (SELECT COUNT(*) FROM messages WHERE is_read = false) as unread_messages,
        (SELECT COUNT(*) FROM notifications WHERE is_read = false) as unread_notifications
    `);
    
    const counts = finalCounts.rows[0];
    
    console.log('\n\n════════════════════════════════════════════════');
    console.log('           📊 QUICK STATISTICS');
    console.log('════════════════════════════════════════════════');
    console.log(`👥 Total Users: ${counts.users}`);
    console.log(`👨‍🏫 Teachers: ${counts.teachers}`);
    console.log(`👨‍🎓 Students: ${counts.students}`);
    console.log(`📅 Total Sessions: ${counts.sessions} (${counts.completed_sessions} completed)`);
    console.log(`❌ Total Absences: ${counts.absences}`);
    console.log(`⏳ Pending Absence Requests: ${counts.pending_requests}`);
    console.log(`📬 Unread Messages: ${counts.unread_messages}`);
    console.log(`🔔 Unread Notifications: ${counts.unread_notifications}`);
    console.log('════════════════════════════════════════════════\n');
    
    console.log('🎯 TEST SCENARIOS READY:');
    console.log('════════════════════════════════════════════════');
    console.log('1. ✅ Login as teacher: teacher@university.com (Teacher ID: 2)');
    console.log('2. ✅ View and manage sessions with real dates');
    console.log('3. ✅ Take attendance for completed sessions');
    console.log('4. ✅ Review and approve absence requests');
    console.log('5. ✅ Send/receive messages with email search');
    console.log('6. ✅ View notifications for various events');
    console.log('7. ✅ Check student attendance statistics');
    console.log('8. ✅ View groups with actual students');
    console.log('════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

showTestData();
