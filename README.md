# mealwheel

An arcade-style restaurant picker for people who do not want to decide what to eat.

mealwheel is a standalone static web app. It runs in the browser, stores data in
`localStorage`, and can export/import the full restaurant list through QR-code
backup cards. There is no database, no account system, and no build step.

## Features

- Three-reel arcade slot machine interaction
- Weighted restaurant picks
- Managed tags with colors
- Restaurant editor with limits for names, areas, notes, tags, and weights
- Sound and vibration toggles
- QR-code backup/share card generation
- Import from QR-card image with overwrite or merge
- Mobile-friendly static page

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:4173
```

No dependency install is required because the browser libraries used by the app
are vendored in `vendor/`.

## Checks

```bash
npm run check
```

This runs syntax checks for `app.js` and `server.mjs`.

## Deploy

For GitHub Pages or any static host, publish the project root. The app entry is
`index.html`.

If your host needs a local preview server, use:

```bash
npm run start
```

## Publish to GitHub

Create an empty GitHub repository named `mealwheel`, then run:

```bash
git init
git add .
git commit -m "Initial mealwheel release"
git branch -M main
git remote add origin https://github.com/AnxForever/mealwheel.git
git push -u origin main
```

The included GitHub Pages workflow deploys from `main`.

## Data

Data is stored in the current browser under these localStorage keys:

- `mealwheel-restaurants`
- `mealwheel-tags`
- `mealwheel-settings`

The QR-card backup feature serializes the saved tags and restaurants into a
compact compressed payload. Importing a card can either replace current data or
merge by tag name and restaurant name plus area.

## License

MIT
