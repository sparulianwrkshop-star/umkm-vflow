# Sistem Manajemen Pesanan UMKM — Backend VFlow

Backend service Node.js Express untuk Sistem Manajemen Pesanan UMKM berbasis VFlow.
Kelompok 3 — 2025.

## Arsitektur

```
Client → [Express Backend] → [VFlow Server] → [PostgreSQL]
              ↑
        (Auth, Validasi,
         Rate Limit)
```

## Struktur Project

```
umkm-vflow-backend/
├── src/
│   ├── index.js              # Entry point Express
│   ├── middleware/
│   │   ├── auth.js           # API Key authentication
│   │   ├── validate.js       # Joi validation middleware
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   ├── keranjang.js      # POST /api/pesanan/keranjang
│   │   ├── stok.js           # POST /api/pesanan/stok/validasi
│   │   ├── tagihan.js        # POST /api/pesanan/tagihan/hitung
│   │   ├── pembayaran.js     # POST /api/pesanan/pembayaran/konfirmasi
│   │   ├── penyelesaian.js   # POST /api/pesanan/selesai
│   │   └── audit.js          # POST /api/audit/log
│   └── utils/
│       ├── vflow.js          # HTTP client ke VFlow
│       └── schemas.js        # Joi validation schemas
├── workflows/                # VWFD YAML (upload ke VFlow)
│   ├── workflow-1-buka-keranjang.yaml
│   ├── workflow-2-validasi-stok.yaml
│   ├── workflow-3-kalkulasi-tagihan.yaml
│   ├── workflow-4-konfirmasi-pembayaran.yaml
│   ├── workflow-5-penyelesaian-pesanan.yaml
│   └── workflow-6-audit-log.yaml
├── rules/
│   └── aturan_harga_umkm_v1.yaml  # VDICL Rule Pack
├── railway.json
├── Procfile
└── package.json
```

---

## Deploy ke Railway

### 1. Buat akun Railway

