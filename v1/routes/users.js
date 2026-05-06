const express = require("express");
const {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.route("/").get(authenticate, authorize("Admin"), getAllUsers);

router
  .route("/:id")
  .get(getUser)
  .put(authenticate, updateUser)
  .delete(authenticate, deleteUser);

module.exports = router;
