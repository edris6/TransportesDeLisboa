import { importGtfs } from "gtfs";
import { readFile } from "fs/promises";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function createCarrisGtfs(): Promise<true | Error> {
  const config = JSON.parse(
    await readFile(path.join(process.cwd(), "/src/carrisfetch.json"), "utf8"),
  );
  console.log("Importing Carris GTFS data...");
  await importGtfs(config).catch((err) => {
    return err;
  });
  console.log("Carris GTFS data imported.");
  return true;
}

async function openCarrisDb() {
  return open({
    filename: "./gtfs",
    driver: sqlite3.Database,
  });
}

export async function getCarrisStops() {
  const db = await openCarrisDb();
  if (db == null) {
    return null;
  }
  const stops = await db.all(`
    SELECT stop_id, stop_name, stop_lat, stop_lon 
    FROM stops
    ORDER BY stop_name ASC
  `);
  await db.close();
  return stops;
}

export async function getCarrisShapes() {
  const db = await openCarrisDb();
  if (db == null) {
    return null;
  }
  const shapes = await db.all(`
    SELECT shape_id,
       shape_pt_lat AS lat,
       shape_pt_lon AS lon,
       shape_pt_sequence AS seq
FROM shapes
ORDER BY shape_id ASC, shape_pt_sequence ASC;

  `);
  await db.close();
  return shapes;
}

//console.log(await getCarrisStops().catch(console.error));
