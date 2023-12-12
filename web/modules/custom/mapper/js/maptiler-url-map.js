(function () {
  const mapContainer = document.getElementById(mapSelector);

  // Stop execution if the map wrapper is not found.
  if (!mapContainer || !mapOptionsCommon) {
    return;
  }

  const map = new maptilersdk.Map({
    ...mapOptionsCommon,
    // @see https://docs.maptiler.com/sdk-js/api/map/#map-options
    maptilerLogo: false,
    renderWorldCopies: false,
  });

  // Remove the loading style from the map wrapper.
  //   map.on('load', async function () {
  //     const geojson = await maptilersdk.data.get('YOUR_MAPTILER_DATASET_ID_HERE');
  //     map.addSource('rio_cats', {
  //         type: 'geojson',
  //         data: geojson
  //     });
  //     map.addLayer({
  //         'id': 'rio_cats',
  //         'type': 'fill',
  //         'source': 'rio_cats',
  //         'layout': {},
  //         'paint': {
  //             'fill-color': '#98b',
  //             'fill-opacity': 0.8
  //         }
  //     });
  // });
  map.on('load', function (e) {

    map.addSource('ventorelativo-all', {
      type: 'geojson',
      data: `/api/sites/all/geo.json`
    });

    // map.on("sourcedata", function (e) {
    //   if (map.getSource('ventorelativo-all') && map.isSourceLoaded('ventorelativo-all')) {
    //     console.log('source loaded!');
    //     var features = map.querySourceFeatures('ventorelativo-all');
    //     // console.log(features);
    //     // const bounds = features.reduce((bbox, feature) => {
    //     //   const coords = feature.geometry.coordinates;
    //     //   console.log(coords);

    //     //   return [
    //     //     Math.min(bbox[ 0 ], coords[ 0 ]),
    //     //     Math.min(bbox[ 1 ], coords[ 1 ]),
    //     //     Math.max(bbox[ 2 ], coords[ 0 ]),
    //     //     Math.max(bbox[ 3 ], coords[ 1 ]),
    //     //   ];
    //     // }, [ Infinity, Infinity, -Infinity, -Infinity ]);

    //     var bounds = {}, coords, point, latitude, longitude;

    //     for (var i = 0; i < features.length; i++) {
    //       coords = features[i].geometry.coordinates;

    //       for (var j = 0; j < coords.length; j++) {
    //         longitude = coords[j][0];
    //         latitude = coords[j][1];
    //         bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
    //         bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
    //         bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
    //         bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
    //       }
    //     }

    //     // Fit the map to the bounding box
    //     map.fitBounds(bounds, { padding: 20 });
    //   }
    // });

    map.addLayer({
      id: 'polygon-layer',
      type: 'fill',
      source: 'ventorelativo-all',
      filter: [ '==', '$type', 'Polygon' ],
      paint: {
        'fill-color': [ 'get', 'fill' ],
        'fill-opacity': 0.2,
        'fill-outline-color': [ 'get', 'stroke' ]
      }
    });

    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'ventorelativo-all',
      filter: [ '==', '$type', 'LineString' ],
      paint: {
        'line-color': [ 'get', 'stroke' ],
        'line-width': 2
      }
    });

    map.addLayer({
      id: 'point-layer',
      type: 'circle',
      source: 'ventorelativo-all',
      filter: [ '==', '$type', 'Point' ],
      paint: {
        'circle-color': [ 'get', 'fill' ],
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': [ 'get', 'stroke' ]
      }
    });

    // Add local images for each "field_type"
    // map.loadImage('https://cdn-icons-png.flaticon.com/512/72/72924.png', function (error, image) {
    //   if (error) throw error;
    //   map.addImage('takeoff', image);
    // });

    // map.loadImage('https://cdn-icons-png.flaticon.com/512/8395/8395097.png', function (error, image) {
    //   if (error) throw error;
    //   map.addImage('landing', image);
    // });
    // Add a symbol layer for each "field_type"
    // map.addLayer({
    //   id: 'symbol-layer',
    //   type: 'symbol',
    //   source: 'ventorelativo-all',
    //   filter: [ '==', '$type', 'Point' ],
    //   layout: {
    //     'icon-image': [ 'get', 'field_type' ],
    //     'icon-size': 0.05,
    //     'text-field': [ 'get', 'name' ],
    //     // 'text-font': ['Open Sans Regular'],
    //     'text-offset': [0, 0.6],
    //     'text-size': 10,
    //     'text-anchor': 'top'
    //   },
    //   paint: {
    //     'icon-opacity': 0.8,
    //     'text-opacity': 0.8
    //   }
    // });

    // map.addLayer({
    //   id: 'takeoff-layer',
    //   type: 'circle',
    //    source: 'ventorelativo-all',
    //   filter: ['==', '$type', 'Point'],
    //   paint: {
    //     'circle-color': ['match', ['get', 'field_type'], 'takeoff', '#FFA07A', '#000000'],
    //     'circle-radius': 6,
    //     'circle-stroke-width': 2,
    //     'circle-stroke-color': ['match', ['get', 'field_type'], 'takeoff', '#FFA07A', '#000000']
    //   }
    // });

    // map.addLayer({
    //   id: 'landing-layer',
    //   type: 'circle',
    //    source: 'ventorelativo-all',
    //   filter: ['==', '$type', 'Point'],
    //   paint: {
    //     'circle-color': ['match', ['get', 'field_type'], 'landing', '#00FF00', '#000000'],
    //     'circle-radius': 6,
    //     'circle-stroke-width': 2,
    //     'circle-stroke-color': ['match', ['get', 'field_type'], 'landing', '#00FF00', '#000000']
    //   }
    // });

    // map.on('click', 'point-layer', function (e) {
    //   console.log(e);
    //   var coordinates = e.features[0].geometry.coordinates[0].slice(); // Use the first coordinate of the line
    //   var description = e.features[0].properties.description;

    //   new maptilersdk.Popup()
    //     .setLngLat(coordinates)
    //     .setHTML(description)
    //     .addTo(map);
    // });

    // When a click event occurs on a feature in the states layer, open a popup at the
    // location of the click, with description HTML from its properties.
    let popup;

    map.on('click', 'point-layer', (e) => {
      new maptilersdk.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[ 0 ].properties.description)
        .addTo(map);
    });

    // Add tooltips on hover for points
    map.on('mouseenter', 'point-layer', function (e) {
      map.getCanvas().style.cursor = 'pointer';
      const coordinates = e.features[ 0 ].geometry.coordinates.slice();
      const name = e.features[ 0 ].properties.name;

      popup = new maptilersdk.Popup()
        .setLngLat(coordinates)
        .setHTML(name)
        .addTo(map);
    });

    map.on('mouseleave', 'point-layer', function () {
      map.getCanvas().style.cursor = '';
      if (popup) {
        popup.remove();
      }
    });


    // Add the layer switcher control.
    map.addControl(new layerSwitcherControl({ basemaps: baseMaps, initialBasemap: initialStyle }), 'top-left');
    mapContainer.classList.remove('loading');
  });


})();
