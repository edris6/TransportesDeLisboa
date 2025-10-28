let dictionary = {}; // { name -> code }
let stations = [];   // keep original array if you need more fields

// helper to normalize accents & case
const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

fetch("https://api-gateway.cp.pt/cp/services/travel-api/stations", {
  headers: {
    "x-api-key": "ca3923e4-1d3c-424f-a3d0-9554cf3ef859",
    "x-cp-connect-id": "1483ea620b920be6328dcf89e808937a",
    "x-cp-connect-secret": "74bd06d5a2715c64c2f848c5cdb56e6b",
  },
})
  .then((res) => res.json())
  .then((data) => {
    stations = Array.isArray(data) ? data : [];
    // build { name -> code } map
    dictionary = Object.fromEntries(
      stations.map(({ designation, code }) => [designation, code])
    );
    console.log("Dictionary loaded:", dictionary);
  })
  .catch((err) => console.error("Erro ao carregar dados da CP:", err));

const input = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");

input.addEventListener("input", function () {
  const query = norm(this.value.trim());
  suggestionsBox.innerHTML = "";
  suggestionsBox.classList.remove("show");
  if (!query) return;

  // work with station names (keys of the map)
  const names = Object.keys(dictionary);

  // accent-insensitive prefix match
  const filtered = names.filter((name) => norm(name).startsWith(query));

  if (filtered.length > 0) {
    suggestionsBox.classList.add("show");
  }

  filtered.forEach((name) => {
    const div = document.createElement("div");
    div.classList.add("suggestion");
    div.textContent = name;
    div.addEventListener("click", () => {
      const code = dictionary[name]; // now this is the station code
      input.value = name;
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.remove("show");
      console.log(`Selected code: ${code}`);
      // your function:
      getstation(code);
    });
    suggestionsBox.appendChild(div);
  });
});
