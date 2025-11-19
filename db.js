// ===================== db.js =====================

const mysql = require("mysql2");

// Load environment variables (DB_HOST, DB_USER, etc.)
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "curriculum_platform",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL Database");
        connection.release();
    }
});

module.exports = pool;
