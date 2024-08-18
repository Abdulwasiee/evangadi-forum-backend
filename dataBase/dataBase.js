const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool
const myConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Convert the pool to use promises
const getConnection = () => {
  return myConnection.promise();
};

// Create tables if they don't exist
const createTables = async () => {
  const userTable = `CREATE TABLE IF NOT EXISTS user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      firstname VARCHAR(50) NOT NULL,
      lastname VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  const questionTable = `CREATE TABLE IF NOT EXISTS question (
      id INT AUTO_INCREMENT PRIMARY KEY,
      questionid VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      tag VARCHAR(50),
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user(id)
  )`;

  const answerTable = `CREATE TABLE IF NOT EXISTS answer (
    id VARCHAR(100) NOT NULL,
    questionid VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (questionid) REFERENCES question(questionid),
    FOREIGN KEY (user_id) REFERENCES user(id)
  )`;

  try {
    const connection = getConnection();
    await connection.query(userTable);
    await connection.query(questionTable);
    await connection.query(answerTable);
    console.log("All tables created or already exist");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  }
};

module.exports = { getConnection, createTables };
