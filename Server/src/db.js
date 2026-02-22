const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// .env 로드
dotenv.config();

// 로컬 테스트용 고정값을 디폴트로 사용
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "PIP",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
