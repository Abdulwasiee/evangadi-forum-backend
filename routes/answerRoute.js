const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewire/auth");
const {
  postAnswer,
  getAnswersForQuestion,
  getAnswersSingleForQuestion,
  editAnswer,
  deleteAnswer,
} = require("../Controllers/answerControler");

// Define routes
router.post("/", authMiddleware, postAnswer); // Protected route
router.get("/:questionid", getAnswersForQuestion);
router.get("/single/:answerid", getAnswersSingleForQuestion);
router.put("/:answerid", authMiddleware, editAnswer); // Protected route for editing
router.delete("/:answerid", authMiddleware, deleteAnswer); // Protected route for deleting

module.exports = router;
