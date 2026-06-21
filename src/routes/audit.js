"use strict";

const router = require("express").Router();
const { callVFlow } = require("../utils/vflow");
const { validate } = require("../middleware/validate");
const { auditLogSchema } = require("../utils/schemas");

/**
 * POST /api/audit/log
 *
 * Mencatat audit log secara asinkron (fire-and-forget dari sisi client).
 * Memanggil Workflow 6 (w6-audit-log) di VFlow melalui detached edge.
 * Response dikembalikan segera tanpa menunggu database write selesai.
 *
 * Body: { pesanan_id?, aktor_id?, aktivitas_tipe, payload_log, waktu_kejadian? }
 */
router.post("/log", validate(auditLogSchema), async (req, res, next) => {
  // Tambahkan waktu_kejadian default jika tidak dikirim
  const payload = {
    waktu_kejadian: new Date().toISOString(),
    ...req.body,
  };

  // Langsung acknowledge ke client — tidak tunggu VFlow selesai
  res.status(202).json({
    status: "accepted",
    message: "Audit log diterima dan sedang diproses secara asinkron.",
  });

  // Kirim ke VFlow secara fire-and-forget (tidak perlu await)
  callVFlow("/trigger/w6-audit-log", payload).catch((err) => {
    console.error("[AUDIT] Gagal mengirim audit log ke VFlow:", err.message);
  });
});

module.exports = router;
