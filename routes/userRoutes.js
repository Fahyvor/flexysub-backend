const { Login, SignUp, GetAllUsers } = require("../controllers/userController");
const express = require("express");
const router = express.Router();

router.post("/login", Login);
router.post("/register", SignUp);
router.get("/all-users", GetAllUsers);

module.exports = router;