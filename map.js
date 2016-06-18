// -----------------------------------------------------------------------------
// map.js - Create a map, and fly through markers.
// -----------------------------------------------------------------------------

var Mustache // Mustache loaded in index.html
var L  // leaflet loaded in index.html
var $  // jQuery loaded in index.html
var token = 'pk.eyJ1IjoiYmVuamFtaW50ZCIsImEiOiJjaW83enIwNjYwMnB1dmlsejN6cDBzbm93In0.0ZOGwSLp8OjW6vCaEKYFng'
var xp_ids = [388, 405, 345, 244, 316, 1266, 218, 286, 652, 439, 927, 380, 359, 700, 750, 1026, 1443, 722, 626, 682]
// Define the map
var map = new L.Map('map-canvas', {
  zoomControl: false
}).setView([51.505, -0.09], 3)

// Add base map
L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + token, {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map)

// Add logo
var LogoControl = L.Control.extend({
  options: {
    position: 'topleft'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'logo')
    return container
  }
})

map.addControl(new LogoControl())

// Define marker list, by xp id number
var markerList = []

// This is where the fun begins
$.ajax({
  type: 'GET',
  url: 'data/markers.json',
  dataType: 'json',
  success: processData,
  error: function () { window.alert('failed') }
})

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

function processData (data) {
  for (var i = 0; i < data.length; i++) {
    buildMarker(data[i])
    markerList[data[i].id] = data[i]
  }
  setTimeout(function () {
    loopMarkers(markerList)
  }, 1);
}

function buildMarker (marker) {
  // Formatting values
  marker.place = (marker.place || marker.city)
  marker.glyphicon_domain = (marker.experience_type === '3A') ? 'education' : 'briefcase'

  var img = new L.Icon({
    iconUrl: 'markers/' + marker.experience_type + '.svg',
    iconAnchor: [12.5, 43],
    iconSize: [25, 44],
    popupAnchor: [0, -52]
  })

  var lMarker = new L.Marker(
    L.latLng([marker.latitude, marker.longitude]),
    {
      title: marker.name + ' à ' + marker.city + ', ' + marker.country,
      icon: img,
      data: marker
    }
  )

  lMarker.bindPopup(renderInfoWindow(marker))
  // Use if need to cluster. Causes a bug with animations and opening markers.
  // markerCluster.addLayer(lMarker)
  lMarker.addTo(map)
  marker.lMarker = lMarker
}

function renderInfoWindow (marker) {
  // Use Mustache to render the template
  return Mustache.render($('#templateInfoWindow').html(), marker)
}

function flyToMarker (marker) {
  console.log(marker.name)
  map.flyTo([marker.latitude, marker.longitude], 3, {animate: true, duration: 5})
  setTimeout(function () { map.flyTo([marker.latitude + 0.06, marker.longitude], 10, {animate: true, duration: 5}) }, 3400)
  setTimeout(function () { marker.lMarker.openPopup() }, 9200)
  setTimeout(function () { marker.lMarker.closePopup() }, 22000)
  setTimeout(function () { map.flyTo([marker.latitude + 0.06, marker.longitude], 2, {animate: true, duration: 4}) }, 23000)
}

function loopMarkers (markers) {
  var n = xp_ids.length
  var i = 0
  flyToMarker(markers[xp_ids[i]])
  window.setInterval(function () {
    i = (i + 1) % n
    flyToMarker(markers[xp_ids[i]])
  }, 25000)
}
