const map = L.map("map").setView([38.7169, -9.139], 13); // Lisbon coords

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markers = [];

async function loadBuses() {
  // Clear old markers
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  try {
    const res = await fetch("/api/carris/live");
    const buses = await res.json();

    buses.forEach((bus) => {
      console.log(bus);
      let myicon = L.icon({
        iconUrl: "busicon-removebg-preview.png",
        iconSize: [50, 95],
        /*iconAnchor: [22, 94],
    /*popupAnchor: [-3, -76],*/
        /*shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]*/
      });
      const marker = L.marker([bus.lat, bus.lon], { icon: myicon })
        .addTo(map)
        .bindPopup(`Bus ${bus.id} - Route ${bus.routeId}`);
      markers.push(marker);
    });
  } catch (e) {
    console.error("Failed to load buses:", e);
  }
}

loadBuses();
setInterval(loadBuses, 15000); // refresh every 15 seconds
