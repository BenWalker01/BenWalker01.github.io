#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PHOTOS_DIR = path.resolve(ROOT, 'src/assets/photos');
const DATA_DIR = path.resolve(ROOT, 'src/data');
const DATES_PATH = path.resolve(DATA_DIR, 'photo-dates.json');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ts = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(ts);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseDateFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');

  let match = base.match(/^(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    const value = `${y}-${m}-${d}`;
    return isValidIsoDate(value) ? value : null;
  }

  match = base.match(/^(\d{2})[-_](\d{2})[-_](\d{4})/);
  if (match) {
    const [, d, m, y] = match;
    const value = `${y}-${m}-${d}`;
    return isValidIsoDate(value) ? value : null;
  }

  return null;
}

function readExistingDates() {
  if (!existsSync(DATES_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(DATES_PATH, 'utf8'));
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function main() {
  if (!existsSync(PHOTOS_DIR)) {
    console.log('No photos directory found at src/assets/photos');
    process.exit(0);
  }

  const photos = readdirSync(PHOTOS_DIR)
    .filter((file) => EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const existing = readExistingDates();
  const next = {};
  const stats = { existing: 0, filename: 0, mtime: 0 };

  for (const filename of photos) {
    const existingDate = existing[filename];
    if (typeof existingDate === 'string' && isValidIsoDate(existingDate)) {
      next[filename] = existingDate;
      stats.existing++;
      continue;
    }

    const fromFilename = parseDateFromFilename(filename);
    if (fromFilename) {
      next[filename] = fromFilename;
      stats.filename++;
      continue;
    }

    const mtime = statSync(path.join(PHOTOS_DIR, filename)).mtime;
    next[filename] = formatDate(mtime);
    stats.mtime++;
  }

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATES_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');

  console.log(`Generated src/data/photo-dates.json for ${photos.length} photo(s).`);
  console.log(`Reused existing: ${stats.existing}, from filename: ${stats.filename}, from mtime: ${stats.mtime}`);
}

main();
