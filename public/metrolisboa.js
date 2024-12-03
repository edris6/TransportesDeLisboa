function convertSecondsToMinutesAndSeconds(seconds_not_converted) {
  const seconds = Number(seconds_not_converted);
  const minutes = Math.floor(seconds / 60); // Get the number of full minutes
  const remainingSeconds = seconds % 60; // Get the remaining seconds

  return `${minutes}m ${remainingSeconds}s`; // Return the result as a string in the format "Xm Ys"
}
function findNomeDestinoById(id) {
  for (let i = 0; i < metro_destinos.length; i++) {
    if (metro_destinos[i].id_destino == id) {
      return metro_destinos[i].nome_destino;
    }
  }
}
document.getElementById("send").onclick = function (event) {
  const metrostation = document
    .getElementById("metrostation1")
    .value.toUpperCase();

  if (available_metro_stations.includes(metrostation) == false) {
    console.error("METROSTATION DOESNT EXIST");
    return;
  }
  fetch(window.location.origin + "/api/metro/timeforstation", {
    method: "POST", // Set the request method to POST
    headers: {
      "Content-Type": "application/json", // Tell the server that you're sending JSON data
    },
    body: JSON.stringify({
      // Convert the data to a JSON string
      station: metrostation,
    }),
  })
    .then((response) => response.json()) // Parse the JSON response
    .then((data) => {
      console.log("Success:", data); // Handle the response data
      displaydata(data);
    })
    .catch((error) => {
      console.error("Error:", error); // Handle errors
    });
};

function displaydata(data) {
  const {
    comboio: comboio1_0,
    tempoChegada1: tempoChegada1_0,
    comboio2: comboio2_0,
    tempoChegada2: tempoChegada2_0,
    comboio3: comboio3_0,
    tempoChegada3: tempoChegada3_0,
    destino: destino_0,
  } = data[0];
  const {
    comboio: comboio1_1,
    tempoChegada1: tempoChegada1_1,
    comboio2: comboio2_1,
    tempoChegada2: tempoChegada2_1,
    comboio3: comboio3_1,
    tempoChegada3: tempoChegada3_1,
    destino: destino_1,
  } = data[1];
  //document.getElementById("answer").innerText =convertSecondsToMinutesAndSeconds(Number(tempoChegada2_0));
  document.getElementById("Comboio1_0").innerText = "Comboio:" + comboio1_0;
  document.getElementById("tempoChegada1_0").innerText =
    convertSecondsToMinutesAndSeconds(tempoChegada1_0);
  document.getElementById("Comboio2_0").innerText = "Comboio:" + comboio2_0;
  document.getElementById("tempoChegada2_0").innerText =
    convertSecondsToMinutesAndSeconds(tempoChegada2_0);
  document.getElementById("Comboio3_0").innerText = "Comboio:" + comboio3_0;
  document.getElementById("tempoChegada3_0").innerText =
    convertSecondsToMinutesAndSeconds(tempoChegada3_0);
  document.getElementById("Destino_0").innerText =
    findNomeDestinoById(destino_0);

  document.getElementById("Comboio1_1").innerText = "Comboio:" + comboio1_1;
  document.getElementById("tempoChegada1_1").innerText =
    convertSecondsToMinutesAndSeconds(tempoChegada1_1);
  document.getElementById("Comboio2_1").innerText = "Comboio:" + comboio2_1;
  document.getElementById("tempoChegada2_1").innerText =
    convertSecondsToMinutesAndSeconds(tempoChegada2_1);
  document.getElementById("Comboio3_1").innerText = "Comboio:" + comboio3_1;
  document.getElementById("tempoChegada3_1").innerText =
    convertSecondsToMinutesAndSeconds(tempoChegada3_1);
  document.getElementById("Destino_1").innerText =
    findNomeDestinoById(destino_1);
}
