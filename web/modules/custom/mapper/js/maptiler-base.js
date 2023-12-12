maptilersdk.config.apiKey = '43jtWKU1n6PJru2J0ElA';
const unepStyleId = 'bad49809-c61a-41fe-a212-9b1f58c1a8f8';
const unepHybridStyleId = 'd07c7b14-599b-49eb-bb70-000a8f4984d6';

const mapSelector = 'mapper-map';

const mapOptionsCommon = {
  container: mapSelector, // container's id or the HTML element in which the SDK will render the map
  style: unepStyleId, // Custmom style ID (UNEP)
  terrainControl: true,
  scaleControl: true,
  fullscreenControl: true,
  terrainExaggeration: 1.3,
  geolocateControl: false //disable the geolocate control
};

// Available custom style, written in object with "img" thumbnail format.
let baseMaps = {};
baseMaps[ unepStyleId ] = { img: "https://cloud.maptiler.com/static/img/maps/topo.png" };
baseMaps[ unepHybridStyleId ] = { img: "https://cloud.maptiler.com/static/img/maps/hybrid.png" };
// Initial Map Style, the first from the one defined above.
const initialStyle = Object.keys(baseMaps)[ 0 ];

// Class creating the layer switcher control
class layerSwitcherControl {
  constructor(options) {
    this._options = { ...options };
    this._container = document.createElement("div");
    this._container.classList.add("maplibregl-ctrl");
    this._container.classList.add("maplibregl-ctrl-basemaps");
    this._container.classList.add("closed");
    switch (this._options.expandDirection || "right") {
      case "top":
        this._container.classList.add("reverse");
      case "down":
        this._container.classList.add("column");
        break;
      case "left":
        this._container.classList.add("reverse");
    }
    this._container.addEventListener("mouseenter", () => {
      this._container.classList.remove("closed");
    });
    this._container.addEventListener("mouseleave", () => {
      this._container.classList.add("closed");
    });
  }
  onAdd(map) {
    this._map = map;
    const basemaps = this._options.basemaps;
    Object.keys(basemaps).forEach((layerId) => {
      const base = basemaps[ layerId ];
      const basemapContainer = document.createElement("img");
      basemapContainer.src = base.img;
      basemapContainer.classList.add("basemap");
      basemapContainer.dataset.id = layerId;
      basemapContainer.addEventListener("click", () => {
        const activeElement = this._container.querySelector(".active");
        activeElement.classList.remove("active");
        basemapContainer.classList.add("active");
        map.setStyle(layerId);
        // Fixes "Unable to perform style diff [...]"
        // (layerId === 'HYBRID') && map.hasTerrain() && map.enableTerrain();
      });
      this._container.appendChild(basemapContainer);
      if (this._options.initialBasemap === layerId) {
        basemapContainer.classList.add("active");
      }
    });
    return this._container;
  }
  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    delete this._map;
  }
}
