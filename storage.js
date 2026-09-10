import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const PROFILE_PATH = path.join(DATA_DIR, "profiles.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(PROFILE_PATH); }
  catch { await fs.writeFile(PROFILE_PATH, JSON.stringify({ profiles: {} }, null, 2)); }
}

export async function getProfile(id) {
  await ensureStore();
  const db = JSON.parse(await fs.readFile(PROFILE_PATH, "utf8"));
  return db.profiles[id] ?? null;
}

export async function saveProfile(id, payload) {
  await ensureStore();
  const db = JSON.parse(await fs.readFile(PROFILE_PATH, "utf8"));
  db.profiles[id] = { ...payload, id, updatedAt: new Date().toISOString() };
  await fs.writeFile(PROFILE_PATH, JSON.stringify(db, null, 2));
  return db.profiles[id];
}

export async function resetProfile(id) {
  await ensureStore();
  const db = JSON.parse(await fs.readFile(PROFILE_PATH, "utf8"));
  delete db.profiles[id];
  await fs.writeFile(PROFILE_PATH, JSON.stringify(db, null, 2));
}
