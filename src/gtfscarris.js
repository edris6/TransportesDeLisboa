import { importGtfs } from 'gtfs';
import { readFile } from 'fs/promises';
import path from 'node:path';
import sqlite3 from 'sqlite3';
sqlite3.verbose();

const config = JSON.parse(
  await readFile(path.join(import.meta.dirname, 'config.json'))
);
console.log(config)
try {
  await importGtfs(config);
} catch (error) {
  console.error(error);
}   

