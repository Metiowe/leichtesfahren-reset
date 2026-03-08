// ===== pages/api/recovery.js =====
// Nimmt den Befehl aus der React Native App an und schickt ihn an dein Python-Backend!

export default async function handler(req, res) {
  // 1. CORS-Schutz: Erlaubt deiner Handy-App, mit Vercel zu reden
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight-Check für Apps abfangen
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Türsteher: Wir erlauben NUR POST-Anfragen (Kein GET)
  if (req.method !== "POST") {
    console.error(`Falsche Methode: ${req.method} statt POST`);
    return res
      .status(405)
      .json({ error: "Method Not Allowed - Nur POST erlaubt" });
  }

  // E-Mail aus der App auslesen
  const { email } = req.body;
  if (!email) {
    console.error("Fehler: Keine E-Mail im Request-Body gefunden!");
    return res.status(400).json({ error: "E-Mail fehlt" });
  }

  try {
    // 3. Hier leiten wir die E-Mail an deinen Python-Server auf IONOS weiter!
    // Falls du die URL in .env stehen hast, nimmt er die, sonst den harten Fallback
    let API_BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://87-106-200-105.nip.io";

    // 🚀 DER LEBENSRETTENDE FIX: Wir zwingen Vercel zu HTTPS!
    // (Verhindert den automatischen Redirect, der aus POST einen GET-Befehl macht)
    if (API_BASE.startsWith("http://")) {
      API_BASE = API_BASE.replace("http://", "https://");
    }

    // 🔥 WICHTIG: Der Slash '/' am Ende ist zwingend nötig,
    // damit FastAPI (Python) keinen 405 Redirect-Fehler wirft!
    const pythonEndpoint = `${API_BASE}/auth/reset-password-request/`;

    console.log(
      `🚀 Sende Reset-Befehl für ${email} an dein Python-Backend: ${pythonEndpoint}`,
    );

    // Wir schießen den POST-Request an Python ab
    const backendRes = await fetch(pythonEndpoint, {
      method: "POST", // 🚨 DAS MUSS POST SEIN!
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // 4. Hat Python gemeckert? (Dein 405 Fehler von vorhin!)
    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error(
        `🚨 Python-Backend hat Fehler geworfen (HTTP ${backendRes.status}):`,
        errText,
      );

      // Hacker-Schutz: Wir loggen den Fehler zwar für dich,
      // aber der App sagen wir "Alles OK", damit Hacker keine E-Mails raten können.
      return res.status(200).json({ ok: true });
    }

    // 5. Alles lief glatt! Python hat die Mail erfolgreich versendet!
    console.log("✅ Python-Backend hat die Mail erfolgreich versendet!");
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("🚨 Vercel-Server ist intern abgestürzt:", error);
    // Auch bei Absturz: App "ok" vorgaukeln (Security Best Practice)
    return res.status(200).json({ ok: true });
  }
}
