const pool = require('./src/config/database');

(async () => {
  try {
    const tables = ['students', 'grades', 'absences', 'sessions', 'levels', 'groups', 'departments', 'subjects', 'specialties'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}' 
        ORDER BY ordinal_position
      `);
      
      console.log(`\n=== ${table.toUpperCase()} TABLE ===`);
      if (result.rows.length === 0) {
        console.log('Table not found or has no columns');
      } else {
        result.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
