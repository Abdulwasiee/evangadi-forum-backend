const { getConnection } = require("../dataBase/dataBase");

// Controller to post a new answer
const postAnswer = async (req, res) => {
  const { answer, questionid } = req.body;
  const userId = req.user.id;

  if (!answer || !questionid) {
    return res.status(400).json({ msg: "Answer and question ID are required" });
  }

  try {
    const answerId = `A${Date.now()}`;
    const currentTimestamp = new Date();

    const insertAnswerQuery = `
      INSERT INTO answer (id, questionid, user_id, answer, created_at)
      VALUES (?, ?, ?, ?, ?)`;

    await getConnection().query(insertAnswerQuery, [
      answerId,
      questionid,
      userId,
      answer,
      currentTimestamp,
    ]);

    // Retrieve the username to include in the response
    const [user] = await getConnection().query(
      "SELECT username FROM user WHERE id = ?",
      [userId]
    );

    res.status(201).json({
      msg: "Answer posted successfully",
      answerid: answerId,
      created_at: currentTimestamp,
      username: user[0].username, // Add the username here
    });
  } catch (error) {
    console.error("Error posting answer:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

// Controller to get all answers for a specific question
const getAnswersForQuestion = async (req, res) => {
  const questionId = req.params.questionid;

  try {
    const query = `
      SELECT answer.id, answer.answer, answer.created_at,
             user.firstname, user.lastname, user.username
      FROM answer
      JOIN user ON answer.user_id = user.id
      WHERE answer.questionid = ?
    `;
    const [rows] = await getConnection().query(query, [questionId]);

    res.status(200).json({
      msg: "Answers fetched successfully",
      answers: rows,
    });
  } catch (error) {
    console.error("Error fetching answers:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

// Controller to get a specific answer by ID
const getAnswersSingleForQuestion = async (req, res) => {
  const answerId = req.params.answerid;

  try {
    const query = `
      SELECT answer.id, answer.answer, answer.created_at,
             user.firstname, user.lastname, user.username
      FROM answer
      JOIN user ON answer.user_id = user.id
      WHERE answer.id = ?
    `;
    const [rows] = await getConnection().query(query, [answerId]);

    if (rows.length === 0) {
      return res.status(404).json({
        msg: "Answer not found",
      });
    }

    res.status(200).json({
      msg: "Answer fetched successfully",
      answer: rows[0],
    });
  } catch (error) {
    console.error("Error fetching answer:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

// Controller to edit an existing answer
const editAnswer = async (req, res) => {
  const { answerid } = req.params;
  const { answer } = req.body;
  const userId = req.user.id;

  if (!answer) {
    return res.status(400).json({ msg: "Answer content is required" });
  }

  try {
    // Check if the answer exists and belongs to the current user
    const [existingAnswer] = await getConnection().query(
      "SELECT * FROM answer WHERE id = ? AND user_id = ?",
      [answerid, userId]
    );

    if (existingAnswer.length === 0) {
      return res
        .status(403)
        .json({ msg: "Not authorized to edit this answer" });
    }

    // Update the answer
    await getConnection().query("UPDATE answer SET answer = ? WHERE id = ?", [
      answer,
      answerid,
    ]);

    // Return the updated answer along with the username
    const [updatedAnswer] = await getConnection().query(
      `SELECT answer.id, answer.answer, answer.created_at, user.username
       FROM answer
       JOIN user ON answer.user_id = user.id
       WHERE answer.id = ?`,
      [answerid]
    );

    res.status(200).json({
      msg: "Answer updated successfully",
      answer: updatedAnswer[0],
    });
  } catch (error) {
    console.error("Error updating answer:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

// Controller to delete an existing answer
const deleteAnswer = async (req, res) => {
  const { answerid } = req.params;
  const userId = req.user.id;

  try {
    // Check if the answer exists and belongs to the current user
    const [existingAnswer] = await getConnection().query(
      "SELECT * FROM answer WHERE id = ? AND user_id = ?",
      [answerid, userId]
    );

    if (existingAnswer.length === 0) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this answer" });
    }

    // Delete the answer
    await getConnection().query("DELETE FROM answer WHERE id = ?", [answerid]);

    res.status(200).json({ msg: "Answer deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  postAnswer,
  getAnswersForQuestion,
  getAnswersSingleForQuestion,
  editAnswer,
  deleteAnswer,
};
