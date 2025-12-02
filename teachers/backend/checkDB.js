require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkDatabase() {
  try {
    console.log('\n=== CHECKING DATABASE STRUCTURE ===\n');

    // Check all tables
    console.log('📋 ALL TABLES:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    tablesResult.rows.forEach(row => console.log('  -', row.table_name));

    // Check students table structure
    console.log('\n👤 STUDENTS TABLE COLUMNS:');
    const studentsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `);
    studentsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check users table structure
    console.log('\n👥 USERS TABLE COLUMNS:');
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check timetable_slots table
    console.log('\n📅 TIMETABLE_SLOTS TABLE COLUMNS:');
    const slotsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'timetable_slots'
      ORDER BY ordinal_position
    `);
    slotsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check sessions table
    console.log('\n📚 SESSIONS TABLE COLUMNS:');
    const sessionsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `);
    sessionsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check notifications table and its constraint
    console.log('\n🔔 NOTIFICATIONS TABLE:');
    const notificationsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position
    `);
    notificationsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check notification_type constraint
    console.log('\n🔔 NOTIFICATION_TYPE CONSTRAINT:');
    const constraintCheck = await pool.query(`
      SELECT con.conname, pg_get_constraintdef(con.oid) as definition
      FROM pg_constraint con
      INNER JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'notifications' 
      AND con.contype = 'c'
      AND con.conname LIKE '%notification_type%'
    `);
    if (constraintCheck.rows.length > 0) {
      constraintCheck.rows.forEach(row => {
        console.log(`  ${row.conname}: ${row.definition}`);
      });
    } else {
      console.log('  No CHECK constraint found on notification_type');
    }

    // Check messages table
    console.log('\n💬 MESSAGES TABLE COLUMNS:');
    const messagesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `);
    messagesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check groups table
    console.log('\n👥 GROUPS TABLE COLUMNS:');
    const groupsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'groups'
      ORDER BY ordinal_position
    `);
    groupsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n=== CHECK COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
