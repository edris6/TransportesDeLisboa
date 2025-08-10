import { importGtfs } from 'gtfs';
import { readFile } from 'fs/promises';
import path from 'node:path';
import sqlite3 from 'sqlite3'; // <-- this was missing

sqlite3.verbose();

// Load config
const config = JSON.parse(
  await readFile(path.join(process.cwd(), '/src/carrisfetch.json'))
);

// Import GTFS
try {
  console.log('Downloading GTFS data...');
  await importGtfs(config);
  console.log('GTFS data imported into', config.sqlitePath);
} catch (error) {
  console.error('Error importing GTFS:', error);
}

// Query SQLite
const db = new sqlite3.Database(config.sqlitePath, sqlite3.OPEN_READONLY);

db.all(
  'SELECT route_id, route_short_name, route_long_name FROM routes LIMIT 5',
  [],
  (err, rows) => {
    if (err) throw err;
    console.log(rows);
  }
);

db.close();
