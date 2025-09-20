import { createServer } from "./server.js";
import { createCarrisGtfs } from "./gtfscarris.js";
import { createMtsGtfs } from "./mts.js";
const arg = (process.argv[2] || "").trim();
if (!arg) {
  const carrisresponse = await createCarrisGtfs();
  if (carrisresponse !== true) console.error(carrisresponse);

  const mtsresponse = await createMtsGtfs();
  if (mtsresponse !== true) console.error(mtsresponse);

} else if (arg === "nocarris") {
  const mtsresponse = await createMtsGtfs();
  if (mtsresponse !== true) console.error(mtsresponse);

} else if (arg === "nomts") {
  const carrisresponse = await createCarrisGtfs();
  if (carrisresponse !== true) console.error(carrisresponse);

} else if(arg == "nogtfs" || arg == "none" || arg == "no") {
  console.log("No GTFS data imported.");
}

const PORT: number = 3000;

const app = createServer();
/**
 * Starts server, express, console logs port
 */
async function startServer() {
  const app = await createServer();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
