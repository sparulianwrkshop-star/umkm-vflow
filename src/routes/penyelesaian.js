"use strict";

const router = require("express").Router();
const { callVFlow } = require("../utils/vflow");
const { validate } = require("../middleware/validate");
const { penyelesaianPesananSchema } = require("../utils/schemas");

/**
 * POST /api/pesanan/selesai
 *
 * Menutup transaksi secara resmi dan memperbarui stok produk.
 * Memanggil Workflow 5 (w5-penyelesaian-pesanan) di VFlow.
 *
 * Body: { pesanan_id }
 * Response: { status, pesanan_id, status_pesanan, updated_at, message }
 */
router.post("/", validate(penyelesaianPesananSchema), async (req, res, next) => {
  try {
    const result = await callVFlow("/trigger/w5-penyelesaian-pesanan", req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
