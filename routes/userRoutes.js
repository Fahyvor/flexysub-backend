const { Login, SignUp, GetAllUsers, VerifyUser } = require("../controllers/userController");
const express = require("express");
const router = express.Router();

router.post("/login", Login);
router.post("/register", SignUp);
router.get("/all-users", GetAllUsers);
router.post("/upgrade-account", VerifyUser);

module.exports = router;