import comboios from "comboios";
import fs from "fs";
/*
function saveObjectToTxt(obj, filename) {
  const objectStr = JSON.stringify(obj, null, 2); // Convert object to a string

  fs.writeFileSync(filename, objectStr, "utf8"); // Write the string to a file
}
*/
async function station_exists(name) {
  let available_stations = await comboios.stations();
  for (let i = 0; i < available_stations.length; i++) {
    if (available_stations[i].name == name) {
      return [true, available_stations[i].id];
    }
  }
  return [false, null];
}
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
    //saveObjectToTxt(remainingTrains, "test.txt");
  } else {
    return null;
  }
}

stopover("Entrecampos");

//comboios.trip("18526@2025-01-06").then(console.log).catch(console.error);
//NO DELAY INFORMATION
