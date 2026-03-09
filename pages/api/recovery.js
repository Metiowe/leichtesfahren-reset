// pages/api/recovery.js

import nodemailer from "nodemailer";

const FROM_NAME = process.env.SMTP_FROM_NAME || "FahrenLeicht Support";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "mehdiowen44@gmail.com";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
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
    // 🚀 DER LEBENSRETTENDE FIX: Wir zwingen Vercel zu HTTPS, egal was in der .env steht!
    let backendBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://87-106-200-105.nip.io";
    backendBase = backendBase.replace("http://", "https://").replace(/\/$/, "");

    const pythonEndpoint = `${backendBase}/auth/reset-password-request`;
    console.log(`🚀 Sende POST an Python: ${pythonEndpoint}`);

    // 1️⃣ Backend: Token + Reset-URL holen
    const resp = await fetch(pythonEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("❌ Python-Backend Fehler:", resp.status, data);
      return res
        .status(resp.status)
        .json({ error: data.detail || "Fehler vom Python-Backend" });
    }

    const resetUrl = data.resetUrl;
    if (!resetUrl) {
      console.log("⚠️ Keine resetUrl vom Backend. User existiert nicht.");
      return res.status(200).json({ ok: true });
    }

    // 2️⃣ SMTP Transporter
    if (!SMTP_USER || !SMTP_PASS) {
      console.error("❌ FEHLER: SMTP_USER oder SMTP_PASS fehlen in Vercel!");
      return res.status(500).json({ error: "SMTP Zugangsdaten fehlen." });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.verify().catch((e) => {
      console.error("❌ SMTP Login blockiert:", e?.message || e);
      throw new Error("E-Mail Login gescheitert. Falsches App-Passwort?");
    });

    const preheader =
      "Hier kannst du dein Passwort für FahrenLeicht sicher zurücksetzen.";
    const html = `
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>Passwort zurücksetzen – FahrenLeicht</title>
<meta name="color-scheme" content="light dark">
<style>
  body { margin:0; padding:0; background:#0b1220; }
  .bg { background:#0b1220; padding:24px; }
  .card {
    max-width:520px; margin:0 auto; background:#0f172a;
    border-radius:16px; overflow:hidden; color:#e5e7eb;
    font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Inter,Arial,sans-serif;
  }
  .header {
    padding:18px 22px; border-bottom:1px solid rgba(255,255,255,0.06);
    font-size:16px; font-weight:600;
  }
  .content { padding:22px; font-size:14px; line-height:1.6; }
  .btn-wrap { margin:18px 0 10px; text-align:center; }
  .btn {
    display:inline-block; padding:11px 18px; border-radius:999px;
    background:#0ea5e9; color:#fff !important; text-decoration:none;
    font-size:14px; font-weight:600;
  }
  .link { word-break:break-all; font-size:12px; color:#9ca3af; margin-top:10px; }
  .footer {
    padding:14px 22px; font-size:12px; color:#9ca3af;
    border-top:1px solid rgba(255,255,255,0.06); text-align:center;
  }
  @media (prefers-color-scheme: light) {
    body, .bg { background:#f4f6fb; }
    .card { background:#ffffff; color:#111827; }
    .header, .footer { border-color:#e5e7eb; }
  }
</style>
</head>
<body>
<span style="display:none!important">${preheader}</span>
<div class="bg">
  <div class="card">
    <div class="header">FahrenLeicht – Passwort zurücksetzen</div>
    <div class="content">
      <p>Hallo,</p>
      <p>du hast eine Zurücksetzung deines Passworts angefordert. Klicke auf den folgenden Button, um ein neues Passwort zu vergeben:</p>
      <div class="btn-wrap">
        <a class="btn" href="${resetUrl}" target="_blank" rel="noreferrer">
          Passwort jetzt zurücksetzen
        </a>
      </div>
      <p class="link">
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
        ${resetUrl}
      </p>
      <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
    </div>
    <div class="footer">
      Diese E-Mail wurde automatisch von FahrenLeicht gesendet.
    </div>
  </div>
</div>
</body>
</html>`.trim();

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
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: "🔐 Passwort zurücksetzen – FahrenLeicht",
      text,
      html,
    });

    console.log("✅ E-Mail erfolgreich gesendet! Message-ID:", info.messageId);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("❌ API Error:", e);
    return res.status(500).json({ error: e.message || "Server-Fehler" });
  }
}
