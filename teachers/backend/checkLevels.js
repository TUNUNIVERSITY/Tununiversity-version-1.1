const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function checkLevelsStructure() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'levels'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 LEVELS TABLE STRUCTURE:');
    console.log('================================================');
    result.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (Nullable: ${col.is_nullable})`);
    });
    console.log('================================================\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkLevelsStructure();
