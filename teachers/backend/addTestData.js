const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function addTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Adding comprehensive test data...\n');
    
    await client.query('BEGIN');
    
    // =====================================================
    // 1. Add more teachers if needed
    // =====================================================
    console.log('👨‍🏫 Adding teachers...');
    
    const teacherEmails = [
      'ahmed.missaoui@university.edu',
      'sara.jones@university.edu',
      'mohamed.ben@university.edu',
      'linda.smith@university.edu'
    ];
    
    for (let i = 0; i < teacherEmails.length; i++) {
      const email = teacherEmails[i];
      const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      
      if (exists.rows.length === 0) {
        const names = email.split('@')[0].split('.');
        const firstName = names[0].charAt(0).toUpperCase() + names[0].slice(1);
        const lastName = names[1].charAt(0).toUpperCase() + names[1].slice(1);
        
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, cin, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'teacher', true, $5, NOW(), NOW())
          RETURNING id
        `, [email, '$2b$10$abcdefghijklmnopqrstuvwxyz', firstName, lastName, 'TC00' + (3 + i) + (3 + i)]);
        
        const userId = userResult.rows[0].id;
        
        // Check if teacher record already exists
        const teacherExists = await client.query('SELECT id FROM teachers WHERE user_id = $1', [userId]);
        
        if (teacherExists.rows.length === 0) {
          await client.query(`
            INSERT INTO teachers (user_id, employee_id, department_id, specialization, phone, hire_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `, [
            userId,
            'EMP000' + (3 + i),
            (i % 2) + 1,
            ['Database Systems', 'Web Development', 'Network Security', 'Machine Learning'][i],
            '+216 ' + (20000000 + i * 100000),
            '2020-09-01'
          ]);
        }
        
        console.log(`  ✓ Created teacher: ${firstName} ${lastName}`);
      }
    }
    
    // =====================================================
    // 2. Create Sessions from existing timetable slots
    // =====================================================
    console.log('\n📅 Generating sessions from timetable...');
    
    const slots = await client.query('SELECT * FROM timetable_slots WHERE is_active = true');
    
    for (const slot of slots.rows) {
      // Generate sessions for past 2 weeks and next week
      for (let weekOffset = -2; weekOffset <= 1; weekOffset++) {
        const today = new Date();
        const daysDiff = slot.day_of_week - today.getDay();
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + daysDiff + (weekOffset * 7));
        
        const dateStr = sessionDate.toISOString().split('T')[0];
        
        // Check if session already exists
        const existingSession = await client.query(
          'SELECT id FROM sessions WHERE timetable_slot_id = $1 AND session_date = $2',
          [slot.id, dateStr]
        );
        
        if (existingSession.rows.length === 0) {
          let status = 'scheduled';
          if (sessionDate < today) {
            status = 'completed';
          } else if (sessionDate.toDateString() === today.toDateString()) {
            status = 'in_progress';
          }
          
          await client.query(`
            INSERT INTO sessions (timetable_slot_id, session_date, start_time, end_time, room_id, status, is_makeup, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
          `, [slot.id, dateStr, slot.start_time, slot.end_time, slot.room_id, status]);
        }
      }
    }
    
    const sessionCount = await client.query('SELECT COUNT(*) FROM sessions');
    console.log(`  ✓ Total sessions: ${sessionCount.rows[0].count}`);
    
    // =====================================================
    // 3. Add realistic absences for past sessions
    // =====================================================
    console.log('\n❌ Adding student absences...');
    
    const completedSessions = await client.query(`
      SELECT s.id as session_id, ts.teacher_id, ts.group_id
      FROM sessions s
      INNER JOIN timetable_slots ts ON s.timetable_slot_id = ts.id
      WHERE s.status = 'completed'
    `);
    
    const groupStudents = await client.query('SELECT id FROM students WHERE group_id = 1');
    
    let absenceCount = 0;
    for (const session of completedSessions.rows) {
      // Randomly mark 10-20% of students as absent
      for (const student of groupStudents.rows) {
        if (Math.random() < 0.15) { // 15% absence rate
          const existingAbsence = await client.query(
            'SELECT id FROM absences WHERE student_id = $1 AND session_id = $2',
            [student.id, session.session_id]
          );
          
          if (existingAbsence.rows.length === 0) {
            await client.query(`
              INSERT INTO absences (student_id, session_id, absence_type, marked_at, marked_by, created_at, updated_at)
              VALUES ($1, $2, 'unjustified', NOW(), $3, NOW(), NOW())
            `, [student.id, session.session_id, session.teacher_id]);
            absenceCount++;
          }
        }
      }
    }
    
    console.log(`  ✓ Added ${absenceCount} absences`);
    
    // =====================================================
    // 4. Add absence requests for some absences
    // =====================================================
    console.log('\n📝 Adding absence justification requests...');
    
    const recentAbsences = await client.query(`
      SELECT a.id, a.student_id
      FROM absences a
      WHERE a.absence_type = 'unjustified'
      ORDER BY a.id DESC
      LIMIT 10
    `);
    
    let requestCount = 0;
    for (const absence of recentAbsences.rows) {
      const exists = await client.query('SELECT id FROM absence_requests WHERE absence_id = $1', [absence.id]);
      
      if (exists.rows.length === 0) {
        const reasons = [
          'Medical appointment - had doctor visit',
          'Family emergency - urgent family matter',
          'Illness - was sick with flu',
          'Transportation issues - car breakdown',
          'Personal matter - family event'
        ];
        
        const statuses = ['pending', 'approved', 'rejected'];
        const status = statuses[requestCount % 3];
        
        await client.query(`
          INSERT INTO absence_requests (absence_id, student_id, request_reason, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `, [absence.id, absence.student_id, reasons[requestCount % reasons.length], status]);
        
        // If approved, update absence type
        if (status === 'approved') {
          await client.query(
            'UPDATE absences SET absence_type = $1 WHERE id = $2',
            ['justified', absence.id]
          );
        }
        
        requestCount++;
      }
    }
    
    console.log(`  ✓ Added ${requestCount} absence requests`);
    
    // =====================================================
    // 5. Add messages between users
    // =====================================================
    console.log('\n✉️  Adding messages...');
    
    const teacherUser = await client.query("SELECT id FROM users WHERE email = 'teacher@university.com'");
    const studentUsers = await client.query("SELECT id FROM users WHERE role = 'student' LIMIT 5");
    const adminUser = await client.query("SELECT id FROM users WHERE email = 'admin@university.com'");
    
    if (teacherUser.rows.length > 0 && studentUsers.rows.length > 0) {
      const teacherId = teacherUser.rows[0].id;
      
      const messages = [
        {
          from: teacherId,
          to: studentUsers.rows[0].id,
          subject: 'Regarding Your Recent Absences',
          content: 'Dear Student,\n\nI noticed you were absent from recent classes. Please make sure to catch up on the material.\n\nBest regards'
        },
        {
          from: studentUsers.rows[1].id,
          to: teacherId,
          subject: 'Question about Assignment',
          content: 'Dear Professor,\n\nI have a question about the latest assignment deadline. Could you please clarify?\n\nThank you'
        },
        {
          from: adminUser.rows[0].id,
          to: teacherId,
          subject: 'Faculty Meeting Reminder',
          content: 'Dear Faculty,\n\nReminder about the upcoming faculty meeting next Wednesday at 2:00 PM.\n\nBest regards,\nAdmin'
        }
      ];
      
      let msgCount = 0;
      for (const msg of messages) {
        const exists = await client.query(
          'SELECT id FROM messages WHERE sender_id = $1 AND recipient_id = $2 AND subject = $3',
          [msg.from, msg.to, msg.subject]
        );
        
        if (exists.rows.length === 0) {
          await client.query(`
            INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
          `, [msg.from, msg.to, msg.subject, msg.content, msgCount > 0]);
          msgCount++;
        }
      }
      
      console.log(`  ✓ Added ${msgCount} messages`);
    }
    
    // =====================================================
    // 6. Add notifications
    // =====================================================
    console.log('\n🔔 Adding notifications...');
    
    const teachers = await client.query('SELECT user_id FROM teachers');
    
    let notifCount = 0;
    for (const teacher of teachers.rows) {
      const notifications = [
        {
          title: 'Class Reminder',
          message: 'You have a class starting soon',
          type: 'timetable'
        },
        {
          title: 'New Absence Request',
          message: 'A student has submitted an absence request',
          type: 'absence'
        },
        {
          title: 'Welcome',
          message: 'Welcome to the Teacher Portal',
          type: 'general'
        }
      ];
      
      for (const notif of notifications) {
        const exists = await client.query(
          'SELECT id FROM notifications WHERE user_id = $1 AND title = $2',
          [teacher.user_id, notif.title]
        );
        
        if (exists.rows.length === 0) {
          await client.query(`
            INSERT INTO notifications (user_id, title, message, notification_type, is_read, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
          `, [teacher.user_id, notif.title, notif.message, notif.type, notif.title === 'Welcome']);
          notifCount++;
        }
      }
    }
    
    console.log(`  ✓ Added ${notifCount} notifications`);
    
    await client.query('COMMIT');
    
    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('\n================================================');
    console.log('✅ TEST DATA ADDED SUCCESSFULLY!');
    console.log('================================================\n');
    
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as teachers,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as students,
        (SELECT COUNT(*) FROM sessions) as sessions,
        (SELECT COUNT(*) FROM sessions WHERE status = 'completed') as completed_sessions,
        (SELECT COUNT(*) FROM absences) as absences,
        (SELECT COUNT(*) FROM absence_requests) as absence_requests,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM notifications) as notifications
    `);
    
    const data = summary.rows[0];
    console.log('📊 FINAL DATABASE SUMMARY:');
    console.log('================================================');
    console.log(`Total Users        : ${data.users}`);
    console.log(`  - Teachers       : ${data.teachers}`);
    console.log(`  - Students       : ${data.students}`);
    console.log(`Sessions           : ${data.sessions}`);
    console.log(`  - Completed      : ${data.completed_sessions}`);
    console.log(`Absences           : ${data.absences}`);
    console.log(`Absence Requests   : ${data.absence_requests}`);
    console.log(`Messages           : ${data.messages}`);
    console.log(`Notifications      : ${data.notifications}`);
    console.log('================================================\n');
    
    console.log('🎓 READY TO TEST!');
    console.log('================================================');
    console.log('Use existing teacher: teacher@university.com');
    console.log('Teacher ID: 2');
    console.log('Database has realistic data for comprehensive testing');
    console.log('================================================\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding test data:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestData();
