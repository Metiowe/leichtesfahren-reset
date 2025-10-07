// lib/appwrite.js
import { Client, Account } from "appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  "https://fra.cloud.appwrite.io/v1";
const project =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "68ac1cb6000fdd4c3031"; // fallback

const client = new Client().setEndpoint(endpoint).setProject(project);

export const account = new Account(client);
