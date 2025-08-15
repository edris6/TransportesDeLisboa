let dictionary = {};

// Fetch raw text and parse into { name: code }
fetch(
  window.location.origin +
    "/proxy?url=https://www.cp.pt/sites/spring/station-index",
)
  .then((res) => res.json()) // <-- parse JSON directly
  .then((data) => {
    dictionary = data;
    console.log("Dictionary loaded:", dictionary);
  });

const input = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");

input.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  suggestionsBox.innerHTML = "";
  suggestionsBox.innerHTML = "";
  suggestionsBox.classList.remove("show");

  if (!query) return;

  const filtered = Object.keys(dictionary).filter((name) =>
    name.toLowerCase().startsWith(query),
  );

  if (filtered.length > 0) {
    suggestionsBox.classList.add("show");
  }

  filtered.forEach((name) => {
    const div = document.createElement("div");
    div.classList.add("suggestion");
    div.textContent = name;
    div.addEventListener("click", () => {
      const code = dictionary[name];
      input.value = name;
      suggestionsBox.innerHTML = "";

      console.log(`Selected code: ${code}`);
      getstation(code);
    });
    suggestionsBox.appendChild(div);
  });
});
