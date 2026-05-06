const prisma = require("../../lib/prisma");
const asyncHandler = require("../../middleware/asyncHandler");

exports.getBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: { author: { omit: { password: true } } },
  });

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  req.log.info({ blogId }, "Fetched blog");
  res.status(200).json(blog);
});

exports.getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await prisma.blog.findMany({
    include: { author: { omit: { password: true } } },
  });

  req.log.info("Fetched all blogs");
  res.status(200).json(blogs);
});

exports.createBlog = asyncHandler(async (req, res) => {
  const { title, content, imageUrl } = req.body;

  const blog = await prisma.blog.create({
    data: {
      title,
      content,
      imageUrl,
      authorId: req.user.id,
    },
  });
  req.log.info({ title, authorId: req.user.id }, "Created blog");
  res.status(201).json(blog);
});

exports.updateBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const { title, content, imageUrl } = req.body;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  if (blog.authorId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updatedBlog = await prisma.blog.update({
    where: { id: blogId },
    data: { title, content, imageUrl },
  });
  req.log.info({ blogId }, "Updated blog");
  res.status(200).json(updatedBlog);
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  if (blog.authorId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await prisma.blog.delete({
    where: { id: blogId },
  });
  req.log.info({ blogId }, "Deleted blog");
  res.status(204).send();
});
