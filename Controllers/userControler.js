const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../dataBase/dataBase");
require("dotenv").config();

const JWT_SECRET = process.env.SECRET_KEY;

const register = async (req, res) => {
  const { username, email, firstname, lastname, password } = req.body;

  if (!username || !email || !firstname || !lastname || !password) {
    return res.status(400).json({
      error: "Bad Request",
      msg: "Please provide all required fields",
    });
  }

  try {
    const [rows] = await getConnection().query(
      "SELECT username FROM user WHERE username = ? OR email = ?",
      [username, email]
    );

    if (rows.length > 0) {
      return res.status(409).json({
        error: "Conflict",
        msg: "User already exists",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Bad Request",
        msg: "Password must be at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserQuery = `INSERT INTO user (username, email, firstname, lastname, password) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await getConnection().query(insertUserQuery, [
      username,
      email,
      firstname,
      lastname,
      hashedPassword,
    ]);

    const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      msg: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error inserting user:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      msg: "An unexpected error occurred.",
    });
  }
};

const signIn = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Bad Request",
      msg: "Please provide all required fields",
    });
  }

  try {
    const [rows] = await getConnection().query(
      "SELECT id, password FROM user WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: "Unauthorized",
        msg: "Invalid username or password",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Unauthorized",
        msg: "Invalid username or password",
      });
    }

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      msg: "User login successful",
      token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      msg: "An unexpected error occurred.",
    });
  }
};

const checkUser = async (req, res) => {
  const { username, id } = req.user;
  res
    .status(200)
    .json({ msg: "User is authenticated", user: { username, id } });
};

module.exports = { register, signIn, checkUser };
