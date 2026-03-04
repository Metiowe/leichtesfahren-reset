// pages/reset.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { resetPasswordBackend } from "../lib/api-backend";

const MIN_LEN = 8;

function scorePassword(pw) {
  const rules = {
    len: pw.length >= MIN_LEN,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const passed = Object.values(rules).filter(Boolean).length;
  const score = Math.round((passed / 5) * 100);
  return { rules, score };
}

export default function ResetPage() {
  const router = useRouter();
  const { userId, token } = router.query;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { rules, score } = useMemo(() => scorePassword(password), [password]);

  const canSubmit =
    !!userId && !!token && password.length >= MIN_LEN && confirm === password;

  async function handleReset() {
    if (!userId || !token) {
      setMsg({ ok: false, text: "❌ Der Link ist ungültig oder abgelaufen." });
      return;
    }
    if (password.length < MIN_LEN) {
      setMsg({
        ok: false,
        text: `❌ Passwort muss mindestens ${MIN_LEN} Zeichen haben.`,
      });
      return;
    }
    if (password !== confirm) {
      setMsg({ ok: false, text: "❌ Passwörter stimmen nicht überein." });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      await resetPasswordBackend({
        userId: String(userId),
        token: String(token),
        newPassword: password,
      });

      setMsg({
        ok: true,
        text: "✅ Passwort erfolgreich geändert. Du kannst dich jetzt in der App anmelden.",
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("passwordResetSuccess", "true");
      }

      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (e) {
      const t =
        e?.message?.toLowerCase?.().includes("ungültig") ||
        e?.message?.toLowerCase?.includes("abgelaufen")
          ? "Reset-Link ungültig oder abgelaufen. Bitte fordere einen neuen an."
          : e?.message || "Unerwarteter Fehler. Bitte erneut versuchen.";
      setMsg({ ok: false, text: `❌ ${t}` });
    } finally {
      setBusy(false);
    }
  }

  const bubbles = useMemo(() => {
    if (!mounted) return null;
    const total = 24;
    return Array.from({ length: total }).map((_, i) => {
      const size = 6 + Math.random() * 16;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const dur = 20 + Math.random() * 20;
      const delay = Math.random() * 20;
      const sway = 6 + Math.random() * 8;
      const scale = 0.7 + Math.random() * 0.7;
      return (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${left}vw`,
            top: `${top}vh`,
            width: `${size}vmin`,
            height: `${size}vmin`,
            "--dur": `${dur}s`,
            "--delay": `${delay}s`,
            "--sway": `${sway}s`,
            "--scale": scale,
          }}
        />
      );
    });
  }, [mounted]);

  const hasToken = !!userId && !!token;

  return (
    <>
      <Head>
        <title>Sorna – Passwort zurücksetzen</title>
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col">
        <div
          className="bubbles pointer-events-none fixed inset-0"
          aria-hidden="true"
        >
          {bubbles}
        </div>

        <header className="z-10 w-full px-4 pt-8 md:pt-12 flex justify-center">
          <div className="glass w-full max-w-md rounded-2xl border border-white/10 shadow-lg px-5 py-4 flex flex-col items-center gap-3">
            {/* 🚀 ICON WRAPPER VERGRÖSSERT */}
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-white/10 border border-white/10 shadow-md overflow-hidden">
              <Image
                src="/icon.png"
                alt="Sorna Icon"
                width={80} // Höhere Auflösung für schärferes Icon
                height={80}
                className="rounded-full object-cover" // object-cover füllt den Kreis aus
                priority
              />
            </div>
            <h1 className="text-[26px] md:text-[30px] font-extrabold text-white tracking-tight">
              Sorna
            </h1>
            <p className="text-slate-300/85 text-sm md:text-[15px] text-center">
              Bitte gib dein neues Passwort ein.
            </p>
          </div>
        </header>

        <section className="z-10 w-full flex-1 px-4 pb-10 mt-6 md:mt-8 flex justify-center">
          <div className="glass w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-5 md:p-6">
            <h2 className="text-white/95 text-lg md:text-xl font-extrabold mb-4">
              Passwort zurücksetzen
            </h2>

            {!hasToken ? (
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-yellow-200 text-sm">
                Der Link ist ungültig. Öffne ihn direkt aus der E-Mail oder
                fordere einen neuen an.
              </div>
            ) : (
              <>
                <label className="block text-sm font-semibold mb-1 text-white">
                  Neues Passwort
                </label>
                <div className="relative mb-3">
                  <input
                    type={show1 ? "text" : "password"}
                    inputMode="text"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                  <span
                    onClick={() => setShow1((p) => !p)}
                    className="material-icons absolute right-3 top-3.5 cursor-pointer text-slate-300/80 hover:text-white select-none"
                    style={{ fontSize: "20px" }}
                  >
                    {show1 ? "visibility_off" : "visibility"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="meter">
                    <span style={{ width: `${Math.max(6, score)}%` }} />
                  </div>
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-300/80">
                    <li className={rules.len ? "text-emerald-300" : ""}>
                      {rules.len ? "✓" : "•"} Mind. {MIN_LEN} Zeichen
                    </li>
                    <li className={rules.upper ? "text-emerald-300" : ""}>
                      {rules.upper ? "✓" : "•"} Großbuchstabe
                    </li>
                    <li className={rules.lower ? "text-emerald-300" : ""}>
                      {rules.lower ? "✓" : "•"} Kleinbuchstabe
                    </li>
                    <li className={rules.digit ? "text-emerald-300" : ""}>
                      {rules.digit ? "✓" : "•"} Zahl
                    </li>
                    <li className={rules.special ? "text-emerald-300" : ""}>
                      {rules.special ? "✓" : "•"} Sonderzeichen
                    </li>
                  </ul>
                </div>

                <label className="block text-sm font-semibold mb-1 text-white">
                  Passwort bestätigen
                </label>
                <div className="relative mb-3">
                  <input
                    type={show2 ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                  <span
                    onClick={() => setShow2((p) => !p)}
                    className="material-icons absolute right-3 top-3.5 cursor-pointer text-slate-300/80 hover:text-white select-none"
                    style={{ fontSize: "20px" }}
                  >
                    {show2 ? "visibility_off" : "visibility"}
                  </span>
                </div>

                {msg && (
                  <div
                    className={`mb-3 rounded-xl border p-3 text-sm ${
                      msg.ok
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-rose-400/30 bg-rose-400/10 text-rose-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                <button
                  onClick={handleReset}
                  disabled={!canSubmit || busy}
                  className={`w-full rounded-2xl py-3 font-extrabold tracking-wide transition ${
                    !canSubmit || busy
                      ? "bg-sky-400/40 text-white/70 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white"
                  }`}
                >
                  {busy ? "Speichere …" : "Passwort setzen"}
                </button>

                <p className="text-center text-[11px] text-slate-400 mt-4">
                  Probleme?{" "}
                  <a
                    href="mailto:support@sorna.app"
                    className="underline decoration-dotted hover:text-slate-200"
                  >
                    support@sorna.app
                  </a>
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
