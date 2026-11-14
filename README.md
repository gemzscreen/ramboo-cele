# Ramboo CELE App

Board-style practice for the Civil Engineering Licensure Examination, built on
original parametric problems whose answers are computed and verified by code.
Part of the Darkwiz Lab family. In development — see [`ROADMAP.md`](ROADMAP.md).

## Run it

Plain HTML/CSS/JS ES modules, no build step. Serve the folder with any static
server (ES modules do not load from `file://`):

```bash
npx serve .
```

## Test it

```bash
npm install
```

```bash
npm test
```

Runs harness stages 1–3 (syntax, DOM, models and templates). See `ROADMAP.md` §6.

## Content

All problems are original. See [`docs/content-policy.md`](docs/content-policy.md).
