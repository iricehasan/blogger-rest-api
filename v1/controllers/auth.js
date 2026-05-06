const asyncHandler = require("../../middleware/asyncHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

function generateAccessToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  req.log.info({ userId: user.id }, "User registered");
  res
    .status(201)
    .json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  req.log.info({ userId: user.id }, "User logged in");
  res.json({
    accessToken,
    user: { id: user.id, name: user.name, role: user.role, email: user.email },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  req.log.info({ userId: req.user.id }, "User logged out");
  res.status(204).send();
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    await prisma.refreshToken.deleteMany({ where: { token } });
    return res.status(401).json({ message: "Refresh token expired" });
  }

  const newRefreshToken = generateRefreshToken(payload.userId, payload.role);

  await prisma.refreshToken.delete({ where: { token } });
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: payload.userId },
  });

  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

  const accessToken = generateAccessToken(payload.userId, payload.role);
  req.log.info({ userId: payload.userId }, "Token refreshed");
  res.json({ accessToken });
});

exports.me = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  req.log.info({ userId: req.user.id }, "Fetched current user");
  res.status(200).json(user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });

  res.status(204).send();
});
