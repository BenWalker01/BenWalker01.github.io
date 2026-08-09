#!/usr/bin/env node
/**
 * Interactive script to set dates on photos.
 * Opens each photo in your image viewer, prompts for a date,
 * then saves dates to src/data/photo-dates.json.
 *
 * Usage: node scripts/set-photo-dates.mjs
 * Press Enter to skip a photo.
 * Type 'q' to quit.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { createInterface } from 'readline';
import { execSync, spawn } from 'child_process';

const PHOTOS_DIR = resolve(process.cwd(), 'src/assets/photos');
const DATA_DIR = resolve(process.cwd(), 'src/data');
const DATES_PATH = resolve(DATA_DIR, 'photo-dates.json');
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function getPhotos() {
  return readdirSync(PHOTOS_DIR)
    .filter(f => extensions.has(f.slice(f.lastIndexOf('.')).toLowerCase()))
    .sort();
}

function openImage(filePath) {
  const viewers = ['feh', 'eog', 'shotwell', 'xdg-open'];
  for (const viewer of viewers) {
    try {
      execSync(`which ${viewer}`, { stdio: 'ignore' });
      const proc = spawn(viewer, [filePath], { detached: true, stdio: 'ignore' });
      proc.unref();
      return;
    } catch {
      // not found, try next
    }
  }
}

function parseDate(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept: YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    date = new Date(trimmed);
  } else if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split(/[\/\-]/);
    date = new Date(`${y}-${m}-${d}`);
  } else {
    return null;
  }

  return isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function readDates() {
  if (!existsSync(DATES_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(DATES_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function main() {
  const photos = getPhotos();

  if (photos.length === 0) {
    console.log('No photos found in', PHOTOS_DIR);
    process.exit(0);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const question = (prompt) => new Promise(res => rl.question(prompt, res));

  console.log(`\nFound ${photos.length} photos in src/assets/photos/`);
  console.log('Accepted date formats: YYYY-MM-DD or DD/MM/YYYY');
  console.log('Press Enter to skip, q to quit.\n');

  const dates = readDates();
  let changed = 0;

  for (let i = 0; i < photos.length; i++) {
    const filename = photos[i];
    const filePath = join(PHOTOS_DIR, filename);
    const currentDate = typeof dates[filename] === 'string'
      ? dates[filename]
      : toIsoDate(statSync(filePath).mtime);

    console.log(`[${i + 1}/${photos.length}] ${filename}  (current: ${currentDate})`);
    openImage(filePath);

    const input = await question('  Date: ');

    if (input.trim().toLowerCase() === 'q') {
      console.log('\nQuitting.');
      break;
    }

    if (!input.trim()) {
      console.log('  Skipped.\n');
      continue;
    }

    const date = parseDate(input);
    if (!date) {
      console.log('  Invalid format — skipped.\n');
      continue;
    }

    const isoDate = toIsoDate(date);
    dates[filename] = isoDate;
    console.log(`  Set to ${isoDate}\n`);
    changed++;
  }

  rl.close();
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATES_PATH, `${JSON.stringify(dates, null, 2)}\n`, 'utf8');
  console.log(`Done. Updated ${changed} photo(s) in src/data/photo-dates.json.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
