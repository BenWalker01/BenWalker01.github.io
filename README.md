# Personal Website

https://ben-walker.uk

## Photography data

The site uses a single file:

- `src/data/photo-catalog.json`

One object per image, keyed by filename.

`photo-catalog.json` is regenerated from export EXIF automatically on:

- `npm run dev`
- `npm run build`
- GitHub Actions deploy on `push` to `main`

## Backfill from RAWs

```bash
npm run backfill:photo-metadata -- --raw-dir /home/ben/Documents/Photography/Raw/ --write
```

This updates `src/data/photo-catalog.json` directly.