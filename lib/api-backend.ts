// lib/api-backend.ts

// Wenn das Backend HTTP nutzt, bleib hier bei HTTP! (nip.io hat standardmäßig kein HTTPS Zertifikat)
const API_BASE_URL = "http://87-106-200-105.nip.io";

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

export async function resetPasswordBackend(params: {
  token: string;
  newPassword: string;
}) {
  const res = await fetch(buildUrl("/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: params.token,
      newPassword: params.newPassword,
    }),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // plain text ist ok
  }

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.error ||
      (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
      `HTTP ${res.status}: ${text}`;
    throw new Error(String(msg));
  }

  return data || { ok: true };
}
