// Initialize base map
const map = L.map("map").setView([46.8, -75.5], 6);

// Add base tile layer (OpenStreetMap)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});
osm.addTo(map);

// PART 1
// Load GeoJSON of weather stations
const stationsURL = "https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/geospatial-programming-labs/main/data/stations.geojson";

// Fetch GeoJSON and add to map
fetch(stationsURL)
  .then(response => response.json())
  .then(data => {
    const stationsLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>${feature.properties.name}</b><br>Province: ${feature.properties.province}`);
      }
    }).addTo(map);
  })
  .catch(err => console.error('Error loading GeoJSON:', err));

// PART 2
// Function to fetch Environment Canada climate data
function fetchClimateData(climateID) {
  const apiURL = `https://api.weather.gc.ca/collections/climate-daily/items?limit=1&offset=0&LOCAL_YEAR=2025&CLIMATE_IDENTIFIER=${climateID}`;

  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(json => {
      if (!json.features || json.features.length === 0) {
        document.getElementById("climate-data").innerHTML = "<p>No recent climate data available.</p>";
        return;
      }
      const record = json.features[0].properties;
      const html = `
        <p><strong>Date:</strong> ${record.LOCAL_DATE}</p>
        <p><strong>Max Temp (°C):</strong> ${record.MAX_TEMP}</p>
        <p><strong>Min Temp (°C):</strong> ${record.MIN_TEMP}</p>
        <p><strong>Total Precip (mm):</strong> ${record.TOTAL_PRECIPITATION}</p>
      `;
      document.getElementById("climate-data").innerHTML = html;
    })
    .catch(error => {
      console.error("Error fetching climate data:", error);
      document.getElementById("climate-data").innerHTML = "<p>Error fetching data.</p>";
    });
}

legend.addTo(map);
