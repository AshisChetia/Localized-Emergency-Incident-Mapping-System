import db from './src/config/db.js';

async function testQuery() {
  try {
    const userId = 1; // dummy user id
    const [rows] = await db.query(
      `SELECT
          r.id,
          r.user_id,
          r.description,
          (
            SELECT COALESCE(MAX(created_at), r.created_at)
            FROM report_messages
            WHERE report_id = r.id
          ) AS latest_message_at
       FROM reports r
       LIMIT 5`
    );
    console.log('Query successful:', rows.length, 'rows');
    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err.message);
    process.exit(1);
  }
}

testQuery();
