let previnnerhtml = "";

document.getElementById("send").onclick = function (event) {
  previnnerhtml = "";
  const train_station = document.getElementById("station1").value;

  fetch(window.location.origin + "/api/comboio/stopover", {
    method: "POST", // Set the request method to POST
    headers: {
      "Content-Type": "application/json", // Tell the server that you're sending JSON data
    },
    body: JSON.stringify({
      // Convert the data to a JSON string
      station: train_station,
    }),
  })
    .then((response) => response.json()) // Parse the JSON response
    .then((data) => {
      managetrips("");
      console.log("Success:", data); // Handle the response data
      if (data.error == "Station doesnt exist") {
        managetrips("Station doesnt exist");
      } else {
        displaydata(data, false);
      }
    })
    .catch((error) => {
      managetrips("ERROR");
      console.error("Error:", error); // Handle errors
    });
};
function tripsrequest(id) {
  return fetch(window.location.origin + "/api/comboio/trip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      station: id,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}
function displaydata(data, istrip) {
  if (typeof istrip != "boolean") {
    console.error("ERRORERROR not boolean");
    return "ERROR";
  }
  const result = istrip ? data.stopovers.length : data.length;
  for (let i = 0; i < result; i++) {
    let direction = 0;
    let provenance = 0;
    let arrival = 0;
    let platform = 0;
    let tripId = 0;
    if (istrip == false) {
      direction = data[i].direction.name;
      provenance = data[i].provenance.name;
      arrival = data[i].arrival;
      platform = data[i].arrivalPlatform;
      tripId = data[i].tripId;
    }

    if (istrip == true) {
      //direction = data[i].direction.name;
      provenance = data.stopovers[i].stop.name;
      arrival = data.stopovers[i].arrival;
      platform = data.stopovers[i].arrivalPlatform;
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
function managetrips(innerHTML, previnnerhtml_ = 0) {
  if (previnnerhtml_ == 1) {
    var parentElement = document.getElementById("trips");
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
    var parentElement = document.getElementById("trips");
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
//document.getElementById("trips").style = "visibility: hidden"
