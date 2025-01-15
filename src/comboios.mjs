import comboios from "comboios";
/**
 * Checks if station exists
 * @returns [exists,if so returns ID]
 */
async function station_exists(name) {
  let available_stations = await comboios.stations();
  for (let i = 0; i < available_stations.length; i++) {
    if (available_stations[i].name.toLowerCase() == name.toLowerCase()) {
      return [true, available_stations[i].id];
    }
  }
  return [false, null];
}
/**
 * returns trains that will pass in a station, by name(null if doesnt exist)
 * @param {string} name
 * @returns remainingtrains or null
 */
export async function stopover(name) {
  const exists = await station_exists(name);
  if (exists[0]) {
    const station = await comboios.stopovers(exists[1]);
    let remainingTrains = [];

    for (let i = 0; i < station.length; i++) {
      const arrivalTime = new Date(station[i].arrival).getTime();
      const currentTime = new Date().getTime();

      if (arrivalTime > currentTime) {
        remainingTrains.push(station[i]);
      }
    }
    return remainingTrains;
  } else {
    return null;
  }
}
/**
 * returns stops train will pass by
 * @param {string} id
 * @returns json or error
 */
export async function trip(id) {
  const trip = await comboios.trip(id);
  return trip;
}
