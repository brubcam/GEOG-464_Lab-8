// Initialize base map
const map = L.map("map").setView([46.8, -75.5], 6);

// Add base tile layer (OpenStreetMap)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});
osm.addTo(map);

// PART 1
// Load GeoJSON of weather stations
const stationsURL = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-8/refs/heads/main/DATA/climate-stations.geojson";

// Fetch GeoJSON and add to map
fetch(stationsURL)
  .then(response => response.json())
  .then(data => {
    const stationLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, stationStyle(feature)),
      onEachFeature: onEachStation
    }).addTo(map);
  })
  .catch(err => console.error('Error loading GeoJSON:', err));

// Popup and click handler for each station
function onEachStation(feature, layer) {
  const props = feature.properties;
  const popup = `
    <strong>${props.STATION_NAME}</strong><br>
    Province: ${props.ENG_PROV_NAME}<br>
    Station ID: ${props.STN_ID}<br>
    Elevation: ${props.ELEVATION} m
  `;
  layer.bindPopup(popup);

  // Fetch API data on click
  layer.on("click", () => {
    document.getElementById("station-name").innerText = props.STATION_NAME;
    document.getElementById("climate-data").innerHTML = "<p>Loading climate data...</p>";
    fetchClimateData(props.CLIMATE_IDENTIFIER);
  });
}

// Style for stations
function stationStyle(feature) {
  return {
    radius: 6,
    fillColor: "#2E7DA1",
    color: "#fff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}

// PART 2
// Function to fetch Environment Canada climate data
function fetchClimateData(climateID) {
  const apiURL = `https://api.weather.gc.ca/collections/climate-daily/items?limit=10&sortby=-LOCAL_DATE&CLIMATE_IDENTIFIER=${climateID}`;

  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(json => {
      if (!json.features || json.features.length === 0) {
        console.log("No recent climate data available for this station.");
        return;
      }

      const record = json.features[0].properties;
      console.log("Date:", record.LOCAL_DATE);
      console.log("Mean Temp (°C):", record.MEAN_TEMPERATURE);
    })
    .catch(error => {
      console.error("Error fetching climate data:", error);
    });
}


/*function fetchClimateData(climateID) {
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
}*/
