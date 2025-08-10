import { importGtfs } from "gtfs";
import { readFile } from "fs/promises";
import path from "path";

export async function importCarrisGtfs() {
  const config = JSON.parse(
    await readFile(path.join(process.cwd(), "/src/carrisfetch.json"), "utf8")
  );
  console.log("Importing Carris GTFS data...");
  await importGtfs(config);
  console.log("Carris GTFS data imported.");
}

importCarrisGtfs().catch(console.error);
