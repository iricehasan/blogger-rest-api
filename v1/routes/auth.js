const express = require("express");
const {
  register,
  login,
  logout,
  me,
  refresh,
  changePassword,
} = require("../controllers/auth");
const authenticate = require("../../middleware/authenticate");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(authenticate, logout);
router.route("/refresh").post(refresh);
router.route("/me").get(authenticate, me);
router.route("/change-password").post(authenticate, changePassword);

module.exports = router;
