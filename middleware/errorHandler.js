const { logger } = require("./logger");

const PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: "Resource already exists" },
  P2025: { status: 404, message: "Resource not found" },
  P2003: {
    status: 400,
    message: "Invalid reference: related record not found",
  },
  P2000: { status: 400, message: "Input value too long" },
  P2011: { status: 400, message: "Null constraint violation" },
};

function errorHandler(err, _req, res, _next) {
  logger.error({ err }, "Unhandled error");

  const prismaError = PRISMA_ERROR_MAP[err.code];
  if (prismaError) {
    return res.status(prismaError.status).json({ error: prismaError.message });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
