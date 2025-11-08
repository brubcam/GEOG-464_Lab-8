// Initialize base map
const map = L.map("map").setView([46.8, -75.5], 6);

// Add base tile layer (OpenStreetMap)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});
osm.addTo(map);

// PART 1


// Popup and click handler for each station
function onEachStation(feature, layer) {
  const props = feature.properties;
  const popupContent = `
    <strong>${props.STN_NAME}</strong><br/>
    Province: ${props.PROVINCE_CODE}<br/>
    Climate ID: ${props.CLIMATE_ID}<br/>
    Lat: ${props.LATITUDE.toFixed(2)}, Lon: ${props.LONGITUDE.toFixed(2)}
  `;
  layer.bindPopup(popupContent);

  // Fetch API data on click
  layer.on("click", () => {
    document.getElementById("station-name").innerText = props.STN_NAME;
    fetchClimateData(props.CLIMATE_ID);
  });
}

// PART 2


legend.addTo(map);
