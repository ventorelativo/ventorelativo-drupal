const input = document.querySelector('.js-form-wrapper.field--name-field-init-location.field--widget-unep-map-maptiler-selector textarea');

// Hide the input.
input.style.display = 'none';

// Create the map wrapper.
let mapContainer = document.createElement('div');
mapContainer.id = mapSelector;
mapContainer.classList.add('loading');
input.insertAdjacentElement('afterend', mapContainer);

// Add extra default options.
mapOptionsCommon.center = [ 18.0, 10.0 ];
mapOptionsCommon.zoom = 1;
mapOptionsCommon.geolocateControl = true;
mapOptionsCommon.geolocate = maptilersdk.GeolocationType.COUNTRY;

let defaultCoordinates = '';
// Override if a default value is set.
if (input.value && !input.value.match(/POINT \(\d+ \d+\)/)) {
  defaultCoordinates = input.value.replace('POINT (', '').replace(')', '').split(' ');
  mapOptionsCommon.center = [ defaultCoordinates[ 0 ], defaultCoordinates[ 1 ] ];
  mapOptionsCommon.zoom = 8;
}

// Create the map.
const map = new maptilersdk.Map(mapOptionsCommon);

// Remove the loading style from the map wrapper.
map.on('load', function (e) {
  mapContainer.classList.remove('loading');
});

// Create the Marker
const marker = new maptilersdk.Marker();
if (defaultCoordinates) {
  marker.setLngLat(defaultCoordinates)
    .addTo(map);
  map.flyTo({
    center: defaultCoordinates
  });
}

// Add geocoding controls.
const gc = new maptilersdkMaptilerGeocoder.GeocodingControl({
  types: [
    // 'country',
    'region',
    'subregion',
    'county',
    'joint_municipality',
    'joint_submunicipality',
    'municipality',
    'municipal_district',
    'locality',
    'neighbourhood',
    'place',
    'postal_code',
    'address',
    'poi',
  ],
});
map.addControl(gc, 'top-left');

// Add the layer switcher control.
map.addControl(new layerSwitcherControl({ basemaps: baseMaps, initialBasemap: initialStyle }), 'top-left');

// Set up an event listener on the map.
map.on('click', function (e) {
  // Remove any existing marker from the map.
  marker.remove();
  // The event object (e) contains information like the
  // coordinates of the point on the map that was clicked.
  // Change the input values.
  input.value = `POINT (${e.lngLat.lng} ${e.lngLat.lat})`;

  // Add the new marker.
  marker.setLngLat(e.lngLat)
    .addTo(map);
});
