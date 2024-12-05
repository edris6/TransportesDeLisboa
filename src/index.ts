import { timeforstation } from "./metrolisboa.mjs";
import { createServer } from "./server.js";
/*
async function MetroStatus(): Promise<Record<string, string> | string> {
  let status_: Record<string, string> | string = await status();

  return status_;
}
*/
/*async function timeforstationmetro(
  station: string,
): Promise<string | Record<string, string>> {
  //@ts-ignore
  let time_: string = await timeforstation(station);

  return time_;
}*/
const PORT: number = 3000;

// Create the server instance
const app = createServer();

// Create the server instance and await the result
async function startServer() {
  const app = await createServer(); // Wait for the server to be created

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer(); // Call the startServer function
/*
const result = await timeforstationmetro("CP");
console.log(result[0]);
*/
