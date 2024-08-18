const { getConnection } = require("../dataBase/dataBase");

const postQuestion = async (req, res) => {
  const { description, title, tags } = req.body;
  const userId = req.user.id;

  if (!description || !title) {
    return res.status(400).json({ msg: "Description and title are required" });
  }

  try {
    const questionId = `Q${Date.now()}`;
    const currentTimestamp = new Date();

    const insertQuestionQuery = `
      INSERT INTO question (questionid, title, description, tag, user_id, created_at) 
      VALUES (?, ?, ?, ?, ?, ?)`;

    await getConnection().query(insertQuestionQuery, [
      questionId,
      title,
      description,
      tags || null,
      userId,
      currentTimestamp,
    ]);

    res.status(201).json({
      msg: "Question posted successfully",
      questionid: questionId,
      created_at: currentTimestamp,
    });
  } catch (error) {
    console.error("Error posting question:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

const editQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { title, description, tag } = req.body;
  const userId = req.user.id;

  if (!title && !description && !tag) {
    return res.status(400).json({ msg: "No fields provided for update" });
  }

  try {
    // Check if the question exists and belongs to the current user
    const [question] = await getConnection().query(
      "SELECT * FROM question WHERE questionid = ? AND user_id = ?",
      [questionId, userId]
    );

    if (question.length === 0) {
      return res
        .status(403)
        .json({ msg: "Not authorized to edit this question" });
    }

    // Build the update query dynamically based on the provided fields
    const updates = [];
    const params = [];

    if (title) {
      updates.push("title = ?");
      params.push(title);
    }

    if (description) {
      updates.push("description = ?");
      params.push(description);
    }

    if (tag) {
      updates.push("tag = ?");
      params.push(tag);
    }

    params.push(questionId);

    // Update the question
    await getConnection().query(
      `UPDATE question SET ${updates.join(", ")} WHERE questionid = ?`,
      params
    );

    // Return the updated question data
    const [updatedQuestion] = await getConnection().query(
      "SELECT * FROM question WHERE questionid = ?",
      [questionId]
    );

    res.status(200).json({
      msg: "Question updated successfully",
      question: updatedQuestion[0],
    });
  } catch (error) {
    console.error("Error updating question:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user.id;

  try {
    // Check if the question exists and belongs to the current user
    const [question] = await getConnection().query(
      "SELECT * FROM question WHERE questionid = ? AND user_id = ?",
      [questionId, userId]
    );

    if (question.length === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this question" });
    }

    // Delete all answers associated with the question
    await getConnection().query("DELETE FROM answer WHERE questionid = ?", [
      questionId,
    ]);

    // Delete the question
    await getConnection().query("DELETE FROM question WHERE questionid = ?", [
      questionId,
    ]);

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const query = `
      SELECT question.questionid, question.title, question.description, question.tag, question.created_at,
             user.id as user_id, user.firstname, user.lastname
      FROM question
      JOIN user ON question.user_id = user.id
    `;
    const [rows] = await getConnection().query(query);
    res.status(200).json({
      msg: "Questions fetched successfully",
      questions: rows,
    });
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

const getQuestionById = async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const query = `
      SELECT question.questionid, question.title, question.description, question.tag, question.created_at,
             user.firstname, user.lastname
      FROM question
      JOIN user ON question.user_id = user.id
      WHERE question.questionid = ?
    `;
    const [rows] = await getConnection().query(query, [questionId]);

    if (rows.length === 0) {
      return res.status(404).json({
        msg: "Question not found",
      });
    }

    res.status(200).json({
      msg: "Question fetched successfully",
      question: rows[0],
    });
  } catch (error) {
    console.error("Error fetching question:", error.message);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  postQuestion,
  getAllQuestions,
  getQuestionById,
  editQuestion,
  deleteQuestion,
};