Daftar di [railway.app](https://railway.app) jika belum punya akun.

### 2. Push ke GitHub

```bash
git init
git add .
git commit -m "feat: initial backend UMKM VFlow"
git remote add origin https://github.com/username/umkm-vflow-backend.git
git push -u origin main
```

### 3. Buat project baru di Railway

- Klik **New Project** → **Deploy from GitHub repo**
- Pilih repository yang sudah di-push

### 4. Set Environment Variables di Railway

Masuk ke tab **Variables** dan tambahkan:

| Key | Value | Keterangan |
|-----|-------|------------|
| `PORT` | `3000` | Railway otomatis set ini |
| `NODE_ENV` | `production` | Mode produksi |
| `API_KEY` | `(string rahasia min 32 karakter)` | **Wajib diganti!** |
| `VFLOW_BASE_URL` | `http://alamat-vflow-server:8080` | URL VFlow Server kamu |
| `VFLOW_TIMEOUT_MS` | `10000` | Timeout ke VFlow (ms) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Window rate limit (60 detik) |
| `RATE_LIMIT_MAX` | `100` | Max 100 request per window |

> **Penting:** Ganti `API_KEY` dengan string acak yang kuat.
> Generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5. Deploy otomatis

Railway akan otomatis build dan deploy setiap kali kamu push ke branch main.

---

## Upload Workflow ke VFlow

Setelah VFlow Server berjalan, upload semua workflow dengan perintah berikut:

```bash
# Upload satu per satu
curl -X POST http://VFLOW_URL:8080/api/admin/workflow/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @workflows/workflow-1-buka-keranjang.yaml

curl -X POST http://VFLOW_URL:8080/api/admin/workflow/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @workflows/workflow-2-validasi-stok.yaml

curl -X POST http://VFLOW_URL:8080/api/admin/workflow/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @workflows/workflow-3-kalkulasi-tagihan.yaml

curl -X POST http://VFLOW_URL:8080/api/admin/workflow/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @workflows/workflow-4-konfirmasi-pembayaran.yaml

curl -X POST http://VFLOW_URL:8080/api/admin/workflow/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @workflows/workflow-5-penyelesaian-pesanan.yaml

curl -X POST http://VFLOW_URL:8080/api/admin/workflow/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @workflows/workflow-6-audit-log.yaml
```

Upload rule pack:

```bash
curl -X POST http://VFLOW_URL:8080/api/admin/rule-pack/upload \
  -H "Content-Type: application/yaml" \
  --data-binary @rules/aturan_harga_umkm_v1.yaml
```

---

## API Endpoints

Semua endpoint wajib menyertakan header:
```
X-API-Key: (isi dengan API_KEY yang dikonfigurasi)
```

### Health Check (tanpa auth)
```
GET /health
```

### Workflow 1 — Buka Keranjang
```
POST /api/pesanan/keranjang
Content-Type: application/json

{
  "pelanggan_id": "b0000000-0000-0000-0000-000000000001",
  "kasir_id": "a0000000-0000-0000-0000-000000000001"
}
```

### Workflow 2 — Validasi Stok
```
POST /api/pesanan/stok/validasi
Content-Type: application/json

{
  "pesanan_id": "uuid-pesanan",
  "produk_id": "c0000000-0000-0000-0000-000000000001",
  "jumlah": 3
}
```

### Workflow 3 — Kalkulasi Tagihan
```
POST /api/pesanan/tagihan/hitung
Content-Type: application/json

{
  "subtotal": 75000,
  "total_item": 3,
  "tipe_pelanggan": "member",
  "metode_pembayaran": "e-wallet",
  "metode_pengambilan": "delivery"
}
```

### Workflow 4 — Konfirmasi Pembayaran
```
POST /api/pesanan/pembayaran/konfirmasi
Content-Type: application/json

{
  "pesanan_id": "uuid-pesanan",
  "total_tagihan": 77500,
  "nominal_dibayar": 100000
}
```

### Workflow 5 — Selesaikan Pesanan
```
POST /api/pesanan/selesai
Content-Type: application/json

{
  "pesanan_id": "uuid-pesanan"
}
```

### Workflow 6 — Audit Log (fire-and-forget)
```
POST /api/audit/log
Content-Type: application/json

{
  "aktivitas_tipe": "PESANAN_SELESAI",
  "pesanan_id": "uuid-pesanan",
  "aktor_id": "uuid-kasir",
  "payload_log": { "keterangan": "transaksi berhasil" }
}
```

---

## Aturan Diskon (aturan_harga_umkm_v1)

| Kondisi | Diskon |
|---------|--------|
| Reguler, < 10 item | 0% |
| Member, < 10 item | 10% |
| Reguler, ≥ 10 item (grosir) | 5% |
| Member, ≥ 10 item (grosir) | 15% |

| Metode Pembayaran | Biaya Admin |
|-------------------|-------------|
| Tunai | Gratis |
| Transfer | Rp 2.500 |
| E-Wallet | Rp 1.500 |

| Metode Pengambilan | Biaya Pengiriman |
|-------------------|------------------|
| Ambil sendiri | Gratis |
| Delivery | Rp 10.000 |
| Delivery + member + subtotal ≥ Rp 150.000 | Gratis |

---

## Error Codes

| HTTP | Code | Keterangan |
|------|------|------------|
| 400 | `VALIDATION_ERROR` | Input tidak valid |
| 401 | `MISSING_API_KEY` | Header X-API-Key tidak ada |
| 401 | `INVALID_API_KEY` | API Key salah |
| 402 | `PEMBAYARAN_KURANG` | Nominal pembayaran kurang |
| 404 | `NOT_FOUND` | Endpoint tidak ditemukan |
| 409 | `STOK_TIDAK_CUKUP` | Stok tidak mencukupi |
| 429 | `RATE_LIMIT_EXCEEDED` | Terlalu banyak request |
| 500 | `INTERNAL_SERVER_ERROR` | Error internal server |
| 502 | `VFLOW_ERROR` | VFlow tidak dapat dijangkau |
