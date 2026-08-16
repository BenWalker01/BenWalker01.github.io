#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const PHOTOS_DIR = path.resolve(ROOT, 'src/assets/photos');
const CATALOG_PATH = path.resolve(ROOT, 'src/data/photo-catalog.json');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const EXIF_FIELDS = [
  '-FileName',
  '-DateTimeOriginal',
  '-SubSecDateTimeOriginal',
  '-CreateDate',
  '-Model',
  '-LensModel',
  '-FocalLength',
  '-FNumber',
  '-ExposureTime',
  '-ISO',
];

function toText(value) {
  if (value === null || value === undefined) return 'Unknown';
  const text = String(value).trim();
  return text === '' ? 'Unknown' : text;
}

function toCategory(filename) {
  const prefix = filename.split('-')[0] ?? '';
  return prefix ? `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}` : 'Unknown';
}

function parseExifDate(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4}):(\d{2}):(\d{2}) /);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function formatAperture(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return `f/${value}`;
  const text = String(value).trim().toLowerCase();
  if (!text) return null;
  return text.startsWith('f/') ? text : `f/${text}`;
}

function formatFocalLength(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim().toLowerCase().replace(/\s+/g, '');
  if (!text) return null;
  return text.endsWith('mm') ? text : `${text}mm`;
}

function formatExposure(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim().toLowerCase();
}

function readCatalog() {
  if (!existsSync(CATALOG_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function runExiftool(imagePaths) {
  const run = spawnSync('exiftool', ['-json', ...EXIF_FIELDS, ...imagePaths], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
  });

  if (run.status !== 0) {
    const err = (run.stderr || '').trim();
    throw new Error(err || 'exiftool failed');
  }

  const parsed = JSON.parse(run.stdout);
  return Array.isArray(parsed) ? parsed : [];
}

function fallbackDate(filename) {
  const ts = statSync(path.join(PHOTOS_DIR, filename)).mtime;
  return ts.toISOString().slice(0, 10);
}

function main() {
  if (!existsSync(PHOTOS_DIR)) {
    throw new Error('Photo directory not found: src/assets/photos');
  }

  const exiftoolCheck = spawnSync('exiftool', ['-ver'], { encoding: 'utf8' });
  if (exiftoolCheck.status !== 0) {
    console.warn('exiftool not found; keeping existing src/data/photo-catalog.json unchanged.');
    return;
  }

  const photos = readdirSync(PHOTOS_DIR)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const fullPaths = photos.map((name) => path.join(PHOTOS_DIR, name));
  const exifRows = runExiftool(fullPaths);
  const existing = readCatalog();
  const byFilename = new Map(exifRows.map((row) => [String(row.FileName || ''), row]));

  const next = {};
  for (const filename of photos) {
    const row = byFilename.get(filename) ?? {};
    const prev = existing[filename] ?? {};

    const date =
      parseExifDate(row.SubSecDateTimeOriginal) ??
      parseExifDate(row.DateTimeOriginal) ??
      parseExifDate(row.CreateDate) ??
      (typeof prev.date === 'string' ? prev.date : null) ??
      fallbackDate(filename);

    next[filename] = {
      category: toText(prev.category ?? toCategory(filename)),
      date: toText(date),
      project: toText(prev.project ?? 'Photo Collection'),
      location: toText(prev.location ?? 'Unknown'),
      camera: toText(row.Model ?? prev.camera),
      lens: toText(row.LensModel ?? prev.lens),
      focalLength: toText(formatFocalLength(row.FocalLength) ?? prev.focalLength),
      aperture: toText(formatAperture(row.FNumber) ?? prev.aperture),
      shutter: toText(formatExposure(row.ExposureTime) ?? prev.shutter),
      iso: toText(row.ISO ?? prev.iso),
    };
  }

  writeFileSync(CATALOG_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`Generated src/data/photo-catalog.json for ${photos.length} photo(s).`);
}

main();
