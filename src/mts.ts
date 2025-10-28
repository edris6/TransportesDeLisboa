import { importGtfs } from "gtfs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { format } from "date-fns";

const mts_config = {
  sqlitePath: "./mts-gtfs",
  agencies: [
    {
      // check for more recent ones
      url: "https://mts.pt/imt/MTS-20240129.zip",
    },
  ],
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

/** Decide DS_inverno vs DS_verao from month/day using windows learned from calendar table */
function pickSeasonByMonthDay(
  dateISO: string,
  learned?: { veraoStart?: string; veraoEnd?: string }
): "DS_inverno" | "DS_verao" {
  const [, mStr, dStr] = dateISO.split("-");
  const md = `${mStr}-${dStr}`; // MM-DD
  const veraoStart = learned?.veraoStart || "07-15";
  const veraoEnd = learned?.veraoEnd || "09-07";
  const inRange = (x: string, start: string, end: string) => start <= x && x <= end;
  return inRange(md, veraoStart, veraoEnd) ? "DS_verao" : "DS_inverno";
}

type TramTrip = {
  trip_id: string;
  route_id: string;
  route_short_name: string | null;
  route_long_name: string | null;
  headsign: string | null;
  departure_time: string;
};

export type TramResult = {
  station: string;
  date: string;
  time: string;
  limit: number;
  trips: TramTrip[];
  usedSeasonalFallback: boolean;
  inferredSeason?: "DS_inverno" | "DS_verao" | "SAB" | "DOM";
  activeServiceIds: string[];
  note?: string;
};




/**
 * Get next trams for a station and date/time.
 * Normal path: calendar + calendar_dates.
 * Fallback: infer DS_inverno/DS_verao (or SAB/DOM) if calendar is missing the period.
 */
export async function getNextTrams(
  stationName: string,
  date?: string,
  time?: string,
  limit: number = 5
): Promise<{ result?: TramResult; error?: string }> {
  try {
    const db = await openMtsDb();
    try {
      const now = new Date();
      const currentDate = date || format(now, "yyyy-MM-dd");
      const currentTime = time || format(now, "HH:mm:ss");
      const yyyymmdd = currentDate.replace(/-/g, "");

      // 1️⃣ Exact station match (case-insensitive)
      const normalizedName = stationName.trim().toLowerCase();
      const stop = await db.get<{ stop_id: string }>(
        `SELECT stop_id FROM stops WHERE LOWER(stop_name) = ? COLLATE NOCASE LIMIT 1`,
        [normalizedName]
      );
      if (!stop)
        return { error: `No stop found with exact name "${stationName}"` };

      // 2️⃣ Active services
      const base: Array<{ service_id: string }> = await db.all(
        `SELECT service_id FROM calendar
         WHERE CAST(? AS INTEGER) BETWEEN start_date AND end_date
         AND CASE strftime('%w', ?) 
           WHEN '0' THEN sunday
           WHEN '1' THEN monday
           WHEN '2' THEN tuesday
           WHEN '3' THEN wednesday
           WHEN '4' THEN thursday
           WHEN '5' THEN friday
           WHEN '6' THEN saturday
         END = 1`,
        [yyyymmdd, currentDate]
      );

      const added: Array<{ service_id: string }> = await db.all(
        `SELECT service_id FROM calendar_dates WHERE date = ? AND exception_type = 1`,
        [yyyymmdd]
      );
      const removed: Array<{ service_id: string }> = await db.all(
        `SELECT service_id FROM calendar_dates WHERE date = ? AND exception_type = 2`,
        [yyyymmdd]
      );

      const active = new Set<string>(base.map((r) => r.service_id));
      for (const r of added) active.add(r.service_id);
      for (const r of removed) active.delete(r.service_id);

      let usedSeasonalFallback = false;
      let inferredSeason: "DS_inverno" | "DS_verao" | "SAB" | "DOM" | undefined;

      // 3️⃣ Fallback to DS_inverno/DS_verao if needed
      if (active.size === 0) {
        usedSeasonalFallback = true;

        const weekdayRow = await db.get<{ d: string }>(
          `SELECT strftime('%w', ?) AS d`,
          [currentDate]
        );
        const weekday = Number(weekdayRow?.d ?? "0"); // 0=Sun..6=Sat

        if (weekday === 0) inferredSeason = "DOM";
        else if (weekday === 6) inferredSeason = "SAB";
        else {
          const veraoRow = await db.get<{ start_date: number; end_date: number }>(
            `SELECT start_date, end_date FROM calendar
             WHERE LOWER(service_id) = 'ds_verao'
             ORDER BY end_date DESC LIMIT 1`
          );

          const toMMDD = (yyyymmddNum?: number) =>
            yyyymmddNum
              ? `${String(Math.floor((yyyymmddNum % 10000) / 100)).padStart(
                  2,
                  "0"
                )}-${String(yyyymmddNum % 100).padStart(2, "0")}`
              : undefined;

          const learned = veraoRow
            ? { veraoStart: toMMDD(veraoRow.start_date), veraoEnd: toMMDD(veraoRow.end_date) }
            : undefined;

          inferredSeason = pickSeasonByMonthDay(currentDate, learned);
        }

        const seasonRemoved = await db.get<{ x: number }>(
          `SELECT 1 AS x FROM calendar_dates
           WHERE service_id = ? AND date = ? AND exception_type = 2 LIMIT 1`,
          [inferredSeason, yyyymmdd]
        );

        if (!seasonRemoved && inferredSeason) active.add(inferredSeason);
        for (const r of added) active.add(r.service_id);
      }

      if (active.size === 0) {
        return {
          result: {
            station: stationName,
            date: currentDate,
            time: currentTime,
            limit,
            trips: [],
            usedSeasonalFallback,
            inferredSeason,
            activeServiceIds: [],
            note:
              "No active services for this date in calendar; fallback also empty.",
          },
        };
      }

      // 4️⃣ Next departures
      const activeList = [...active];
      const placeholders = activeList.map(() => "?").join(",");
      const trips: Array<TramTrip> = await db.all(
        `
        SELECT 
          t.trip_id,
          t.route_id,
          r.route_short_name,
          r.route_long_name,
          COALESCE(t.trip_headsign, r.route_long_name) AS headsign,
          st.departure_time
        FROM stop_times st
        JOIN trips t ON st.trip_id = t.trip_id
        JOIN routes r ON t.route_id = r.route_id
        WHERE st.stop_id = ?
          AND t.service_id IN (${placeholders})
          AND st.departure_time > ?
        ORDER BY st.departure_time ASC
        LIMIT ?
        `,
        [stop.stop_id, ...activeList, currentTime, limit]
      );

      const result: TramResult = {
        station: stationName,
        date: currentDate,
        time: currentTime,
        limit,
        trips,
        usedSeasonalFallback,
        inferredSeason,
        activeServiceIds: activeList,
      };

      return { result };
    } finally {
      await db.close();
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}


// Example run (use top-level await in ESM or wrap in an IIFE)
/*;(async () => {
  console.log(await getNextTrams("s", "2025-10-28", "14:00:00"));
})();*/
