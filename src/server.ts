import express, { Application, Request, Response } from "express";
import { status } from "./metrolisboa.mjs";
const print = console.log;

export async function createServer(): Promise<Application> {
  const app: Application = express();

  // Middleware to parse JSON bodies
  app.use(express.json());

  app.set("view engine", "ejs");

  // Example GET endpoint
  app.get("/api/greet", async (req: Request, res: Response): Promise<void> => {
    res.json({ message: "Hello, welcome to our API!" });
  });
  // Simulated constantly changing data
  let data = {
    value: Math.random(), // Initial data
  };

  // Update the data periodically
  setInterval(() => {
    data.value = Math.random();
  }, 1000); // Update every second

  app.get("/status", (req, res) => {
    res.render("status", { data }); // Pass the current data to the template
  });

  // Example POST endpoint with async handler
  app.post(
    "/api/status",
    async (req: Request, res: Response): Promise<void> => {
      const { data } = req.body;

      if (!data) {
        //@ts-ignore
        return res.status(400).json({ error: "No data provided" });
      }

      try {
        // Assuming you're awaiting the result of some async function
        const metrostatus = await status();
        res.json(metrostatus);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Something went wrong while processing async data" });
      }
    },
  );

  return app;
}
/*
async function getAsyncGreeting(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Hello from the async API!"), 1000); // Simulate delay
  });
}
*/
