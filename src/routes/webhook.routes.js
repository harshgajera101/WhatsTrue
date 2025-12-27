// src/routes/webhook.routes.js
const express = require("express");
const router = express.Router();

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;
const { sendWhatsAppText } = require("../services/whatsapp.service");

// GET: webhook verification
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// POST: webhook messages
router.post("/", async (req, res) => {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    // no messages? nothing to do
    if (!messages || messages.length === 0) {
      return res.sendStatus(200);
    }

    const msg = messages[0];

    const from = msg.from;              // "919321735368"
    const text = msg.text?.body || "";  // "!test message"

    console.log("Parsed message:", { from, text });

    if (!text) {
      return res.sendStatus(200);
    }

    const lower = text.toLowerCase().trim();

    // simple trigger: reply only when user sends message starting with !test
    if (lower.startsWith("!test")) {
      const reply =
        `⚠️ Fact-Check Result: ❌ FALSE
        Claim: “Drinking hot water cures COVID completely”
        Verified By: WHO (World Health Organization)
        Real Fact: There is NO scientific evidence that hot water cures COVID-19. The safest protection is vaccination, masks, and proper medical care.
        Source: https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters`;
      await sendWhatsAppText(from, reply);
    }

    // Always send 200 so WhatsApp knows we handled it
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

module.exports = router;
