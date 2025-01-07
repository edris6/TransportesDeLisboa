document.getElementById("send").onclick = function (event) {
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
        displaydata(data);
      }
    })
    .catch((error) => {
      managetrips("ERROR");
      console.error("Error:", error); // Handle errors
    });
};
function displaydata(data) {
  for (let i = 0; i < data.length; i++) {
    const direction = data[i].direction.name;
    const provenance = data[i].provenance.name;
    const arrival = data[i].arrival;
    const platform = data[i].arrivalPlatform;
    const tripId = data[i].tripId;

    const mainContainer = document.createElement("div");
    mainContainer.classList.add("horizontal-bar");
    mainContainer.id = "container" + i;
    let directionp = document.createElement("p");
    let provenancep = document.createElement("p");
    let arrivalp = document.createElement("p");
    let platformp = document.createElement("p");
    let tripIdp = document.createElement("p");
    directionp.textContent = "Direction: " + direction;
    provenancep.textContent = "Comes from: " + provenance;
    arrivalp.textContent = "Arrives at: " + arrival;
    platformp.textContent = "Arrives at platform: " + platform;
    tripIdp.textContent = "id: " + tripId;
    mainContainer.appendChild(directionp);
    mainContainer.appendChild(provenancep);
    mainContainer.appendChild(arrivalp);
    mainContainer.appendChild(platformp);
    mainContainer.appendChild(tripIdp);
    document.getElementById("trips").appendChild(mainContainer);
  }
}
function managetrips(innerHTML) {
  var parentElement = document.getElementById("trips");
  parentElement.innerHTML = innerHTML;
}
