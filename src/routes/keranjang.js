"use strict";

const router = require("express").Router();
const { callVFlow } = require("../utils/vflow");
const { validate } = require("../middleware/validate");
const { bukaKeranjangSchema } = require("../utils/schemas");

/**
 * POST /api/pesanan/keranjang
 *
 * Membuka keranjang pesanan baru.
 * Memanggil Workflow 1 (w1-buka-keranjang) di VFlow.
 *
 * Body: { pelanggan_id: UUID, kasir_id: UUID }
 * Response: { status, pesanan_id, kasir_id, created_at, message }
 */
router.post("/", validate(bukaKeranjangSchema), async (req, res, next) => {
  try {
    const result = await callVFlow("/trigger/w1-buka-keranjang", req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
