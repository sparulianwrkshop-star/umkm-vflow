"use strict";

/**
 * 404 handler — dipasang setelah semua route.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    status: "error",
    code: "NOT_FOUND",
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
  });
}

/**
 * Global error handler — menangkap semua error yang tidak tertangkap oleh route.
 * Memastikan stack trace internal TIDAK bocor ke client.
 */
function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV !== "production";

  // Log detail error di server
  console.error("[ERROR]", {
    method: req.method,
    path: req.path,
    message: err.message,
    stack: isDev ? err.stack : undefined,
  });

  // Tangani error Joi (validation) yang di-throw manual
  if (err.isJoi) {
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: err.details?.[0]?.message || "Input tidak valid.",
    });
  }

  // Tangani error dari VFlow (axios)
  if (err.isVFlowError) {
    return res.status(502).json({
      status: "error",
      code: "VFLOW_ERROR",
      message: err.message,
    });
  }

  // Default: Internal server error (tanpa ekspos detail)
  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Terjadi kesalahan internal. Silakan coba lagi.",
  });
}

module.exports = { notFoundHandler, errorHandler };
