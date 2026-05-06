const prisma = require("../../lib/prisma");
const asyncHandler = require("../../middleware/asyncHandler");

const USER_QUERY = {
  omit: { password: true },
  include: { blogs: true },
};

exports.getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    ...USER_QUERY,
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  req.log.info({ userId }, "Fetched user");
  res.json(user);
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany(USER_QUERY);
  req.log.info("Fetched all users");
  res.json(users);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { name, email } = req.body;
  const role = req.user.role === "Admin" ? req.body.role : "NormalUser";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email, role },
    omit: { password: true },
  });
  req.log.info({ name, email, role }, "Updated user");
  res.status(200).json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await prisma.user.delete({ where: { id: userId } });
  req.log.info({ userId }, "Deleted user");
  res.status(204).send();
});
