// ===== pages/api/recovery.js =====
// Nimmt den Befehl aus der React Native App an und schickt ihn an dein Python-Backend!

export default async function handler(req, res) {
  // 1. CORS-Schutz
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Türsteher
  if (req.method !== "POST") {
    console.error(`Falsche Methode: ${req.method} statt POST`);
    return res
      .status(405)
      .json({ error: "Method Not Allowed - Nur POST erlaubt" });
  }

  const { email } = req.body;
  if (!email) {
    console.error("Fehler: Keine E-Mail im Request-Body gefunden!");
    return res.status(400).json({ error: "E-Mail fehlt" });
  }

  try {
    // 3. API_BASE laden (ohne erzwungenes HTTPS, da dein Backend scheinbar HTTP ist)
    // Und GANZ WICHTIG: Kein Slash am Ende der Base-URL!
    const API_BASE = (
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://87-106-200-105.nip.io"
    ).replace(/\/$/, "");

    // 🚀 FIX: KEIN Slash am Ende der Route! Das verhindert den 405-Redirect-Fehler.
    const pythonEndpoint = `${API_BASE}/auth/reset-password-request`;

    console.log(
      `🚀 Sende Reset-Befehl für ${email} an dein Python-Backend: ${pythonEndpoint}`,
    );

    const backendRes = await fetch(pythonEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // 4. Hat Python gemeckert?
    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error(
        `🚨 Python-Backend hat Fehler geworfen (HTTP ${backendRes.status}):`,
        errText,
      );
      // 🔥 Wir geben den Fehler jetzt WIRKLICH zurück, damit du in der App siehst, was kaputt ist!
      return res
        .status(backendRes.status)
        .json({ error: `Backend Fehler: ${errText}` });
    }

    // 5. Alles glatt gelaufen
    console.log("✅ Python-Backend hat die Mail erfolgreich versendet!");
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("🚨 Vercel-Server ist intern abgestürzt:", error);
    return res
      .status(500)
      .json({ error: "Vercel Proxy Fehler: " + error.message });
  }
}
