import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getProfile, saveProfile, resetProfile } from "./storage.js";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const contentPath = path.join(__dirname, "data", "content.json");
const app = express();

app.use(express.json({ limit: "512kb" }));
app.use(express.static(publicDir, { extensions: ["html"] }));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "rescue-quest-kids" }));
app.get("/api/content", async (_req, res, next) => {
  try { res.json(JSON.parse(await fs.readFile(contentPath, "utf8"))); }
  catch (err) { next(err); }
});
app.get("/api/profile/:id", async (req, res, next) => {
  try { res.json(await getProfile(req.params.id)); }
  catch (err) { next(err); }
});
app.put("/api/profile/:id", async (req, res, next) => {
  try { res.json(await saveProfile(req.params.id, req.body)); }
  catch (err) { next(err); }
});
app.delete("/api/profile/:id", async (req, res, next) => {
  try { await resetProfile(req.params.id); res.status(204).end(); }
  catch (err) { next(err); }
});

app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Rescue Quest Kids running on http://localhost:${port}`));
