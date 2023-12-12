(function () {
  const list = document.querySelectorAll('.map-search .item-list li');
  // Initialize an empty array to store the data
  const searchResultsMarkers = [];
  // Iterate through the list items
  list.forEach((item) => {
    const title = item.querySelector('.views-field-title').textContent;
    const subtitle = item.querySelector('.views-field-field-init-subtitle').textContent;
    const url = item.querySelector('.views-field-search-api-url').textContent;
    const location = item.querySelector('.views-field-field-init-location').textContent;

    // Extract latitude and longitude from the location string
    const [ , lon, lat ] = location.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);

    // Create an object for each item and push it to the data array
    searchResultsMarkers.push({
      title: title,
      subtitle: subtitle,
      url: url,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lon)
      }
    });
  });

  const mapContainer = document.getElementById(mapSelector);
  const map = new maptilersdk.Map(mapOptionsCommon);

  // Remove the loading style from the map wrapper.
  map.on('load', function (e) {
    mapContainer.classList.remove('loading');
  });

  searchResultsMarkers.forEach(e => {
    // Get the coordinates from the data attribute and split them in an array.
    const lonlat = [ e.location.lng, e.location.lat ];
    // Create the Marker
    const marker = new maptilersdk.Marker()
      .setLngLat(lonlat)
      .setPopup(new maptilersdk.Popup().setHTML(`<a href="${e.url}"><strong>${e.title}: ${e.subtitle}</strong></a>`))
      .addTo(map);
  });

  map.addControl(new layerSwitcherControl({ basemaps: baseMaps, initialBasemap: initialStyle }), 'top-left');
})();
