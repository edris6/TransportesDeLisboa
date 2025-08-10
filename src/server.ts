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
import { stopover, trip } from "./comboios.mjs";
import fetch from "node-fetch";
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import {importCarrisGtfs}from './gtfscarris'
import e from "express";
const print = console.log;
const available_station_metro: Array<string> = await available_stations();
interface StationData {
  station: string;
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
    "/api/comboios/stopover",
    async (req: Request, res: Response): Promise<void> => {
      const data = req.body;
      print(req.body);
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

      try {
        const stopover_station = await stopover(data.station);
        if (stopover_station != null) {
          res.json(stopover_station);
        } else {
          //@ts-ignore
          return res.status(400).json({ error: "Station doesnt exist" });
        }
      } catch (error) {
        res.status(500).json({
          error: "Something went wrong while processing async data",
        });
      }
    },
  );
  app.post(
    "/api/comboios/trip",
    async (req: Request, res: Response): Promise<void> => {
      const data = req.body;
      print(req.body);
      if (!data) {
        //@ts-ignore
        return res.status(400).json({ error: "I need train route id " });
      }
      if (!validateStationData(data)) {
        //@ts-ignore
        return res
          .status(400)
          .json({ error: "Wrong data structure or route id is not a string" });
      }

      try {
        const trip_ = await trip(data.station);
        if (trip_ != null) {
          res.json(trip_);
        } else {
          //@ts-ignore
          return res.status(400).json({ error: "line id doesnt exist" });
        }
      } catch (error) {
        res.status(500).json({
          error: "Something went wrong while processing async data",
        });
      }
    },
  );

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

  // ----------- Carris live bus data API ------------

  app.get("/api/carris/live", async (_req, res) => {
    try {
      const rtUrl = "https://gateway.carris.pt/gateway/gtfs/api/v2.11/GTFS/realtime/vehiclepositions";
      const response = await fetch(rtUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const buffer = await response.arrayBuffer();
      //@ts-ignore
      const message = GtfsRealtimeBindings.default.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));/*
      writeFile("./print.txt", JSON.stringify(message.entity), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");
    }); */
      const vehicles = message.entity
      //@ts-ignore  
      .filter(e => e.vehicle)
      //@ts-ignore
        .map(v => ({
          id: v.id,
          lat: v.vehicle.position.latitude,
          lon: v.vehicle.position.longitude,
          routeId: v.vehicle.trip.routeId,
        }));
  
      res.json(vehicles);
    } catch (err) {
      console.error("Carris live fetch error:", err);
      res.status(500).json({ error: "Failed to fetch Carris live data" });
    }
  });

  // Carris live map page route
  app.get("/carris", (_req, res) => {
    res.render("carris");
  });

  app.get("/api/carris/stops", (_req,res) => {
    console.log("Test")

  })

  return app;
}
