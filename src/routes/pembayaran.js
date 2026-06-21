"use strict";

const router = require("express").Router();
const { callVFlow } = require("../utils/vflow");
const { validate } = require("../middleware/validate");
const { konfirmasiPembayaranSchema } = require("../utils/schemas");

/**
 * POST /api/pesanan/pembayaran/konfirmasi
 *
 * Memvalidasi nominal pembayaran dan mengupdate status pesanan ke 'lunas'.
 * Memanggil Workflow 4 (w4-konfirmasi-pembayaran) di VFlow.
 *
 * Body: { pesanan_id, total_tagihan, nominal_dibayar }
 * Response: { status, pesanan_id, status_pesanan, total_tagihan, nominal_dibayar, kembalian, message }
 */
router.post("/konfirmasi", validate(konfirmasiPembayaranSchema), async (req, res, next) => {
  try {
    const result = await callVFlow("/trigger/w4-konfirmasi-pembayaran", req.body);

    // Jika pembayaran gagal (kurang), kembalikan 402 Payment Required
    if (result.status === "failed") {
      return res.status(402).json({
        ...result,
        code: "PEMBAYARAN_KURANG",
      });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
