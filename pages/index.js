"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaApple, FaGooglePlay, FaExternalLinkAlt } from "react-icons/fa";

export default function HomePage() {
  const [showResetNotice, setShowResetNotice] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const success = localStorage.getItem("passwordResetSuccess");
    if (success === "true") {
      setShowResetNotice(true);
      localStorage.removeItem("passwordResetSuccess");
    }
  }, []);

  // 🌊 Bubbles – jetzt überall, mit leichtem Glow & float + rise kombiniert
  const bubbles = useMemo(() => {
    if (!mounted) return null;

    const total = 24;
    return Array.from({ length: total }).map((_, i) => {
      const size = 6 + Math.random() * 16; // vmin
      const left = Math.random() * 100; // vw
      const top = Math.random() * 100; // vh
      const dur = 20 + Math.random() * 20; // s
      const delay = Math.random() * 20; // s
      const sway = 6 + Math.random() * 8; // s
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col">
      {/* 🌊 Vollflächige Wasserblasen */}
      <div
        className="bubbles pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        {bubbles}
      </div>

      {/* ✅ Grüner Hinweis */}
      {showResetNotice && (
        <div className="z-20 bg-emerald-500/90 text-white text-center py-3 px-4 font-semibold backdrop-blur border-b border-white/10">
          Passwort aktualisiert – du kannst dich jetzt in der App anmelden.
        </div>
      )}

      {/* 🔝 Brand-Header */}
      <header className="z-10 w-full px-4 pt-8 md:pt-12 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass w-full max-w-md rounded-2xl border border-white/10 shadow-lg px-5 py-4 flex flex-col items-center gap-3"
        >
          {/* Rundes Logo */}
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white/10 border border-white/10 shadow-md">
            <Image
              src="/icon.png"
              alt="FahrenLeicht Icon"
              width={48}
              height={48}
              className="rounded-full object-cover"
              priority
            />
          </div>

          <h1 className="text-[26px] md:text-[30px] font-extrabold text-white tracking-tight">
            FahrenLeicht
          </h1>

          <p className="text-slate-300/85 text-sm md:text-[15px] text-center">
            Diese Seite dient ausschließlich zum sicheren Zurücksetzen deines
            Passworts.
          </p>
        </motion.div>
      </header>

      {/* 🧊 Haupt-Inhalt */}
      <main className="z-10 w-full flex-1 px-4 pb-10 mt-6 md:mt-8 flex justify-center">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-5 md:p-6"
        >
          <h2 className="text-white/95 text-lg md:text-xl font-extrabold mb-2">
            Willkommen bei FahrenLeicht
          </h2>
          <p className="text-slate-300/85 text-sm md:text-[15px] mb-5">
            Diese Seite wird nur für das Zurücksetzen deines Passworts
            verwendet. Besuche unsere Hauptseite, um mehr über unsere App zu
            erfahren.
          </p>

          {/* 🌐 Haupt-CTA → Webseite */}
          <a
            href="https://leichtesfahren.pro"
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <button
              className="w-full rounded-2xl py-3 font-extrabold tracking-wide
                         bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110
                         text-white transition flex items-center justify-center gap-2"
            >
              <FaExternalLinkAlt className="opacity-90" />
              FahrenLeicht-Webseite besuchen
            </button>
          </a>

          {/* App Store Links */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.leichtesfahren"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2 transition"
            >
              <FaGooglePlay />
              <span className="font-semibold">Google Play</span>
            </a>
            <a
              href="https://apps.apple.com/app/leichtesfahren"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2 transition"
            >
              <FaApple />
              <span className="font-semibold">App Store</span>
            </a>
          </div>
        </motion.section>
      </main>

      {/* 🔻 Footer */}
      <footer className="z-10 w-full text-center text-[12.5px] text-slate-400/85 py-5">
        © {new Date().getFullYear()} FahrenLeicht — Alle Rechte vorbehalten
      </footer>
    </div>
  );
}
