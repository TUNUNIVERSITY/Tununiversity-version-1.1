const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'university_platform',
  password: 'admin123',
  port: 5432,
});

async function checkGroups() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'groups' 
      ORDER BY ordinal_position
    `);
    console.log('GROUPS TABLE COLUMNS:');
    result.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkGroups();
