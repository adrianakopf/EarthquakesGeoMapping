// Json API
var queryUrl =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"
// lines to map
var PlateLinesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Query URL
d3.json(queryUrl, function(data) {
  var quakeFeatures = data.features

      // Create a GeoJSON layer
      // Run the onEachFeature function once for each piece of data in the array
      var earthquakes = L.geoJSON(quakeFeatures, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng){
          return new L.circle(latlng,
          {radius: getRadius(feature.properties.mag),
          fillColor: earthquakeColor(feature.properties.mag),
          fillOpacity: .5,
          color: "#000",
          stroke: true,
          weight: .5
          })
        }
      });

    // Popup describes place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
      "</h3>" + "<h4>Magnitude: " + feature.properties.mag + "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
      }


   // Add fault lines to map
    d3.json(PlateLinesUrl, function(plateData){
      console.log(faultFeatures)
      var faultFeatures = data.features

        // create a layer group for faultlines
        var tectonicPlates = new L.LayerGroup();

        var faultlines = L.geoJson(faultFeatures,{
          color: "blue",
          fillOpacity: 0,
          weight: 1
        }).addTo(tectonicPlates);
    
          // Sending our earthquakes layer to the createMap function
        createMap(earthquakes, faultlines);
}); 
}) 

function createMap(earthquakes,tectonicPlates) {

  //map layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYWdhcndhbjEiLCJhIjoiY2podjQ5Z213MHZrNDN2c2QzNnA2ZDEzeCJ9.iTgdJALv-yO5PITR1hCBsw");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYWdhcndhbjEiLCJhIjoiY2podjQ5Z213MHZrNDN2c2QzNnA2ZDEzeCJ9.iTgdJALv-yO5PITR1hCBsw");

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?"+
  "access_token=pk.eyJ1IjoiYWdhcndhbjEiLCJhIjoiY2podjQ5Z213MHZrNDN2c2QzNnA2ZDEzeCJ9.iTgdJALv-yO5PITR1hCBsw");

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYWdhcndhbjEiLCJhIjoiY2podjQ5Z213MHZrNDN2c2QzNnA2ZDEzeCJ9.iTgdJALv-yO5PITR1hCBsw");

  // Define a baseMaps to hold map layers
  var baseMaps = {
    "Outdoors": streetmap,
    "Dark Map": darkmap,
    "Satellite": satellitemap,
    "Grayscale": lightmap,
  };

  // Create overlayMaps to hold overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Position": tectonicPlates
    //faultLayer
  };

  // Position of map when loading page with all map layers 
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, satellitemap, lightmap, darkmap]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Setting up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend"),
       grades = [1, 2, 3, 4, 5, 6, 7, 8],
       labels = [];

        div.innerHTML += '<p>Magnitude: </p>'

  for (var i = 1; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + earthquakeColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? ' - ' + grades[i + 1] + '<br>'+'<br>' : '+');
}
  return div;
  };
    // Adding legend to the map
    legend.addTo(myMap);
}  


//earthquakeColor hex code used for magnitude. 
function earthquakeColor(d) {
  return d > 8  ? '#000000' : 
         d > 7  ? '#811010' :  
         d > 6  ? '#005668':  
         d > 5  ? '#fb0707':  
         d > 4  ? '#fb5951':  
         d > 3  ? '#006846':  
         d > 2  ? '#f38120':     
                  '#f38120';   
  }

function getRadius(value){
  return value*20000
}
