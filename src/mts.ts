import { importGtfs } from "gtfs";
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
  try {
    await importGtfs(mts_config);
    return true;
  } catch (err) {
    return err as Error;
  }
}

async function openMtsDb() {
  return open({
    filename: "./mts-gtfs",
    driver: sqlite3.Database,
  });
}

type NextTramsParams = {
  routeShortName?: string | null;
  routeId?: string | null;
  stopIds: string[];        // at least one
  date: string;             // "YYYY-MM-DD"
  time: string;             // "HH:MM:SS"
  limit?: number;
};

function toSeconds(hhmmss: string): number {
  const [h, m, s] = hhmmss.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export async function getNextTrams({
  routeShortName = null,
  routeId = null,
  stopIds,
  date,
  time,
  limit = 8,
}: NextTramsParams) {
  if (!date || !time) throw new Error("Please provide `date` and `time`.");
  if (!routeShortName && !routeId)
    throw new Error("Provide either `routeShortName` or `routeId`.");
  if (!stopIds || stopIds.length === 0)
    throw new Error("Provide at least one GTFS `stop_id`.");

  const db = await openMtsDb();

  const sql = `
WITH
active_from_calendar AS (
  SELECT service_id
  FROM calendar
  WHERE REPLACE(:service_date,'-','') BETWEEN start_date AND end_date
    AND CASE strftime('%w', :service_date)
        WHEN '0' THEN sunday
        WHEN '1' THEN monday
        WHEN '2' THEN tuesday
        WHEN '3' THEN wednesday
        WHEN '4' THEN thursday
        WHEN '5' THEN friday
        WHEN '6' THEN saturday
      END = 1
),
removed AS (
  SELECT service_id
  FROM calendar_dates
  WHERE date = REPLACE(:service_date,'-','')
    AND exception_type = 2
),
added AS (
  SELECT service_id
  FROM calendar_dates
  WHERE date = REPLACE(:service_date,'-','')
    AND exception_type = 1
),
active_services AS (
  (SELECT service_id FROM active_from_calendar
   EXCEPT
   SELECT service_id FROM removed)
  UNION
  SELECT service_id FROM added
),
route_filter AS (
  SELECT route_id
  FROM routes
  WHERE (:route_id IS NOT NULL AND route_id = :route_id)
     OR (:route_short_name IS NOT NULL AND route_short_name = :route_short_name)
),
st AS (
  SELECT
    stop_times.trip_id,
    stop_times.stop_id,
    stop_times.stop_sequence,
    stop_times.departure_time AS departure_time,
    (
      CAST(substr(stop_times.departure_time,1,2) AS INT) * 3600 +
      CAST(substr(stop_times.departure_time,4,2) AS INT) * 60 +
      CAST(substr(stop_times.departure_time,7,2) AS INT)
    ) AS departure_sec
  FROM stop_times
  WHERE stop_times.stop_id IN (SELECT value FROM json_each(:stop_ids_json))
)
SELECT
  routes.route_id,
  routes.route_short_name,
  trips.trip_id,
  trips.direction_id,
  trips.service_id,
  trips.trip_headsign,
  st.stop_id,
  (SELECT stop_name FROM stops s WHERE s.stop_id = st.stop_id) AS stop_name,
  st.stop_sequence,
  st.departure_time,
  st.departure_sec
FROM st
JOIN trips  ON trips.trip_id  = st.trip_id
JOIN routes ON routes.route_id = trips.route_id
WHERE trips.service_id IN (SELECT service_id FROM active_services)
  AND trips.route_id   IN (SELECT route_id FROM route_filter)
  AND st.departure_sec >= :time_sec
ORDER BY st.departure_sec ASC
LIMIT :limit;
`;

  const params = {
    service_date: date,
    time_sec: toSeconds(time),
    stop_ids_json: JSON.stringify(stopIds),
    route_id: routeId,
    route_short_name: routeShortName,
    limit,
  };

  const rows: any[] = await db.all(sql, params);
  db.close();
  return rows.map((r) => ({
    routeId: r.route_id,
    routeShortName: r.route_short_name,
    tripId: r.trip_id,
    directionId: r.direction_id,
    headsign: r.trip_headsign,
    stopId: r.stop_id,
    stopName: r.stop_name,
    stopSequence: r.stop_sequence,
    departureTime: r.departure_time, // can be "24:15:00"
    secondsAfterMidnight: r.departure_sec,
  }));
}
