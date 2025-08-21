// 🔐 Token Cesium ion
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyM2EzZGIyMC0zN2VjLTRkZmYtOThlYy02NjFlNjdhYTg1NDUiLCJpZCI6MzMxMzY1LCJpYXQiOjE3NTU2MzI0NTh9.0gkIqgo_LmgtFRnDHXBeHOb8emd1YgUvQEh53txOuKM";

// === Parámetros ===
const URL_GEOJSON_BUILDINGS = "Construcciones-Marichuela-pisos.geojson";
const URL_GEOJSON_VIAS = "vias_bogota_marichuela.geojson";
const PISO_M = 3.0;
const START_LL = { lon: -74.11895357022483, lat: 4.510781818697951 }; 
const EYE_HEIGHT = 2.7;

// === Viewer ===
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  animation: false,
  timeline: false,
  selectionIndicator: false,
  infoBox: false,
  geocoder: false,
  sceneModePicker: false,
  baseLayerPicker: true,
  navigationHelpButton: false,
});

viewer.scene.globe.depthTestAgainstTerrain = true;

const statusEl = document.getElementById("status");
const btnFit = document.getElementById("btnFit");

// === Estado de recorrido sobre vías ===
let activePath = [];
let pathIndex = 0;
let streetMode = false;
let heading = 0;
let pitch = Cesium.Math.toRadians(-10);

// Velocidades
const SPEED_MPS = 2.0;
const SAMPLE_STEP_M = 2.0;
const ROT_RATE = 0.02;
const TILT_RATE = 0.01;

// === Utilidades ===
function setInitialView() {
  const c = Cesium.Cartesian3.fromDegrees(START_LL.lon, START_LL.lat, 60);
  viewer.camera.setView({
    destination: c,
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-15), roll: 0 },
  });
}

// Vista inicial que abarque todos los edificios y vías
function flyToAllFeatures() {
  const entities = viewer.entities.values;
  let allPoints = [];

  for (const e of entities) {
    if (e.polyline) {
      allPoints.push(...e.polyline.positions.getValue(Cesium.JulianDate.now()));
    }
    if (e.polygon) {
      const hierarchy = e.polygon.hierarchy.getValue(Cesium.JulianDate.now());
      const extrude = e.polygon.extrudedHeight || 0;
      hierarchy.positions.forEach(pos => {
        allPoints.push(new Cesium.Cartesian3(pos.x, pos.y, pos.z + extrude));
      });
    }
  }

  if (allPoints.length === 0) return;

  const boundingSphere = Cesium.BoundingSphere.fromPoints(allPoints);
  viewer.camera.flyToBoundingSphere(boundingSphere, { duration: 2 });
}

btnFit.addEventListener("click", flyToAllFeatures);

function densifyCartesian(positions, stepMeters = SAMPLE_STEP_M) {
  if (!positions || positions.length < 2) return positions || [];
  const out = [];
  for (let i = 0; i < positions.length - 1; i++) {
    const a = positions[i];
    const b = positions[i + 1];
    const segmentLen = Cesium.Cartesian3.distance(a, b);
    if (!isFinite(segmentLen) || segmentLen <= 0.01) continue;
    const n = Math.max(1, Math.floor(segmentLen / stepMeters));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const p = Cesium.Cartesian3.lerp(a, b, t, new Cesium.Cartesian3());
      out.push(p);
    }
  }
  out.push(positions[positions.length - 1]);
  return out;
}

function headingFromTwoCartesians(a, b) {
  const carto1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(a);
  const carto2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(b);
  const dLon = carto2.longitude - carto1.longitude;

  const y = Math.sin(dLon) * Math.cos(carto2.latitude);
  const x =
    Math.cos(carto1.latitude) * Math.sin(carto2.latitude) -
    Math.sin(carto1.latitude) * Math.cos(carto2.latitude) * Math.cos(dLon);

  let brng = Math.atan2(y, x);
  if (brng < 0) brng += Cesium.Math.TWO_PI;
  return brng;
}

function setCameraAtPathIndex(i, alignHeadingToPath = false) {
  if (!activePath.length) return;
  i = Cesium.Math.clamp(i, 0, activePath.length - 1);
  pathIndex = i;

  const pos = activePath[i];
  if (!pos) return;

  if (alignHeadingToPath) {
    const next = activePath[Math.min(i + 1, activePath.length - 1)];
    if (next && next !== pos) {
      heading = headingFromTwoCartesians(pos, next);
    }
  }

  const cam = new Cesium.Cartesian3(pos.x, pos.y, pos.z + EYE_HEIGHT);
  viewer.camera.setView({
    destination: cam,
    orientation: { heading, pitch, roll: 0 },
  });
}

