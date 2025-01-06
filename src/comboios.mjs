import comboios from "comboios";

async function station_exists(name) {
  let available_stations = await comboios.stations();
  console.log(available_stations);
  for (let i = 0; i < available_stations.length; i++) {
    if (available_stations[i].name == name) {
      return [true, available_stations[i].id];
    }
  }
  return [false, null];
}

(async () => {
  const exists = await station_exists("Santos");
  if (exists[0]) {
    console.log(await comboios.stopovers(exists[1]));
  }
})();
