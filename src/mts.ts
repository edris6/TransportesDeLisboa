import { importGtfs } from "gtfs";
import { readFile } from "fs/promises";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const mts_config = {
  sqlitePath: "./mts-gtfs",
  agencies: [
    {
    //check for more recent ones 
      url: "https://mts.pt/imt/MTS-20240129.zip"
    }
  ]
};

export async function createMtsGtfs(): Promise<true | Error> {
  await importGtfs(mts_config).catch((err) => {
    return err;
  });
  console.log("MTS GTFS data imported.");
  return true;
}

async function openMtsDb() {
  return open({
    filename: "./mts-gtfs",
    driver: sqlite3.Database,
  });
}
