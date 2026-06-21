"use strict";

const router = require("express").Router();
const { callVFlow } = require("../utils/vflow");
const { validate } = require("../middleware/validate");
const { validasiStokSchema } = require("../utils/schemas");

/**
 * POST /api/pesanan/stok/validasi
 *
 * Memeriksa ketersediaan stok produk.
 * Memanggil Workflow 2 (w2-validasi-stok) di VFlow.
 *
 * Body: { pesanan_id, produk_id, jumlah }
 * Response: { tersedia, stok_tersisa, nama_produk, harga_satuan, message }
 */
router.post("/validasi", validate(validasiStokSchema), async (req, res, next) => {
  try {
    const result = await callVFlow("/trigger/w2-validasi-stok", req.body);

    // Jika stok tidak cukup, kembalikan 409 Conflict
    if (result.tersedia === false || result.tersedia === "false") {
      return res.status(409).json({
        ...result,
        code: "STOK_TIDAK_CUKUP",
      });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
