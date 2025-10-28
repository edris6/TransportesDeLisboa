function nextTrams(station){

fetch(window.location.origin + "/api/mts/nexttrams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      station: station,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data.trips);
      //displaydata(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}