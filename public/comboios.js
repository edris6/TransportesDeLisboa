let previnnerhtml = "";

function getstation(id) {
  previnnerhtml = "";
  //const train_station = document.getElementById("station1").value;

  fetch(
    window.location.origin +
      "/proxy?url=https://www.cp.pt/sites/spring/station/trains?stationId=" +
      id,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      /*body: JSON.stringify({
        station: train_station,
      }),*/
    },
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      managetrips("");
      displaydata(data, false);
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
  console.log(event.originalTarget.id);
  previnnerhtml = document.getElementById("trips").innerHTML;
  managetrips("");
  let prevbutton = document.createElement("button");
  prevbutton.textContent = "goback";
  prevbutton.addEventListener("click", (event) => managetrips(0, 1));
  document.getElementById("trips").appendChild(prevbutton);
  tripsrequest(event.originalTarget.id)
    .then((data) => {
      console.log("Received data:", data);
      displaydata(data, true);
    })
    .catch((error) => {
      managetrips("ITDIDNOTWORKOUT, check console");
      console.log("Request failed:", error);
    });
}
