# Rescue Quest Kids — full-stack build

This is the clean, modular version of the app. The UI is no longer one giant screenshot or one giant HTML file.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What is implemented

- modular frontend
- Express backend
- API-served game content
- saved profile/progress API
- localStorage state
- 5 worlds
- inventory and rewards
- hidden pumpkins/eggs
- Halloween mini puzzles
- interactive corn maze
- click-to-move explorer character foundation
- responsive layout
- reference mockups stored under `public/assets/reference/`

## Deployment

GitHub stores the code. GitHub Pages cannot execute the Node backend.

For the full-stack app, connect this GitHub repository to Render or Railway. A `render.yaml` is included.

If you only want GitHub Pages, publish the `public/` folder and the frontend can be adjusted to use static content/localStorage only.

## Next art pass

The remaining big visual upgrade is dedicated artwork for Dino Hollow, Blocky Barn, and Moonlit Rescue Bay plus a transparent explorer-dino sprite sheet. The code is already structured so those can be dropped into `public/assets/worlds/` and the character module without rebuilding the app architecture.
