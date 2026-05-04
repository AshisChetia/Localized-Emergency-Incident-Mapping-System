import db from './src/config/db.js';

async function checkCols() {
  try {
    const [rows] = await db.query('DESCRIBE report_messages');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCols();
