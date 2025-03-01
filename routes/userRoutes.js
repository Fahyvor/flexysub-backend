const { Login, SignUp, GetAllUsers, VerifyUser, UpdateUserData, DeleteUser, ResetPassword, UpdateAccountBalance, getUser  } = require("../controllers/userController");
const express = require("express");
const router = express.Router();

router.post("/login", Login);
router.post("/register", SignUp);
router.get("/all-users", GetAllUsers);
router.post("/upgrade-account", VerifyUser);
router.put("/update-user", UpdateUserData);
router.delete("/delete-user/:id", DeleteUser);
router.post('/reset-password', ResetPassword);
router.post("/update-balance", UpdateAccountBalance);
router.get("/get-user", getUser);

module.exports = router;