// pages/api/recovery.js

import nodemailer from "nodemailer";

/**
 * Diese API:
 *  - bekommt die E-Mail aus der App
 *  - ruft dein Python-Backend /auth/reset-password-request auf
 *  - Backend erzeugt Token + Reset-URL und gibt sie zurück
 *  - HIER wird die E-Mail mit dem Reset-Link verschickt
 */

const FROM_NAME = process.env.SMTP_FROM_NAME || "FahrenLeicht Support";
// ⚠️ Fallback = deine verifizierte Brevo-Adresse (wie beim OTP!)
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "starowen66@gmail.com";

// Brevo / SMTP Config – gleich wie bei deinem OTP-Service
const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const backendBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://mini-auth-backend.onrender.com";

    // 1️⃣ Backend: Token + Reset-URL holen
    const resp = await fetch(
      `${backendBase.replace(/\/$/, "")}/auth/reset-password-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("reset-request failed", resp.status, data);
      // absichtlich generische Antwort
      return res.status(200).json({ ok: true });
    }

    const resetUrl = data.resetUrl;
    if (!resetUrl) {
      console.log("no resetUrl returned (user may not exist)");
      return res.status(200).json({ ok: true });
    }

    // 2️⃣ SMTP Transporter
    if (!SMTP_USER || !SMTP_PASS) {
      console.error("❌ Missing SMTP_USER / SMTP_PASS env");
      return res.status(500).json({ error: "SMTP not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.verify().catch((e) => {
      console.warn("SMTP verify failed (continue anyway):", e?.message || e);
    });

    const preheader =
      "Hier kannst du dein Passwort für FahrenLeicht sicher zurücksetzen.";
    const html = `... DEIN HTML VON OBEN ...`.trim();

    const text = [
      "FahrenLeicht – Passwort zurücksetzen",
      "",
      "Du hast eine Zurücksetzung deines Passworts angefordert.",
      "Öffne den folgenden Link in deinem Browser, um ein neues Passwort zu setzen:",
      resetUrl,
      "",
      "Wenn du das nicht warst, kannst du diese E-Mail ignorieren.",
    ].join("\n");

    const info = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "🔐 Passwort zurücksetzen – FahrenLeicht",
      text,
      html,
    });

    console.log("✅ reset mail sent", info.messageId || info);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("recovery api error", e);
    return res.status(500).json({ error: "Failed" });
  }
}
