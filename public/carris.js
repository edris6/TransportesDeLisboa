const map = L.map("map").setView([38.7169, -9.139], 13);

L.tileLayer(
  "https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png",
  {
    attribution:
      "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://www.carto.com/'>CARTO</a>",
    subdomains: "abcd",
    maxZoom: 19,
  },
).addTo(map);

let bmarkers = [];
function getBusIconSize() {
  const zoom = map.getZoom();
  // Adjust these values to taste
  const scale = zoom / 13; // 13 is base zoom
  return [20 * scale, 40 * scale];
}

async function loadBuses() {
  // Clear old bmarkers
  bmarkers.forEach((m) => map.removeLayer(m));
  bmarkers = [];

  try {
    const res = await fetch("/api/carris/live");
    const buses = await res.json();

    buses.forEach((bus) => {
      //console.log(bus);
      let myicon = L.icon({
        iconUrl: "busicon-removebg-preview.png",
        iconSize: getBusIconSize(),
        /*iconAnchor: [50, 95],
        /*popupAnchor: [-3, -76],*/
        /*shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]*/
      });
      const marker = L.marker([bus.lat, bus.lon], { icon: myicon })
        .addTo(map)
        .bindPopup(`Bus ${bus.id} - Route ${bus.routeId}`);
      bmarkers.push(marker);
    });
  } catch (e) {
    console.error("Failed to load buses:", e);
  }
}
let stops = [];
async function loadstops() {
  try {
    const res = await fetch("/api/carris/stops");
    const stops = await res.json();
    stops.forEach((stop) => {
      console.log(stop);
      let myicon = L.icon({
        iconUrl: "circle-removebg-preview.png",
        iconSize: [7, 7],
      });
      const marker = L.marker([stop.stop_lat, stop.stop_lon], {
        icon: myicon,
      })
        .addTo(map)
        .bindPopup(`stop name ${stop.stop_name}`);
      stops.push(marker);
    });
  } catch (e) {
    console.error(e);
  }
}

loadstops();
map.on("zoomend", loadBuses);
loadBuses();
setInterval(loadBuses, 15000); // refresh every 15 seconds
