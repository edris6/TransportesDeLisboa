import { createServer } from "./server.js";
import { createCarrisGtfs } from "./gtfscarris.js";
if (process.argv.slice(2)[0] != "nogtfs") {
  const response = await createCarrisGtfs();
  if (response != true) {
    console.error(response);
    process.exit();
  }
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
