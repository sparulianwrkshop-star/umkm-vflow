"use strict";

const Joi = require("joi");

// ── UUID helper ───────────────────────────────────────────────────────────────
const uuid = () => Joi.string().uuid({ version: "uuidv4" });

// ── Schema: Workflow 1 — Buka Keranjang ──────────────────────────────────────
const bukaKeranjangSchema = Joi.object({
  pelanggan_id: uuid().required().messages({
    "string.guid": "pelanggan_id harus berformat UUID v4.",
    "any.required": "pelanggan_id wajib diisi.",
  }),
  kasir_id: uuid().required().messages({
    "string.guid": "kasir_id harus berformat UUID v4.",
    "any.required": "kasir_id wajib diisi.",
  }),
});

// ── Schema: Workflow 2 — Validasi Stok ──────────────────────────────────────
const validasiStokSchema = Joi.object({
  pesanan_id: uuid().required(),
  produk_id: uuid().required(),
  jumlah: Joi.number().integer().min(1).required().messages({
    "number.min": "jumlah harus minimal 1.",
    "any.required": "jumlah wajib diisi.",
  }),
});

// ── Schema: Workflow 3 — Kalkulasi Tagihan ───────────────────────────────────
const kalkulasiTagihanSchema = Joi.object({
  subtotal: Joi.number().min(0).required(),
  total_item: Joi.number().integer().min(1).required(),
  tipe_pelanggan: Joi.string().valid("reguler", "member").required().messages({
    "any.only": "tipe_pelanggan harus 'reguler' atau 'member'.",
  }),
  metode_pembayaran: Joi.string()
    .valid("tunai", "e-wallet", "transfer")
    .required()
    .messages({
      "any.only": "metode_pembayaran harus 'tunai', 'e-wallet', atau 'transfer'.",
    }),
  metode_pengambilan: Joi.string()
    .valid("ambil-sendiri", "delivery")
    .required()
    .messages({
      "any.only": "metode_pengambilan harus 'ambil-sendiri' atau 'delivery'.",
    }),
});

// ── Schema: Workflow 4 — Konfirmasi Pembayaran ───────────────────────────────
const konfirmasiPembayaranSchema = Joi.object({
  pesanan_id: uuid().required(),
  total_tagihan: Joi.number().min(0).required(),
  nominal_dibayar: Joi.number().min(0).required(),
});

// ── Schema: Workflow 5 — Penyelesaian Pesanan ────────────────────────────────
const penyelesaianPesananSchema = Joi.object({
  pesanan_id: uuid().required(),
});

// ── Schema: Workflow 6 — Audit Log ───────────────────────────────────────────
const auditLogSchema = Joi.object({
  pesanan_id: uuid().allow(null).optional(),
  aktor_id: uuid().allow(null).optional(),
  aktivitas_tipe: Joi.string().max(60).required(),
  payload_log: Joi.object().required(),
  waktu_kejadian: Joi.string().isoDate().optional(),
});

module.exports = {
  bukaKeranjangSchema,
  validasiStokSchema,
  kalkulasiTagihanSchema,
  konfirmasiPembayaranSchema,
  penyelesaianPesananSchema,
  auditLogSchema,
};
