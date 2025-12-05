// pages/api/recovery.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });

  try {
    const backendBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://mini-auth-backend.onrender.com";

    const resp = await fetch(
      `${backendBase.replace(/\/$/, "")}/auth/reset-password-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      console.error("reset-request failed", data);
      return res.status(500).json({ error: "Failed" });
    }

    // data.resetUrl → in dein nodemailer-Template einbauen
    // (dein existierender E-Mail-Code hier)

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("recovery api error", e);
    return res.status(500).json({ error: "Failed" });
  }
}
