const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewire/auth");
const { register, signIn, checkUser } = require("../Controllers/userControler");

router.post("/register", register);
router.post("/signin", signIn);
router.get("/checkUser", authMiddleware, checkUser);

module.exports = router;
