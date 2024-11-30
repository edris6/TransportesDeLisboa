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

  app.get("/status", async (req, res) => {
    const metrostatus = await status();
    res.render("status", { metrostatus });
  });

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
