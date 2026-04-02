import mysql from 'mysql2/promise';

async function checkFK() {
  const connection = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2QhbYCKoR2Vgaf5.root',
    password: 'TgrsF2TCcq16S2tR',
    database: 'local_emergency',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });

  try {
    const [rows] = await connection.execute(
      `SELECT CONSTRAINT_NAME, DELETE_RULE 
       FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
       WHERE CONSTRAINT_SCHEMA = 'local_emergency' AND TABLE_NAME = 'reports'`
    );
    console.log("Constraints:", JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("SQL_ERROR", err.message);
  } finally {
    await connection.end();
  }
}

checkFK();
