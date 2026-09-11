from pathlib import Path
import re, sys, json

root = Path(__file__).resolve().parents[1]
errors = []

required = [
    "index.html",
    "styles/main.css",
    "src/app.js",
    "src/api.js",
    "src/store.js",
    "src/character.js",
    "src/puzzles.js",
    "data/content.json",
]
for rel in required:
    if not (root / rel).exists():
        errors.append(f"Missing: {rel}")

html = (root / "index.html").read_text(encoding="utf-8")
for path in re.findall(r'(?:href|src)=["\']([^"\']+)["\']', html):
    if path.startswith(("http://","https://","#","data:")):
        continue
    target = (root / path.lstrip("./")).resolve()
    if not target.exists():
        errors.append(f"Broken HTML reference: {path}")

try:
    data = json.loads((root / "data/content.json").read_text(encoding="utf-8"))
    for world in data.get("worlds", []):
        scene = world.get("scene", "")
        if scene.startswith("./"):
            p = root / scene[2:]
            if not p.exists():
                errors.append(f"Missing world scene: {scene}")
except Exception as e:
    errors.append(f"content.json error: {e}")

if errors:
    print("FAILED")
    for e in errors:
        print(" -", e)
    sys.exit(1)

print("PASS: Rescue Quest repo structure looks valid for GitHub Pages.")
