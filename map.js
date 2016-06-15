var Mustache
var L  // leaflet
var $  // jQuery
var token = 'pk.eyJ1IjoiYmVuamFtaW50ZCIsImEiOiJjaW83enIwNjYwMnB1dmlsejN6cDBzbm93In0.0ZOGwSLp8OjW6vCaEKYFng'

var map = new L.Map('map-canvas').setView([51.505, -0.09], 3)

// add base map
L.tileLayer('https://api.mapbox.com/styles/v1/benjamintd/cipflarp1001bd2ng0sj3rh9y/tiles/256/{z}/{x}/{y}?access_token=' + token, {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map)

var markerCluster = L.markerClusterGroup()
map.addLayer(markerCluster)

// creating markers

function processData (data) {
  for (var i = 0; i < data.length; i++) {
    buildMarker(data[i])
  }
}

function buildMarker (marker) {
  // Formatting values
  marker.place = (marker.place || marker.city)
  marker.glyphicon_domain = (marker.experience_type === '3A') ? 'education' : 'briefcase'

  // Build the indexed markers list
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
  markerCluster.addLayer(lMarker)
}

function renderInfoWindow (marker) {
  // Use Mustache to render the template
  return Mustache.render($('#templateInfoWindow').html(), marker)
}

$.ajax({
  type: 'GET',
  url: '/data/markers.json',
  dataType: 'json',
  success: processData,
  error: function () { window.alert('failed') }
})

// Adding logo
var MyControl = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'logo')
    return container
  }
})

map.addControl(new MyControl())

// script

setTimeout(function () { map.flyTo([12, 15], 5, {animate: true, duration: 5}) }, 3000)
