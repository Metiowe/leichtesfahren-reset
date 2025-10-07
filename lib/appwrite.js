// lib/appwrite.js

import { Client, Account } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // ⛔️ Oder dein Selfhost: http://localhost:8090/v1
  .setProject("68ac1cb6000fdd4c3031"); // 🆔 Project-ID aus Appwrite-Dashboard

const account = new Account(client);

export { account };
