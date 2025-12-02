require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkAttendanceStructure() {
  try {
    console.log('\n=== CHECKING ATTENDANCE & RELATED TABLES ===\n');

    // Check absences table
    console.log('📋 ABSENCES TABLE:');
    const absencesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'absences'
      ORDER BY ordinal_position
    `);
    absencesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check if there's an attendance table
    console.log('\n📋 CHECKING FOR ATTENDANCE TABLE:');
    const attendanceCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'attendance'
    `);
    console.log(attendanceCheck.rows.length > 0 ? '  ✅ Attendance table exists' : '  ❌ No attendance table found');

    // Check students in groups
    console.log('\n👥 SAMPLE: Students in Groups:');
    const studentsInGroups = await pool.query(`
      SELECT g.id as group_id, g.name as group_name, COUNT(s.id) as student_count
      FROM groups g
      LEFT JOIN students s ON s.group_id = g.id
      GROUP BY g.id, g.name
      ORDER BY g.name
      LIMIT 5
    `);
    studentsInGroups.rows.forEach(row => {
      console.log(`  - Group: ${row.group_name} (ID: ${row.group_id}) - ${row.student_count} students`);
    });

    // Check teacher-subject-group relationships
    console.log('\n📚 SAMPLE: Teacher-Subject-Group Relations:');
    const teacherRelations = await pool.query(`
      SELECT 
        t.id as teacher_id,
        u.first_name || ' ' || u.last_name as teacher_name,
        s.name as subject_name,
        g.name as group_name,
        ts.academic_year,
        ts.semester
      FROM teacher_subjects ts
      INNER JOIN teachers t ON ts.teacher_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN subjects s ON ts.subject_id = s.id
      INNER JOIN groups g ON ts.group_id = g.id
      LIMIT 5
    `);
    teacherRelations.rows.forEach(row => {
      console.log(`  - ${row.teacher_name} teaches ${row.subject_name} to ${row.group_name} (${row.academic_year}-S${row.semester})`);
    });

    console.log('\n=== CHECK COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAttendanceStructure();
