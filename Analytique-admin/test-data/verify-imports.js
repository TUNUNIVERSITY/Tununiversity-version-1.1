const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'university_platform',
  user: 'postgres',
  password: 'admin123'
});

async function verifyImports() {
  console.log('\n🔍 VERIFYING CSV IMPORTS\n');
  console.log('='.repeat(60));

  try {
    // Check Groups
    const groups = await pool.query(
      "SELECT * FROM groups WHERE code IN ('G3','G4','G2M') ORDER BY code"
    );
    console.log('\n📁 GROUPS:');
    console.log(`   Found: ${groups.rows.length} / Expected: 3`);
    if (groups.rows.length > 0) {
      groups.rows.forEach(g => {
        console.log(`   ✓ ${g.code} - ${g.name} (Level: ${g.level_id})`);
      });
    } else {
      console.log('   ⚠️  No test groups found. Run import first!');
    }

    // Check Rooms
    const rooms = await pool.query(
      "SELECT * FROM rooms WHERE code IN ('LAB101','LAB102','AMP201','CLS301','WKS401') ORDER BY code"
    );
    console.log('\n🚪 ROOMS:');
    console.log(`   Found: ${rooms.rows.length} / Expected: 5`);
    if (rooms.rows.length > 0) {
      rooms.rows.forEach(r => {
        console.log(`   ✓ ${r.code} - ${r.name} (Type: ${r.room_type}, Capacity: ${r.capacity})`);
      });
    } else {
      console.log('   ⚠️  No test rooms found. Run import first!');
    }

    // Check Students
    const students = await pool.query(`
      SELECT s.student_number, u.first_name, u.last_name, u.email, g.name as group_name
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN groups g ON g.id = s.group_id
      WHERE s.student_number LIKE 'ST2025%'
      ORDER BY s.student_number
    `);
    console.log('\n👨‍🎓 STUDENTS:');
    console.log(`   Found: ${students.rows.length} / Expected: 5`);
    if (students.rows.length > 0) {
      students.rows.forEach(s => {
        console.log(`   ✓ ${s.student_number} - ${s.first_name} ${s.last_name} (${s.email})`);
        console.log(`      Group: ${s.group_name || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  No test students found. Run import first!');
    }

    // Check Teachers
    const teachers = await pool.query(`
      SELECT t.employee_id, u.first_name, u.last_name, u.email, d.name as dept_name
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN departments d ON d.id = t.department_id
      WHERE t.employee_id LIKE 'EMP2025%'
      ORDER BY t.employee_id
    `);
    console.log('\n👨‍🏫 TEACHERS:');
    console.log(`   Found: ${teachers.rows.length} / Expected: 3`);
    if (teachers.rows.length > 0) {
      teachers.rows.forEach(t => {
        console.log(`   ✓ ${t.employee_id} - ${t.first_name} ${t.last_name} (${t.email})`);
        console.log(`      Department: ${t.dept_name || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  No test teachers found. Run import first!');
    }

    // Check Subjects
    const subjects = await pool.query(`
      SELECT sub.code, sub.name, l.name as level_name, sub.credits, sub.subject_type
      FROM subjects sub
      LEFT JOIN levels l ON l.id = sub.level_id
      WHERE sub.code IN ('CS101','CS102','CS103','CS201','MATH101')
      ORDER BY sub.code
    `);
    console.log('\n📚 SUBJECTS:');
    console.log(`   Found: ${subjects.rows.length} / Expected: 5`);
    if (subjects.rows.length > 0) {
      subjects.rows.forEach(s => {
        console.log(`   ✓ ${s.code} - ${s.name}`);
        console.log(`      Level: ${s.level_name}, Credits: ${s.credits}, Type: ${s.subject_type}`);
      });
    } else {
      console.log('   ⚠️  No test subjects found. Run import first!');
    }

    // Check Teacher-Subject Assignments
    const assignments = await pool.query(`
      SELECT t.employee_id, sub.code, sub.name as subject_name, g.name as group_name
      FROM teacher_subjects ts
      JOIN teachers t ON t.id = ts.teacher_id
      JOIN subjects sub ON sub.id = ts.subject_id
      LEFT JOIN groups g ON g.id = ts.group_id
      WHERE sub.code IN ('CS101','CS102','CS103','CS201','MATH101')
      ORDER BY sub.code
    `);
    console.log('\n🔗 TEACHER-SUBJECT ASSIGNMENTS:');
    console.log(`   Found: ${assignments.rows.length} assignments`);
    if (assignments.rows.length > 0) {
      assignments.rows.forEach(a => {
        console.log(`   ✓ ${a.code} assigned to ${a.employee_id} (Group: ${a.group_name || 'All'})`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    const total = groups.rows.length + rooms.rows.length + students.rows.length + 
                  teachers.rows.length + subjects.rows.length;
    const expected = 3 + 5 + 5 + 3 + 5; // 21
    
    console.log(`   Total Records: ${total} / ${expected}`);
    console.log(`   Groups: ${groups.rows.length}/3`);
    console.log(`   Rooms: ${rooms.rows.length}/5`);
    console.log(`   Students: ${students.rows.length}/5`);
    console.log(`   Teachers: ${teachers.rows.length}/3`);
    console.log(`   Subjects: ${subjects.rows.length}/5`);
    console.log(`   Assignments: ${assignments.rows.length}`);

    if (total === expected) {
      console.log('\n✅ ALL IMPORTS VERIFIED SUCCESSFULLY! ');
    } else if (total === 0) {
      console.log('\n⚠️  NO TEST DATA FOUND!');
      console.log('\n💡 To import test data:');
      console.log('   1. Start backend: npm run dev');
      console.log('   2. Run: .\\test-data\\test-import.ps1');
      console.log('   OR');
      console.log('   3. Use web UI: http://localhost:5173/import-export');
    } else {
      console.log('\n⚠️  PARTIAL IMPORT - Some records missing');
      console.log('   Check import logs for errors');
    }
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

verifyImports();
