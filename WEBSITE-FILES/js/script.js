// Initialize base map
const map = L.map("map").setView([46.8, -75.5], 6);

// Add base tile layer (OpenStreetMap)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});
osm.addTo(map);

// PART 1

// PART 2

