(function () {
  const mapContainer = document.getElementById('mapper-map');

  // Stop execution if the map wrapper is not found.
  if (!mapContainer) {
    return;
  }

  const geojsonUrl = '/api/sites/all/geo.json'

  // Fetch GeoJSON data using the Fetch API
  fetch(geojsonUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Network response was not ok: ${response.statusText}`
        )
      }
      return response.json()
    })
    .then((data) => {
      // Calculate the bounding box
      const bounds = new maptilersdk.LngLatBounds()
      data.features.forEach((feature) => {
        if (feature.geometry.type === 'Point') {
          bounds.extend(feature.geometry.coordinates)
        } else if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[ 0 ].forEach((coord) => {
            bounds.extend(coord)
          })
        }
      })

      const map = new maptilersdk.Map({
        container: mapContainer,
        style: '3d203d09-e79b-4c16-a28d-b9564619b3a7', //maptilersdk.MapStyle.TOPO.PASTEL,
        center: [ 7.18, 44.88 ],
        zoom: 10.5,
        minZoom: 9,
        bounds: bounds, // resets zoom and center
        fitBoundsOptions: { padding: { top: 40, bottom: 60, left: 40, right: 40 } },
        geolocateControl: false,
        fullscreenControl: true,
        terrain: true,
        terrainControl: true,
        terrainExaggeration: 1.2,
        // pitch: 25,
        maxPitch: 70,
        // scrollZoom: false,
        cooperativeGestures: isTouchDevice(),
        maptilerLogo: false,
        attributionControl: false,
        crossSourceCollisions: false,
      })

      // Add source and layer whenever base style is loaded
      map.on('styledata', () => {
        if (!map.getSource('geojson')) {
          map.addSource('geojson', {
            type: 'geojson',
            data: data,
          })

          // The Shapes (Polygons) are added first so that they are below the Points
          map.addLayer({
            id: 'shapes',
            type: 'fill',
            source: 'geojson',
            layout: {},
            filter: [ '==', '$type', 'Polygon' ],
            paint: {
              'fill-color': [ 'get', 'fill' ],
              'fill-opacity': 0.2,
              'fill-outline-color': '#000',
            },
          })
          // Then the Lines (like outlines, powerlines, etc.)
          map.addLayer({
            id: 'lines',
            type: 'line',
            source: 'geojson',
            layout: {},
            filter: [
              'any',
              [ '==', '$type', 'Polygon' ],
              [ '==', '$type', 'LineString' ],
            ],
            paint: {
              'line-color': [ 'get', 'stroke' ],
              'line-width': 3,
            },
          })
          // Shadow for the Points
          map.addLayer({
            id: 'points-shadow',
            type: 'circle',
            source: 'geojson',
            filter: [ '==', '$type', 'Point' ],
            paint: {
              'circle-radius': 11,
              'circle-color': '#00000044',
              'circle-blur': 0.5,
              'circle-translate': [ 1, 1 ],
              'circle-opacity': [
                'interpolate',
                [ 'linear' ],
                [ 'zoom' ],
                16,
                1,
                17,
                0,
              ],
            },
          })
          // Add a layer for points of any other type
          map.addLayer({
            id: 'points-other',
            type: 'circle',
            source: 'geojson',
            filter: [
              'all',
              [ '==', '$type', 'Point' ],
              [ '!=', 'field_type', 'takeoff' ],
              [ '!=', 'field_type', 'landing' ],
            ],
            paint: {
              'circle-color': [ 'get', 'fill' ],
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFF',
            },
          })
          // Landing Points (disappear at closer zoom levels)
          map.addLayer({
            id: 'points-landing',
            type: 'symbol',
            source: 'geojson',
            filter: [
              'all',
              [ '==', '$type', 'Point' ],
              [ '==', 'field_type', 'landing' ],
            ],
            layout: {
              'icon-image': 'landing',
              'icon-size': 0.22,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            },
          })
          // Add a layer for takeoff points.
          map.addLayer({
            id: 'points-takeoff',
            type: 'symbol',
            source: 'geojson',
            filter: [
              'all',
              [ '==', '$type', 'Point' ],
              [ '==', 'field_type', 'takeoff' ],
            ],
            layout: {
              'icon-image': 'takeoff',
              'icon-size': 0.22,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            },
          })
          // Common label style
          let styleLabel = {
            layout: {
              'text-field': [
                'format',
                [ 'get', 'name' ],
                { 'font-scale': 1 },
                // '\n',
                // {},
                // ['get', 'name'],
                // {
                //   'font-scale': 0.8,
                //   'text-font': [
                //     'literal',
                //     ['DIN Offc Pro Italic', 'Arial Unicode MS Regular'],
                //   ],
                // },
              ],
              'text-font': [ 'Avenir Bold', 'Avenir Next' ],
              'text-size': 11,
              'text-anchor': 'top',
              'text-offset': [ 0, 0.5 ],
            },
            paint: {
              'text-halo-color': '#fff',
              'text-halo-width': 2,
            },
          }
          // label for the other geometries
          map.addLayer({
            id: 'label-geometries',
            type: 'symbol',
            source: 'geojson',
            filter: [
              'all',
              [ 'has', 'name' ],
              [ '!=', '$type', 'Point' ],
              [ '!=', 'field_type', 'landing' ],
            ],
            ...styleLabel,
          })
          //Label for Points
          map.addLayer({
            id: 'label-points',
            type: 'symbol',
            source: 'geojson',
            filter: [ 'all', [ 'has', 'name' ], [ '==', '$type', 'Point' ] ],
            ...styleLabel,
          })

          const layers = [
            'points-other',
            'points-landing',
            'points-takeoff',
          ]
          layers.forEach((layer) => {
            map.on('click', layer, (e) => {
              new maptilersdk.Popup()
                .setLngLat(e.lngLat)
                .setHTML(e.features[ 0 ].properties.description)
                .addTo(map)
            })
            map.on(
              'mouseenter',
              layer,
              () => (map.getCanvas().style.cursor = 'pointer')
            )
            map.on(
              'mouseleave',
              layer,
              () => (map.getCanvas().style.cursor = '')
            )
          })
        }
      })

      // Inside this handler to avoid conflicts with animations.
      map.on('loadWithTerrain', (evt) => {
        // setPitch with an animation.
        map.easeTo({ pitch: 25, duration: 2000 })
      })

      map.on('load', function () {
        map.loadImage('/modules/custom/mapper/config/assets/img/takeoff.png', (error, image) => {
          if (error) throw error
          map.addImage('takeoff', image)
        })
        map.loadImage('/modules/custom/mapper/config/assets/img/landing.png', (error, image) => {
          if (error) throw error
          map.addImage('landing', image)
        })
        mapContainer.classList.remove('loading');
        document
          .getElementById('mapstyles')
          .addEventListener('change', (e) => {
            const style_code = e.target.value.split('.')
            style_code.length === 2
              ? map.setStyle(
                maptilersdk.MapStyle[ style_code[ 0 ] ][ style_code[ 1 ] ]
              )
              : map.setStyle(maptilersdk.MapStyle[ style_code[ 0 ] ])
          })
      })
    })

})();
