# R6 Setups

A desktop lineup tracker for Rainbow Six Siege — pick an **Operator**, choose a **Map**, select a bomb **Site**, and manage your **Setups** (title, description, images) for that exact spot.

Built with Electron + Vite + React + TypeScript, with automatic updates via GitHub Releases.

## For players (install once, updates are automatic)

1. Download **`R6-Setups-Setup-<version>.exe`** from the [Releases page](https://github.com/Soomakee/R6-Setups/releases) and install it. This is the **only installer you'll ever run**.
2. That's it. The app checks GitHub for updates:
   - on launch (a few seconds after opening)
   - every 6 hours while running
   - anytime via the version pill in the bottom-right corner
3. When an update is found it downloads in the background. The pill turns orange → **"Update to vX.Y.Z — Click to restart and install"**. Click it (or just quit normally) and the new version replaces the old one. Your lineups and images are preserved.

## For development

```bash
npm install
npm run dev        # web UI in the browser
npm run app:dev    # full desktop app with hot reload
npm run dist       # build the Windows installer into release/
```

- **Operators**: drop `<Name>.png` into `Assets/Operator Icons/`, restart the dev server.
- **Maps**: drop `<Map Name>.webp` into `Assets/Maps/`, restart the dev server. Bomb sites are pre-seeded per map.

## Shipping an update (maintainer)

1. Bump `"version"` in `package.json` (electron-updater compares versions — no bump, no update).
2. Commit and tag:
   ```bash
   git tag v0.1.1
   git push origin main --tags
   ```
3. GitHub Actions builds the NSIS installer and publishes it to GitHub Releases automatically. Installed apps detect it on their next check and self-update. **Never upload a second standalone installer** — the release assets are the update channel.

## How updates work under the hood

- `electron-updater` reads `latest.yml` from the latest published release, compares it to the running version, downloads the new installer (differentially via the `.blockmap` when possible), and applies it on restart.
- `electron-builder.yml` pins the update feed to `github.com/Soomakee/R6-Setups`.
- The renderer gets status via a tiny IPC bridge (`electron/preload.cjs` → `window.desktop`) and shows it in `UpdateBadge`.
