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

  app.get("/metrolisboa", async (req, res) => {
    const metrostatus = await status();
    res.render("metrolisboa", { metrostatus });
  });

  app.post(
    "/api/metro/status",
    async (req: Request, res: Response): Promise<void> => {
      const { data } = req.body;
      //IMPORTANT: NEEDS WORKING
      if (data.code != "123") {
        //@ts-ignore
        return res.status(401).json({ error: "Wrong password" });
      } else if (!data) {
        //@ts-ignore
        return res.status(401).json({ error: "No password required" });
      }

      try {
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
