const pool = require("./src/db");

async function check() {
  try {
    const tables = ['pip_transactions', 'pip_accounts', 'pip_assets'];
    for (const table of tables) {
      const [rows] = await pool.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length === 0) {
        console.log(`Table '${table}' does not exist!`);
      } else {
        console.log(`Table '${table}' exists.`);
        const [columns] = await pool.query(`DESCRIBE ${table}`);
        console.table(columns);
      }
    }
  } catch (err) {
    console.error("Error connecting to DB:", err.message);
  } finally {
    process.exit();
  }
}

check();
