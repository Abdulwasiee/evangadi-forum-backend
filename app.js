const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const questionRouter = require("./routes/questionRoutes");
const answerRouter = require("./routes/answerRoute");
const { createTables, getConnection } = require("./dataBase/dataBase.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow PUT and DELETE methods
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Route setup
app.use("/api/user", userRouter);
app.use("/api/question", questionRouter);
app.use("/api/answer", answerRouter);

const port = process.env.PORT;

const start = async () => {
  try {
    // Test database connection
    const connection = await getConnection();
    const [rows] = await connection.query("SELECT 1"); // Use 'SELECT 1' for a connection test
    console.log("Database connection established:", rows);

    // Create tables if they do not exist
    await createTables();

    // Start the server
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
};

start();
