require("dotenv").config();

const mysql = require('mysql2/promise');

const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
    host: process.env.DB_CONTAINER,
    port: process.env.DB_PORT,
    user: process.env.MYSQL_ROOT_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,    // Increased for better scalability
    queueLimit: 0,
    acquireTimeout: 30000   // Prevents excessive wait times
  },
};
  
const pool = mysql.createPool(config.db);

// Utility function to query the database
async function query(sql, params) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error(`❌ Database query failed: ${error.message}`);
    throw new Error('Database query error');
  }
}


module.exports = {
  query,
}
