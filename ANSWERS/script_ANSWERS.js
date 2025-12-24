// Initialize base map
const map = L.map("map").setView([55, -70], 5);

// Add base tile layer (OpenStreetMap)
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add another base tile layer (Esri WorldTopoMap)
const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

// PART 1
// Load GeoJSON of weather stations
const stationsURL = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-8/refs/heads/main/DATA/climate-stations.geojson";

// Fetch GeoJSON and add to map
function loadStations(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Failed to load GeoJSON");
      return response.json();
    })
    .then(data => {
      const stationLayer = L.geoJSON(data, {
        onEachFeature: onEachStation,
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, stationStyle(feature))
      });

      // Add marker cluster group
      const markers = L.markerClusterGroup();
      stationLayer.eachLayer(layer => {
        markers.addLayer(layer);
      });
      markers.addTo(map);
      
      // Add layer control 
      const baseMaps = {
        "OpenStreetMap": osm,
        "Esri WorldTopoMap": esri
      };
      const overlayMaps = {
        "Climate Stations": stationLayer
      };
      L.control.layers(baseMaps, overlayMaps).addTo(map);
      L.control.scale().addTo(map);

    })
    .catch(err => console.error("Error loading GeoJSON:", err));
};

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
    document.getElementById("station-name").innerHTML = "<strong>" + props.STATION_NAME + "</strong>";
    document.getElementById("climate-data").innerHTML = "<p>Loading climate data...</p>";
    fetchClimateData(props.CLIMATE_IDENTIFIER);
  });
}

// PART 2
// Function to fetch Environment Canada climate data
function fetchClimateData(climateID) {
  let yearFilter = 2025;
  const apiURL = `https://api.weather.gc.ca/collections/climate-daily/items?limit=10&sortby=-LOCAL_DATE&CLIMATE_IDENTIFIER=${climateID}&LOCAL_YEAR=${yearFilter}`;

  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error("Bad network response");
      return response.json();
    })
    .then(json => {
      if (!json.features || json.features.length === 0) {
        console.log("No recent climate data available for this station.");
        return;
      }

      const props = json.features[0].properties;
      //console.log("Date:", props.LOCAL_DATE);
      //console.log("Mean Temp (°C):", props.MEAN_TEMPERATURE);
      //console.log("Total Precipitation (mm):", props.TOTAL_PRECIPITATION);

      const container = document.getElementById("climate-data");
      let precipHTML = "";
      if (props.TOTAL_PRECIPITATION !== null) {
        precipHTML = `<p><strong>Total Precipitation:</strong> ${props.TOTAL_PRECIPITATION} mm`;

        let rain = props.TOTAL_RAIN;
        let snow = props.TOTAL_SNOW;

        let details = [];
        if (rain !== null && rain > 0) details.push(`${rain} mm rain`);
        if (snow !== null && snow > 0) details.push(`${snow} mm snow`);

        if (details.length > 0) {
          precipHTML += ` (${details.join(", ")})`;
        }
        precipHTML += `</p>`;
      }

      container.innerHTML = `
        <p><strong>Date:</strong> ${props.LOCAL_DATE}</p>
        <p><strong>Max Temp:</strong> ${props.MAX_TEMPERATURE} °C</p>
        <p><strong>Min Temp:</strong> ${props.MIN_TEMPERATURE} °C</p>
        ${precipHTML}
      `;
    })
    .catch(error => {
      console.error("Error fetching climate data:", error);
    });
}

// PART 3
// Style for stations
function stationStyle(feature) {
  let fillColor;
  if (feature.properties.ELEVATION <= 100) {
    fillColor = '#91bfdb'; // Low elevation
  } else if (feature.properties.ELEVATION <= 300) {
    fillColor = '#ffffbf'; // Medium elevation
  } else {
    fillColor = '#fc8d59'; // High elevation
  }
  return {
    radius: 6,
    fillColor: fillColor,
    color: '#333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}

// PART 5
// Add elevation color legend
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 100, 300];
  const colors = ['#91bfdb', '#ffffbf', '#fc8d59'];
  div.innerHTML += '<b>Elevation (m)</b><br>';
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += `<i style="background:${colors[i]}"></i> ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
  }
  return div;
};
legend.addTo(map);

// Load map
loadStations(stationsURL);
