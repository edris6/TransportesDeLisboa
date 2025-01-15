import { createServer } from "./server.js";
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
