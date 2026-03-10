const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// .env 로드
dotenv.config();

// 로컬 테스트용 고정값을 디폴트로 사용
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "1234",
  database: process.env.DB_NAME || "pip",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// DB 연결/쿼리 실패 시 로그 개선
const originalQuery = pool.query;
pool.query = async function (...args) {
  try {
    return await originalQuery.apply(this, args);
  } catch (err) {
    console.error("DB error:", err);
    throw err;
  }
};

const originalExecute = pool.execute;
pool.execute = async function (...args) {
  try {
    return await originalExecute.apply(this, args);
  } catch (err) {
    console.error("DB error:", err);
    throw err;
  }
};

const originalGetConnection = pool.getConnection;
pool.getConnection = async function (...args) {
  try {
    return await originalGetConnection.apply(this, args);
  } catch (err) {
    console.error("DB error:", err);
    throw err;
  }
};

module.exports = pool;
