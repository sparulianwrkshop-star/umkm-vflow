"use strict";

/**
 * Middleware: API Key Authentication
 * Setiap request ke /api/* wajib menyertakan header X-API-Key yang valid.
 * Request tanpa key yang cocok langsung ditolak dengan HTTP 401 sebelum
 * menyentuh VFlow.
 */
function apiKeyAuth(req, res, next) {
  const providedKey = req.headers["x-api-key"];
  const validKey = process.env.API_KEY;

  if (!validKey) {
    console.error("[AUTH] API_KEY belum dikonfigurasi di environment!");
    return res.status(500).json({
      status: "error",
      code: "SERVER_MISCONFIGURED",
      message: "Server belum dikonfigurasi dengan benar.",
    });
  }

  if (!providedKey) {
    return res.status(401).json({
      status: "error",
      code: "MISSING_API_KEY",
      message: "Header X-API-Key wajib disertakan.",
    });
  }

  if (providedKey !== validKey) {
    return res.status(401).json({
      status: "error",
      code: "INVALID_API_KEY",
      message: "API Key tidak valid.",
    });
  }

  next();
}

module.exports = { apiKeyAuth };
