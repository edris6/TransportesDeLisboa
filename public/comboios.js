let previnnerhtml = "";

function getstation(id,date =new Date().toLocaleDateString('en-CA'),     start = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),    useProxy = false,       
  
)  {
  previnnerhtml = "";
  //const train_station = document.getElementById("station1").value;

  
  const path = `/cp/services/travel-api/stations/${encodeURIComponent(
    id
  )}/timetable/${date}?start=${start}`;
  console.log(path)
  const rawUrl = `https://api-gateway.cp.pt${path}`;

  // opcional: via proxy local para evitar CORS
  const url = useProxy
    ? `${window.location.origin}/proxy?url=${encodeURIComponent(rawUrl)}`
    : rawUrl;

  return fetch(url, {
    method: "GET",
    headers: {
      // só precisa destes; Content-Type não é necessário em GET
      "x-api-key": "ca3923e4-1d3c-424f-a3d0-9554cf3ef859",
      "x-cp-connect-id": "1483ea620b920be6328dcf89e808937a",
      "x-cp-connect-secret": "74bd06d5a2715c64c2f848c5cdb56e6b",
      // "Accept": "application/json", // opcional
    },
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((t) => {
          throw new Error(`HTTP ${res.status} – ${res.statusText}\n${t}`);
        });
      }
      console.log(res);
      return res.json();
    })
    .then((data) => {
      console.log(data.stationStops);
      managetrips("");
      displaydata(data.stationStops, false);
    })
    .catch((error) => {
      managetrips("ERROR");
      console.error("Error:", error);
    });
}
/**
 * fetches trips
 */
function tripsrequest(id) {
  return fetch(
    window.location.origin +
      "/proxy?url=https://www.cp.pt/sites/spring/station/trains/train?trainId=" +
      id,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      /*body: JSON.stringify({
        station: id,
      }),*/
    },
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}
/**
 * displays data
 * @param {*} data
 * @param {boolean} istrip
 * @returns
 */
function displaydata(data, istrip) {
  if (typeof istrip != "boolean") {
    console.error("ERRORERROR not boolean");
    return "ERROR";
  }
  const result = istrip ? data.trainStops.length : data.length;
  for (let i = 0; i < result; i++) {
    let direction = 0;
    let provenance = 0;
    let arrival = 0;
    let platform = 0;
    let tripId = 0;
    if (istrip == false) {
      console.log(data[i]);
      direction =
        data[i].trainDestination.designation +
        "(" +
        data[i].trainService.code +
        ")";
      provenance = data[i].trainOrigin.designation;
      arrival = data[i].arrivalTime;
      if (data[i].arrivalTime == null) {
        arrival = data[i].departureTime;
      }
      if (data[i].delay != null) {
        if (data[i].delay != 0) {
          if (data[i].arrivalTime == null) {
            arrival = arrival + "(" + data[i].etd + ")";
          } else {
            arrival = arrival + "(" + data[i].eta + ")";
          }
        }
      }
      platform = data[i].platform;
      tripId = data[i].trainNumber;
    }

    if (istrip == true) {
      provenance = data.trainStops[i].station.designation;
      arrival = data.trainStops[i].arrival;
      if (data.trainStops[i].arrival == null) {
        arrival = data.trainStops[i].departure;
      }
      if (data.trainStops[i].delay != null) {
        if (data.trainStops[i].delay != 0) {
          if (data.trainStops[i].arrival == null) {
            arrival = arrival + "(" + data.trainStops[i].etd + ")";
          } else {
            arrival = arrival + "(" + data.trainStops[i].eta + ")";
          }
        }
      }
      platform = data.trainStops[i].platform;
    }
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("horizontal-bar");
    mainContainer.id = "container" + i;
    let directionp = document.createElement("p");
    let provenancep = document.createElement("p");
    let arrivalp = document.createElement("p");
    let platformp = document.createElement("p");
    let button = document.createElement("button");
    directionp.textContent = "Direction: " + direction;
    provenancep.textContent = "Comes from: " + provenance;
    arrivalp.textContent = "Arrives at: " + arrival;
    if (istrip == false) {
      if (data[i].arrivalTime == null) {
        arrivalp.textContent = "Departs at: " + arrival;
      }
    } else {
      if (data.trainStops[i].arrival == null) {
        arrivalp.textContent = "Departs at: " + arrival;
      }
    }
    platformp.textContent = "Arrives at platform: " + platform;
    button.textContent = "SEE stops";
    button.id = tripId;
    button.addEventListener("click", (event) => seestops(event));
    if (istrip == true) {
      provenancep.textContent = "Stop is: " + provenance;
    }
    mainContainer.appendChild(provenancep);
    mainContainer.appendChild(arrivalp);
    mainContainer.appendChild(platformp);
    if (istrip == false) {
      mainContainer.appendChild(directionp);
      mainContainer.appendChild(button);
    }
    document.getElementById("trips").appendChild(mainContainer);
  }
}
/**
 *
 * @param {string} innerHTML set inner html to this
 * @param {number} previnnerhtml_ if true puts this as previous inner html AND reputs ids into containers
 */
function managetrips(innerHTML, previnnerhtml_ = 0) {
  if (previnnerhtml_ == 1) {
    let parentElement = document.getElementById("trips");
    parentElement.innerHTML = previnnerhtml;
    for (
      let i = 0;
      i < document.getElementById("trips").childElementCount;
      i++
    ) {
      document
        .getElementById(document.getElementById("container" + i).lastChild.id)
        .addEventListener("click", (event) => seestops(event));
    }
  } else {
    let parentElement = document.getElementById("trips");
    parentElement.innerHTML = innerHTML;
  }
}
function seestops(event) {
  const id_button = event.target.id;
  previnnerhtml = document.getElementById("trips").innerHTML;
  managetrips("");
  let prevbutton = document.createElement("button");
  prevbutton.textContent = "goback";
  prevbutton.addEventListener("click", (event) => managetrips(0, 1));
  document.getElementById("trips").appendChild(prevbutton);
  tripsrequest(id_button)
    .then((data) => {
      console.log("Received data:", data);
      displaydata(data, true);
    })
    .catch((error) => {
      managetrips("ITDIDNOTWORKOUT, check console");
      console.log("Request failed:", error);
    });
}
