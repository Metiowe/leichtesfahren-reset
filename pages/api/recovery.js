// pages/api/recovery.js
import { Client, Account } from "appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const project = process.env.APPWRITE_PROJECT;
const RESET_URL =
  process.env.NEXT_PUBLIC_RESET_URL ||
  "https://leichtesfahren-reset.vercel.app/reset";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });

  try {
    const client = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);
    await account.createRecovery(email, RESET_URL);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Failed" });
  }
}
