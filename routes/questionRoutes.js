const express = require("express");
const router = express.Router();
const {
  postQuestion,
  getAllQuestions,
  getQuestionById,
  editQuestion,
  deleteQuestion,
} = require("../Controllers/questionController");
const authMiddleware = require("../middlewire/auth");

router.post("/post", authMiddleware, postQuestion);
router.get("/get", getAllQuestions);
router.get("/:questionId", getQuestionById);

// Routes to edit and delete a question
router.put("/:questionId", authMiddleware, editQuestion); // Update question using PUT
router.delete("/:questionId", authMiddleware, deleteQuestion);
// Delete question

module.exports = router;
