const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'university_platform',
  user: 'postgres',
  password: 'admin123'
});

async function checkIds() {
  console.log('=== CHECKING DATABASE IDs FOR CSV IMPORT ===\n');

  try {
    // Departments
    console.log('📁 DEPARTMENTS:');
    const depts = await pool.query('SELECT id, name, code FROM departments ORDER BY id LIMIT 5');
    depts.rows.forEach(row => console.log(`   ID: ${row.id} | Code: ${row.code} | Name: ${row.name}`));
    
    // Specialties
    console.log('\n🎓 SPECIALTIES:');
    const specs = await pool.query('SELECT id, name, code, department_id FROM specialties ORDER BY id LIMIT 5');
    specs.rows.forEach(row => console.log(`   ID: ${row.id} | Code: ${row.code} | Name: ${row.name} | Dept: ${row.department_id}`));
    
    // Levels
    console.log('\n📚 LEVELS:');
    const levels = await pool.query('SELECT id, name, code, specialty_id, year_number FROM levels ORDER BY id LIMIT 5');
    levels.rows.forEach(row => console.log(`   ID: ${row.id} | Code: ${row.code} | Name: ${row.name} | Specialty: ${row.specialty_id} | Year: ${row.year_number}`));
    
    // Groups
    console.log('\n👥 GROUPS:');
    const groups = await pool.query('SELECT id, name, code, level_id FROM groups ORDER BY id LIMIT 5');
    groups.rows.forEach(row => console.log(`   ID: ${row.id} | Code: ${row.code} | Name: ${row.name} | Level: ${row.level_id}`));
    
    // Teachers
    console.log('\n👨‍🏫 TEACHERS:');
    const teachers = await pool.query(`
      SELECT t.id, t.employee_id, u.first_name, u.last_name, t.department_id 
      FROM teachers t 
      JOIN users u ON u.id = t.user_id 
      ORDER BY t.id LIMIT 5
    `);
    teachers.rows.forEach(row => console.log(`   ID: ${row.id} | Emp: ${row.employee_id} | Name: ${row.first_name} ${row.last_name} | Dept: ${row.department_id}`));
    
    console.log('\n✅ Use these IDs in your CSV test files!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkIds();
