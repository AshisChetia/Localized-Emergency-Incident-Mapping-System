import db from './src/config/db.js';

async function updateTable() {
  try {
    await db.query('ALTER TABLE report_messages ADD COLUMN is_read TINYINT(1) DEFAULT 0');
    console.log('✅ Added is_read column to report_messages');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('ℹ️ is_read column already exists');
      process.exit(0);
    }
    console.error('❌ Failed to update table:', err.message);
    process.exit(1);
  }
}

updateTable();
