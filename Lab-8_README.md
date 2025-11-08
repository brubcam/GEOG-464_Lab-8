# Lab 8 – APIs and Leaflet Methods

## Overview

The goal of this final lab is to integrate everything you have learned so far, from basic web technologies (HTML, JavaScript, and CSS) to web mapping with Leaflet, and extend your skills into working with [APIs](https://www.oracle.com/ca-en/cloud/cloud-native/api-management/what-is-api/) to fetch real-world data and advanced Leaflet techniques for interactivity and visualization. You will learn how to fetch and parse data from web APIs, including asynchronous programming concepts (`fetch()`, promises, and JSON parsing), practice adding and styling multiple Leaflet layers, and implement interactive Leaflet controls, such as layer toggles, scale bars, and legends. By the end of this lab, you will have a complete, interactive web map that displays climate station data from Environment and Climate Change Canada (ECCC) and fetches live or near-real-time data from an API.

## Setup

First, create a working folder for this lab, if you haven't already, called 'Lab8' or something similar. The provided zip folder contains three starter files. Make sure these files are stored in their respective diretories, as in prvious labs and shown below:

```
Lab8/
├── index.html
├── js/
    ├── script.js
├── css/
    ├── styles.css
```

You will also be accessing [this GeoJSON file on GitHub](https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/geospatial-programming-labs/main/data/stations.geojson), which contains approximately 30 active climate stations across southern Québec and Ontario, represented as point features with attributes such as name, province, elevation, and Environment Canada station IDs. Feel free to download and take a look at the content of this file before starting, but you won't be prviding your website with this file locally, but rather fetching it from the repository, as you did in the previous lab.

## Part 1: Loading and Visualizing GeoJSON Data

We will load our station data dynamically using the [`fetch()` API.](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) Fetching data asynchronously allows your website to continue running while data is being retrieved — a key aspect of modern web applications.

In `script.js`, under 'PART 1', start by defining the URL of the GeoJSON file and writing a function to fetch and display it:

```javascript
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
```

In your HTML file, create a new 'answers' div under the 'info-panel' section, and asnwer the following (and subsequent) questions as text in this div.

**Q1. Explain what `.then()` and `.catch()` do in the above JavaScript code.** (1 point)

**Q2. Modify the popup content so that it also displays the station’s elevation (in metres) and station ID.** (2 points)

## Part 2: Fetching and Integrating API Data

Now we’ll use the [Environment Canada Climate Daily API](https://api.weather.gc.ca/openapi#/climate-daily) to fetch daily climate data for one selected station (see more documentation on the API [here](https://api.weather.gc.ca/) and [here](https://eccc-msc.github.io/open-data/msc-geomet/ogc_api_en/)). API data typically comes in JSON format. To request it, you provide the endpoint URL, sometimes with parameters such as a station ID or date range.

Example API call (copy and paste into your browser to see the results):

```
https://api.weather.gc.ca/collections/climate-daily/items?limit=10&offset=0&sortby=-LOCAL_DATE&STATION_NAME=montreal
```

In `script.js`, under 'PART 2', start by writing a function to fetch data from the ECCC Climate Daily API for a single station and display one or two data fields (e.g., date and mean temperature) in the console:

```javascript
// Function to fetch Environment Canada climate data
function fetchClimateData(climateID) {
  const apiURL = `https://api.weather.gc.ca/collections/climate-daily/items?limit=1&offset=0&sortby=-LOCAL_DATE&CLIMATE_IDENTIFIER=${climateID}`;

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
```

**Q3. Edit the function so that it returns data for a specific date in the year 2020.** (1 point)

**Q4. Modify your popup so that when a station is clicked, it triggers `fetchClimateData()` for that station and shows the most recent daily temperature in the popup.** (3 points)

Hint: Use the `onEachFeature` function and call your new function inside it.

## Step 4: Styling the Map and Layers

Let’s make the map more visually engaging by styling the points based on an attribute.

For example, we can symbolize stations by elevation:

```javascript
function styleStations(feature) {
  return {
    radius: 6,
    fillColor: feature.properties.elevation_m > 200 ? '#fc8d59' : '#91bfdb',
    color: '#333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}
```

Then, when adding the GeoJSON layer:

```javascript
L.geoJSON(data, {
  pointToLayer: (feature, latlng) => L.circleMarker(latlng, styleStations(feature)),
  onEachFeature: onEachStationFeature
}).addTo(map);
```

**Question 6:** Change the style function to use three categories of elevation (low, medium, high) with different colors. Include a comment explaining your threshold choices.

---

## Step 5: Adding Interactive Leaflet Controls

Leaflet offers several built-in controls to enhance interactivity:

- **Layer Control:** allows toggling between base maps or overlays.
- **Scale Bar:** shows a visual reference for distance.
- **Custom Buttons/Widgets:** you can build your own controls with HTML and CSS.

Example layer control setup:

```javascript
const baseMaps = {
  "OpenStreetMap": osm,
  "Satellite": satellite
};

const overlayMaps = {
  "Climate Stations": stationsLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
L.control.scale().addTo(map);
```

**Question 7:** Add a base map toggle control and a scale bar to your map. Write a short comment in your JS file explaining what each control does.

**Question 8:** Create a custom Leaflet control that displays the current date in the top-right corner of the map. (Hint: Use `L.Control.extend()`.)

---

## Step 6: Adding Legends and Map Information

Legends help users interpret map symbology. A basic Leaflet legend can be created as a control and styled with CSS.

Example legend code:

```javascript
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 100, 200, 300];
  const colors = ['#91bfdb', '#ffffbf', '#fc8d59', '#d73027'];
  div.innerHTML += '<b>Elevation (m)</b><br>';
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += `<i style="background:${colors[i]}"></i> ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
  }
  return div;
};

legend.addTo(map);
```

**Question 9:** Modify the legend to match your custom elevation categories from Question 6.

**Question 10:** In a comment, describe how you could adapt this legend to represent another variable, such as average temperature.

---

## Step 7: Review and Reflection

At this stage, your interactive web map should:

- Display stations from a GeoJSON file.
- Fetch climate data from the ECCC API when a user clicks a station.
- Show popups with real data.
- Include at least two base maps, one overlay, a legend, and a scale bar.

**Question 11:** In 2–3 sentences, describe what you learned about asynchronous programming and how it applies to web mapping.

**Question 12:** Suggest one improvement or new feature you would add to your map if you had more time.

---

# Starter Boilerplate Files

Below are the base versions of your `index.html`, `style.css`, and `script.js` files.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lab 8 – Climate Web Map</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <h1>Lab 8 – Climate Web Map</h1>
  <div id="map"></div>
  <script src="script.js"></script>
</body>
</html>
```

---

## style.css

```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

h1 {
  text-align: center;
  padding: 10px;
}

#map {
  height: 80vh;
  width: 90%;
  margin: 0 auto;
  border: 2px solid #444;
}

/* Legend styling */
.info.legend {
  background: white;
  padding: 8px;
  border-radius: 5px;
  line-height: 1.4em;
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
}

.info.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.8;
}
```

---

## script.js

```javascript
// Initialize the map
const map = L.map('map').setView([45.5, -75.5], 6);

// Base maps
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: '&copy; Google'
});

