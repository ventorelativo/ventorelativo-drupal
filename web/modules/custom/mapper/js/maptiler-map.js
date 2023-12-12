(function () {
  const mapContainer = document.getElementById(mapSelector);

  // Stop execution if the map wrapper is not found.
  if (!mapContainer || mapContainer.dataset.lonlat === '') {
    return;
  }

  // Gett coordinates from the data attribute and split them in an array.
  const lonlat = mapContainer.dataset.lonlat.split(',');
  mapOptionsCommon.center = [ lonlat[ 0 ], lonlat[ 1 ] ];
  mapOptionsCommon.zoom = 8;

  // Create the map.
  const map = new maptilersdk.Map(mapOptionsCommon);

  // Remove the loading style from the map wrapper.
  map.on('load', function (e) {
    mapContainer.classList.remove('loading');
  });

  // Create the Marker
  const title = document.querySelector('h1').innerText;
  const marker = new maptilersdk.Marker()
    .setLngLat(lonlat)
    .setPopup(new maptilersdk.Popup().setHTML(`<strong>${title}</strong>`))
    .addTo(map);
  map.flyTo({ center: lonlat });
  // marker.togglePopup()

  map.addControl(new layerSwitcherControl({ basemaps: baseMaps, initialBasemap: initialStyle }), 'top-left');
})();
