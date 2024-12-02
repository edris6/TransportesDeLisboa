fetch("http://localhost:3000/api/metro/timeforstation", {
  method: "POST", // Set the request method to POST
  headers: {
    "Content-Type": "application/json", // Tell the server that you're sending JSON data
  },
  body: JSON.stringify({
    // Convert the data to a JSON string
    station: "CM",
  }),
})
  .then((response) => response.json()) // Parse the JSON response
  .then((data) => {
    console.log("Success:", data); // Handle the response data
  })
  .catch((error) => {
    console.error("Error:", error); // Handle errors
  });
