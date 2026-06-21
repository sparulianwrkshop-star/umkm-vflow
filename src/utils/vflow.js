"use strict";

const axios = require("axios");

const VFLOW_BASE_URL = process.env.VFLOW_BASE_URL || "http://localhost:8080";
const TIMEOUT_MS = parseInt(process.env.VFLOW_TIMEOUT_MS) || 10_000;

/**
 * Memanggil webhook endpoint VFlow.
 *
 * @param {string} path   - Webhook path, mis. "/trigger/w1-buka-keranjang"
 * @param {object} body   - Payload JSON yang dikirim ke VFlow
 * @returns {Promise<object>} - Data response dari VFlow
 */
async function callVFlow(path, body) {
  const url = `${VFLOW_BASE_URL}${path}`;

  try {
    const response = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: TIMEOUT_MS,
    });
    return response.data;
  } catch (err) {
    // Tangkap error HTTP dari VFlow (4xx / 5xx)
    if (err.response) {
      const vflowErr = new Error(
        `VFlow mengembalikan error ${err.response.status}: ` +
          JSON.stringify(err.response.data)
      );
      vflowErr.isVFlowError = true;
      vflowErr.vflowStatus = err.response.status;
      vflowErr.vflowData = err.response.data;
      throw vflowErr;
    }

    // Timeout atau network error
    if (err.code === "ECONNABORTED" || err.code === "ECONNREFUSED") {
      const netErr = new Error(
        `Tidak dapat terhubung ke VFlow Server (${url}). ` +
          "Pastikan VFlow sudah berjalan."
      );
      netErr.isVFlowError = true;
      throw netErr;
    }

    throw err;
  }
}

module.exports = { callVFlow };
