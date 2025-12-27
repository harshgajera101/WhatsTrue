// src/services/whatsapp.service.js
const axios = require("axios");

const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WA_TOKEN = process.env.WA_ACCESS_TOKEN;

async function sendWhatsAppText(to, text) {
  const url = `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: text,
    },
  };

  const headers = {
    Authorization: `Bearer ${WA_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.post(url, payload, { headers });
    console.log("WhatsApp API response:", res.data);
    return res.data;
  } catch (err) {
    console.error("WhatsApp API ERROR STATUS:", err.response?.status);
    console.error(
      "WhatsApp API ERROR DATA:",
      JSON.stringify(err.response?.data, null, 2)
    );
    throw err;
  }
}

module.exports = { sendWhatsAppText };
