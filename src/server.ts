import express, { Application, Request, Response } from "express";
import {
  status,
  timeforstation,
  available_stations_request,
  available_destinos,
} from "./metrolisboa.mjs";
//@ts-ignore
import cors from "cors";
import path from "path";
import { writeFile } from "fs";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import * as GtfsRealtimeBindings from "gtfs-realtime-bindings";
import {
  getCarrisRouteId,
  getCarrisShapes,
  getCarrisStops,
} from "./gtfscarris.js";
const print = console.log;
const available_station_metro: Array<string> = await available_stations();
interface StationData {
  station: string;
}
interface ProxyQuery {
  url?: string;
}
/**
 * returns list of available metro stations
 * @returns available stations metro
 */
async function available_stations(): Promise<Array<string>> {
  let final: Array<string> = [];
  const data = await available_stations_request();
  //@ts-ignore
  for (let i = 0; i < Object.keys(data).length; i++) {
    //@ts-ignore
    final.push(data[i].stop_id);
  }
  return final;
}
/**
 * validates if value is string
 */
function validateStationData(data: StationData): boolean {
  return typeof data.station === "string";
}
export async function createServer(): Promise<Application> {
  const app: Application = express();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.json());
  app.use(cors());
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.get("/api/greet", async (req: Request, res: Response): Promise<void> => {
    res.json({ message: "Hello, welcome to our API!" });
  });
  app.get("/", async (req: Request, res: Response): Promise<void> => {
    res.render("home");
  });
  app.get("/metrolisboa", async (req, res) => {
    const metrostatus = await status();
    let destinos = await available_destinos();
    print(destinos);
    res.render("metrolisboa", {
      metrostatus,
      available_station_metro,
      destinos,
    });
  });
  app.get("/comboios", async (req, res) => {
    res.render("comboios");
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
        return res.status(401).json({ error: "No password inputed" });
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
  app.post(
    "/api/metro/timeforstation",
    async (req: Request, res: Response): Promise<void> => {
      const data = req.body;
      //print(req.body);
      if (!data) {
        //@ts-ignore
        return res.status(400).json({ error: "I need station" });
      }
      if (!validateStationData(data)) {
        //@ts-ignore
        return res
          .status(400)
          .json({ error: "Wrong data structure or station is not a string" });
      }
      if (available_station_metro.includes(data.station) == false) {
        //@ts-ignore
        return res.status(400).json({ error: "Station doesnt exist" });
      }
      try {
        const metrostatus = await timeforstation(data.station);
        print(metrostatus);
        res.json(metrostatus);
      } catch (error) {
        res.status(500).json({
          error: "Something went wrong while processing async data",
        });
      }
    },
  );
  app.get(
    "/proxy",
    async (
      req: Request<{}, any, any, ProxyQuery>,
      res: Response,
    ): Promise<void> => {
      const targetUrl = req.query.url;

      if (!targetUrl) {
        res.status(400).json({ error: "Missing url query parameter" });
        return;
      }

      try {
        const response = await fetch(targetUrl);
        const contentType = response.headers.get("content-type");
        const body = await response.text();

        if (contentType) res.set("Content-Type", contentType);
        res.send(body);
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: String(error) });
        }
      }
    },
  );
  // ----------- Carris live bus data API ------------

  app.get("/api/carris/live", async (_req, res) => {
    try {
      const rtUrl =
        "https://gateway.carris.pt/gateway/gtfs/api/v2.11/GTFS/realtime/vehiclepositions";
      const response = await fetch(rtUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const buffer = await response.arrayBuffer();
      //@ts-ignore
      const message =
        //@ts-ignore
        GtfsRealtimeBindings.default.transit_realtime.FeedMessage.decode(
          new Uint8Array(buffer),
        ); /*
      writeFile("./print.txt", JSON.stringify(message.entity), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");
    }); */
      const vehicles = message.entity
        //@ts-ignore
        .filter((e) => e.vehicle)
        //@ts-ignore
        .map((v) => ({
          id: v.id,
          lat: v.vehicle.position.latitude,
          lon: v.vehicle.position.longitude,
          routeId: v.vehicle.trip.routeId,
          current_stop_sequence: v.current_stop_sequence ?? null,
        }));

      res.json(vehicles);
    } catch (err) {
      console.error("Carris live fetch error:", err);
      res.status(500).json({ error: "Failed to fetch Carris live data" });
    }
  });

  // Carris live map page route
  app.get("/carris", async (_req, res) => {
    let stops = await getCarrisStops().catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch Carris stops data from db" });
    });
    let shapes = await getCarrisShapes().catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch Carris stops data from db" });
    });
    let ids = await getCarrisRouteId().catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch Carris stops data from db" });
    });
    res.render("carris", {
      stops,
      shapes,
      ids,
    });
  });

  /*app.get("/api/carris/stops", async (_req, res) => {
    let stops = await getCarrisStops().catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch Carris stops data from db" });
    });
    res.json(stops);
  });
  app.get("/api/carris/shapes", async (_req, res) => {
    let shapes = await getCarrisShapes().catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch Carris stops data from db" });
    });
    res.json(shapes);
  });
  app.get("/api/carris/getroutesid", async (_req, res) => {
    let ids = await getCarrisRouteId().catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch Carris stops data from db" });
    });
    res.json(ids);
  });*/
  return app;
}
