require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiKeyAuth } = require("./middleware/auth");
const keranjangroutes = require("./routes/keranjang");
const stokRoutes = require("./routes/stok");
const tagihanRoutes = require("./routes/tagihan");
const pembayaranRoutes = require("./routes/pembayaran");
const penyelesaianRoutes = require("./routes/penyelesaian");
const auditRoutes = require("./routes/audit");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── Request logging ──────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// ── Global rate limiter ──────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Terlalu banyak permintaan. Coba lagi dalam beberapa saat.",
  },
});
app.use("/api/", limiter);

// ── Health check (tanpa auth) ─────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "umkm-vflow-backend",
    timestamp: new Date().toISOString(),
    vflow_url: process.env.VFLOW_BASE_URL,
  });
});

// ── API Key authentication (semua /api/* wajib) ──────────────────────────────
app.use("/api/", apiKeyAuth);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/pesanan/keranjang", keranjangroutes);
app.use("/api/pesanan/stok", stokRoutes);
app.use("/api/pesanan/tagihan", tagihanRoutes);
app.use("/api/pesanan/pembayaran", pembayaranRoutes);
app.use("/api/pesanan/selesai", penyelesaianRoutes);
app.use("/api/audit", auditRoutes);

// ── 404 & global error handler ───────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[UMKM] Server berjalan di port ${PORT} (${process.env.NODE_ENV})`);
  console.log(`[UMKM] VFlow target: ${process.env.VFLOW_BASE_URL}`);
});

module.exports = app;