// Fetch GeoJSON stations
const stationsUrl = "https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/geospatial-programming-labs/main/data/stations.geojson";

function styleStations(feature) {
  return {
    radius: 6,
    fillColor: feature.properties.elevation_m > 200 ? '#fc8d59' : '#91bfdb',
    color: '#333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}

function onEachStationFeature(feature, layer) {
  layer.bindPopup(`<b>${feature.properties.name}</b><br>Province: ${feature.properties.province}`);
  layer.on('click', () => {
    getClimateData(feature.properties.climate_id);
  });
}

fetch(stationsUrl)
  .then(res => res.json())
  .then(data => {
    const stationsLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, styleStations(feature)),
      onEachFeature: onEachStationFeature
    }).addTo(map);

    const baseMaps = { "OpenStreetMap": osm, "Satellite": satellite };
    const overlayMaps = { "Climate Stations": stationsLayer };

    L.control.layers(baseMaps, overlayMaps).addTo(map);
    L.control.scale().addTo(map);
  })
  .catch(err => console.error(err));

// Example API call function
function getClimateData(climateId) {
  const url = `https://api.weather.gc.ca/collections/climate-daily/items?CLIMATE_IDENTIFIER=${climateId}&limit=1`;
  fetch(url)
    .then(res => res.json())
    .then(json => {
      console.log('Climate data for', climateId, json);
    })
    .catch(err => console.error('API error:', err));
}

// Legend control example
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 100, 200, 300];
  const colors = ['#91bfdb', '#ffffbf', '#fc8d59', '#d73027'];
  div.innerHTML += '<b>Elevation (m)</b><br>';
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += `<i style="background:${colors[i]}"></i> ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
  }
  return div;
};
legend.addTo(map);

// Custom date control
const DateControl = L.Control.extend({
  onAdd: function(map) {
    const div = L.DomUtil.create('div');
    div.innerHTML = new Date().toLocaleDateString();
    div.style.backgroundColor = 'white';
    div.style.padding = '5px';
    div.style.borderRadius = '4px';
    return div;
  }
});

map.addControl(new DateControl({ position: 'topright' }));
```

