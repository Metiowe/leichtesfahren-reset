// lib/api-backend.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://mini-auth-backend.onrender.com";

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

export async function resetPasswordBackend(params: {
  userId: string;
  token: string;
  newPassword: string;
}) {
  const res = await fetch(buildUrl("/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
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
