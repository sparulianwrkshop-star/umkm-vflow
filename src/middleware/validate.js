"use strict";

/**
 * Factory middleware: memvalidasi req.body terhadap Joi schema.
 * Jika gagal → langsung return 400 dengan pesan error terstandarisasi.
 *
 * Penggunaan:
 *   router.post("/", validate(mySchema), handler)
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,  // kumpulkan semua error sekaligus
      stripUnknown: true, // buang field yang tidak ada di schema
    });

    if (error) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: error.details.map((d) => d.message).join("; "),
      });
    }

    // Ganti body dengan value yang sudah disanitasi
    req.body = value;
    next();
  };
}

module.exports = { validate };
