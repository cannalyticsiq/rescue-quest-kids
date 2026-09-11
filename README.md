# Rescue Quest Kids — GitHub Pages Safe Full Stack Build

This package fixes the blank-page problem.

## GitHub Pages
Upload the **contents of this folder** to the repository root.

The repo root must contain:
- `index.html`
- `styles/`
- `src/`
- `data/`
- `assets/`
- `server/`
- `package.json`

GitHub Pages serves `index.html` from the repository root.

The frontend now:
- uses relative paths
- loads `./data/content.json` locally
- saves game state in localStorage
- does not require the Node backend in order to render
- optionally connects to a backend later if `rescueQuestApiBase` is set in localStorage

## Backend
The `server/` folder is a Node/Express API. GitHub Pages ignores it, but it can be deployed later on Render or another Node host.

Once the backend is hosted, set:
`localStorage.setItem('rescueQuestApiBase','https://your-backend.example.com')`

Then reload.