// === Cargar edificios ===
async function loadBuildings() {
  statusEl.textContent = "Cargando construcciones…";
  const ds = await Cesium.GeoJsonDataSource.load(URL_GEOJSON_BUILDINGS, { clampToGround: false });
  viewer.dataSources.add(ds);

  for (const e of ds.entities.values) {
    const pol = e.polygon;
    if (!pol) continue;

    const raw = e.properties?.CONNPISOS;
    const pisos = Math.max(1, Number(raw?.getValue ? raw.getValue() : raw) || 1);
    const altura = pisos * PISO_M;

    pol.material = Cesium.Color.fromCssColorString("#e55d1e").withAlpha(0.9);
    pol.outline = true;
    pol.outlineColor = Cesium.Color.BLACK;
    pol.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    pol.extrudedHeight = altura;
    pol.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
  }

  statusEl.textContent = "Construcciones listas";
}

// === Cargar vías y labels siempre visibles ===
let viasDataSource = null;
async function loadVias() {
  statusEl.textContent = "Cargando vías…";
  viasDataSource = await Cesium.GeoJsonDataSource.load(URL_GEOJSON_VIAS, { clampToGround: true });
  viewer.dataSources.add(viasDataSource);

  for (const ent of viasDataSource.entities.values) {
    if (ent.polyline) {
      ent.polyline.width = 6.0;
      ent.polyline.material = Cesium.Color.CYAN.withAlpha(0.85);

      if (ent.properties?.NOMBRE) {
        const positions = ent.polyline.positions.getValue(Cesium.JulianDate.now());
        if (positions.length >= 2) {
          const midIndex = Math.floor(positions.length / 2);
          const midPos = positions[midIndex];

          // Label siempre visible, elevado 5 m sobre la vía
          viewer.entities.add({
            position: new Cesium.Cartesian3(midPos.x, midPos.y, midPos.z + 5),
            label: {
              text: ent.properties.NOMBRE.getValue(),
              font: "18px sans-serif",
              fillColor: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              heightReference: Cesium.HeightReference.NONE, // no pegado al terreno
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
        }
      }
    }
  }

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && picked.id && picked.id.polyline) {
      const positions = picked.id.polyline.positions.getValue(Cesium.JulianDate.now());
      if (positions && positions.length >= 2) {
        activePath = densifyCartesian(positions, SAMPLE_STEP_M);
        pathIndex = 0;
        streetMode = true;
        setCameraAtPathIndex(pathIndex, true);
        statusEl.textContent = "Street ON (vías)";
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  statusEl.textContent = "Vías listas. Haz clic en una vía.";
}

// === Controles de teclado ===
const keys = { forward:false, backward:false, left:false, right:false, lookUp:false, lookDown:false };

document.addEventListener("keydown", (e) => {
  switch(e.code){
    case "ArrowUp": keys.forward = true; break;
    case "ArrowDown": keys.backward = true; break;
    case "ArrowLeft": keys.left = true; break;
    case "ArrowRight": keys.right = true; break;
    case "KeyW": keys.lookUp = true; break;
    case "KeyS": keys.lookDown = true; break;
  }
});

document.addEventListener("keyup", (e) => {
  switch(e.code){
    case "ArrowUp": keys.forward = false; break;
    case "ArrowDown": keys.backward = false; break;
    case "ArrowLeft": keys.left = false; break;
    case "ArrowRight": keys.right = false; break;
    case "KeyW": keys.lookUp = false; break;
    case "KeyS": keys.lookDown = false; break;
  }
});

viewer.clock.onTick.addEventListener(() => {
  if (!streetMode || activePath.length < 2) return;

  const dt = viewer.clock.deltaTime || 0.016;
  const stepPoints = Math.max(1, Math.round((SPEED_MPS * dt) / SAMPLE_STEP_M));

  if (keys.forward) { pathIndex = Math.min(activePath.length - 1, pathIndex + stepPoints); setCameraAtPathIndex(pathIndex, true); }
  if (keys.backward) { pathIndex = Math.max(0, pathIndex - stepPoints); setCameraAtPathIndex(pathIndex, true); }
  if (keys.left) { heading -= ROT_RATE; setCameraAtPathIndex(pathIndex, false); }
  if (keys.right) { heading += ROT_RATE; setCameraAtPathIndex(pathIndex, false); }
  if (keys.lookUp) { pitch = Cesium.Math.clamp(pitch + TILT_RATE, Cesium.Math.toRadians(-85), Cesium.Math.toRadians(20)); setCameraAtPathIndex(pathIndex, false); }
  if (keys.lookDown) { pitch = Cesium.Math.clamp(pitch - TILT_RATE, Cesium.Math.toRadians(-85), Cesium.Math.toRadians(20)); setCameraAtPathIndex(pathIndex, false); }
});

// === Inicio ===
(async function init() {
  try {
    setInitialView();
    await loadBuildings();
    await loadVias();
    flyToAllFeatures();
    statusEl.textContent = "Listo. Haz clic en una vía para recorrer.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error cargando datos.";
  }
})();
