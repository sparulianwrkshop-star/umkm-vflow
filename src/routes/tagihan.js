"use strict";

const router = require("express").Router();
const { callVFlow } = require("../utils/vflow");
const { validate } = require("../middleware/validate");
const { kalkulasiTagihanSchema } = require("../utils/schemas");

/**
 * POST /api/pesanan/tagihan/hitung
 *
 * Menghitung total tagihan pesanan termasuk diskon, biaya admin,
 * dan biaya pengiriman via VRule Engine (aturan_harga_umkm_v1).
 * Memanggil Workflow 3 (w3-kalkulasi-tagihan) di VFlow.
 *
 * Body: { subtotal, total_item, tipe_pelanggan, metode_pembayaran, metode_pengambilan }
 * Response: { subtotal, diskon, biaya_admin, biaya_pengiriman, total_tagihan, ... }
 */
router.post("/hitung", validate(kalkulasiTagihanSchema), async (req, res, next) => {
  try {
    const result = await callVFlow("/trigger/w3-kalkulasi-tagihan", req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
