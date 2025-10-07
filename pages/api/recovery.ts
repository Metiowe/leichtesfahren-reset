// pages/api/recovery.js
import { Client, Account } from "appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const project = process.env.APPWRITE_PROJECT; // 68ac1cb6000fdd4c3031
const RESET_URL =
  process.env.NEXT_PUBLIC_RESET_URL ||
  "https://leichtesfahren-reset.vercel.app/reset";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });

  if (!project)
    return res.status(500).json({ error: "APPWRITE_PROJECT missing" });

  try {
    const client = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);
    const r = await account.createRecovery(email, RESET_URL);
    // optional mini-log
    console.log("Recovery created", { id: r.$id, expire: r.expire });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("createRecovery failed:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Failed" });
  }
}
