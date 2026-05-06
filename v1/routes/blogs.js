const express = require("express");
const {
  getBlog,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogs");
const authenticate = require("../../middleware/authenticate");

const router = express.Router();

router.route("/").get(getAllBlogs).post(authenticate, createBlog);

router
  .route("/:id")
  .get(getBlog)
  .put(authenticate, updateBlog)
  .delete(authenticate, deleteBlog);

module.exports = router;
