// -----------------------------------------------------------------------------
// map.js - Create a map, and fly through markers.
// -----------------------------------------------------------------------------

var Mustache // Mustache loaded in index.html
var L  // leaflet loaded in index.html
var $  // jQuery loaded in index.html
var token = 'pk.eyJ1IjoiYmVuamFtaW50ZCIsImEiOiJjaW83enIwNjYwMnB1dmlsejN6cDBzbm93In0.0ZOGwSLp8OjW6vCaEKYFng'

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
    position: 'bottomright'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'logo')
    return container
  }
})

map.addControl(new LogoControl())

// Define cluster layer and marker list
// var markerCluster = L.markerClusterGroup()  // clusters are unused now.
// map.addLayer(markerCluster)
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
    markerList.push(data[i])
  }
  loopMarkers(markerList)
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
  map.flyTo([marker.latitude, marker.longitude], 3, {animate: true, duration: 2.5})
  setTimeout(function () { map.flyTo([marker.latitude + 0.06, marker.longitude], 10, {animate: true, duration: 2.5}) }, 1700)
  setTimeout(function () { marker.lMarker.openPopup() }, 4600)
  setTimeout(function () { marker.lMarker.closePopup() }, 11000)
  setTimeout(function () { map.flyTo([marker.latitude + 0.06, marker.longitude], 2, {animate: true, duration: 2}) }, 11500)
}

function loopMarkers (markers) {
  var n = markerList.length
  var i = 0
  flyToMarker(markers[i])
  window.setInterval(function () {
    i = (i + 1) % n
    flyToMarker(markers[i])
  }, 12500)
}
