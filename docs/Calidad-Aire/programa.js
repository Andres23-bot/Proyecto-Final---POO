// --- Inicialización del mapa ---
const mapa = L.map('mapa').setView([4.5182789301826265, -74.11642401003672], 15); // Bogotá

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(mapa);

// --- Icono personalizado ---
const iconoEstacion = L.icon({
  iconUrl: './img/air-station.png',
  iconSize: [60, 60],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});
// --- Icono personalizado ---
const iconoPUR = L.icon({
  iconUrl: './img/PUR.png',
  iconSize: [45, 65],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Marcador estación Usme
L.marker([4.531206, -74.111714], { icon: iconoEstacion }).addTo(mapa)
  .bindPopup(`
    <div style="text-align:center;">
      <h4>📡 Estación de Monitoreo de la calidad del aire</h4>
      <img src='./img/estaciones-monitoreo.jpg'
           alt="Estación Usme"
           width="300" height="150" />
      <p>Estación de Usme</p>
    </div>
  `);

// Marcador estaciones PUR
L.marker([4.50773618959105, -74.11565196342099], { icon: iconoPUR }).addTo(mapa)
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED Tenerife Ext</h4>
    </div>
  `); 
L.marker([4.5125732200364554, -74.1170487196042], { icon: iconoPUR }).addTo(mapa) 
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED CervantesSa Ext</h4>
    </div>
  `); 
L.marker([4.513891525594909, -74.09041658986686], { icon: iconoPUR }).addTo(mapa)
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED NEsperanza Ext</h4>
    </div>
  `);  
L.marker([4.507681261360938, -74.11797609088494], { icon: iconoPUR }).addTo(mapa) 
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED Atabanzha Ext</h4>
    </div>
  `); 
L.marker([4.517611265083233, -74.11627178441178], { icon: iconoPUR }).addTo(mapa) 
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED BrasiliaU Ext</h4>
    </div>
  `); 
L.marker([4.502507000692587, -74.10750612781402], { icon: iconoPUR }).addTo(mapa) 
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED Ochoa Ext</h4>
    </div>
  `); 
L.marker([4.512984523486406, -74.10838674457717], { icon: iconoPUR }).addTo(mapa) 
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED LosTejares Ext</h4>
    </div>
  `); 
L.marker([4.4871954112928725, -74.10256501972859], { icon: iconoPUR }).addTo(mapa) 
.bindPopup(`
    <div style="text-align:center;">
      <h4>📡 PUR IED CVillavicen Ext</h4>
    </div>
  `); 


// --- Cargar polígono de barrio ---
fetch("./Limite_barrio_Marichuela.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, { style: { color: "blue", weight: 2, fillOpacity: 0.1 } }).addTo(mapa);
  });

// =========================
// Configuración estaciones
// =========================
const estacionesTiempoReal = [
  { nombre: "Usme (general)", id: "A521266" },
  { nombre: "PUR IED Tenerife Ext", id: "A409489" },
  { nombre: "PUR IED CervantesSa Ext", id: "A409270" },
  { nombre: "PUR IED NEsperanza Ext", id: "A409309" },
  { nombre: "PUR IED Atabanzha Ext", id: "A411472" },
  { nombre: "PUR IED BrasiliaU Ext", id: "A411670" },
  { nombre: "PUR IED Ochoa Ext", id: "A409183" },
  { nombre: "PUR IED LosTejares Ext", id: "A416026" },
  { nombre: "PUR IED CVillavicen Ext", id: "A415819" }
];

// =========================
// Configuración contaminantes
// =========================
const contaminantesTiempoReal = {
  co: "CO",       // Monóxido de Carbono
  o3: "O3",       // Ozono
  no2: "NO2",     // Dióxido de Nitrógeno
  pm10: "PM10",   // Material Particulado PM10
  pm25: "PM2.5",  // Material Particulado PM2.5
  so2: "SO2"      // Dióxido de Azufre
};

// =========================
// Token AQICN
// =========================
const tokenTiempoReal = "e6b8169748351f258b15a84ada2884c71f8cd388"; // tu token real

// =========================
// Cargar datos
// =========================
async function cargarAQICNTiempoReal() {
  const tbody = document.querySelector("#tablaTiempoReal tbody");
  tbody.innerHTML = ""; // limpiar antes de cargar

  for (const est of estacionesTiempoReal) {
    const fila = document.createElement("tr");

    // Primera celda: nombre de la estación
    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = est.nombre;
    fila.appendChild(celdaNombre);

    try {
      const datos = await obtenerDatosEstacionTiempoReal(est.id);

      console.log(est.nombre, datos); // <-- Aquí ves todo lo que devuelve la API

      // Agregar contaminantes
      for (const clave in contaminantesTiempoReal) {
        const celda = document.createElement("td");
        if (datos && datos[clave] && datos[clave].v !== undefined) {
          celda.textContent = datos[clave].v; // Último valor reportado
        } else {
          celda.textContent = "-";
        }
        fila.appendChild(celda);
      }
    } catch (error) {
      console.error(`Error al cargar ${est.nombre}:`, error);

      // Mostrar "sin dato" en caso de error
      for (let i = 0; i < Object.keys(contaminantesTiempoReal).length; i++) {
        const celda = document.createElement("td");
        celda.textContent = "sin dato";
        fila.appendChild(celda);
      }
    }

    tbody.appendChild(fila);
  }
}

// =========================
// Obtener datos estación
// =========================
async function obtenerDatosEstacionTiempoReal(stationId) {
  const url = `https://api.waqi.info/feed/@${stationId}/?token=${tokenTiempoReal}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Error API");

  const data = await resp.json();
  if (data.status !== "ok") throw new Error("Respuesta inválida");

  return data.data.iaqi; // <-- Objeto con todos los contaminantes reportados
}

// =========================
// Auto-cargar al abrir
// =========================
cargarAQICNTiempoReal().then(actualizarMapaCalor);

// Coordenadas aproximadas de las estaciones (puedes ajustar si tienes datos precisos)
const coordenadasEstaciones = {
  "Usme (general)": [4.531206, -74.111714],
  "PUR IED Tenerife Ext": [4.50773618959105, -74.11565196342099],
  "PUR IED CervantesSa Ext": [4.5125732200364554, -74.1170487196042],
  "PUR IED NEsperanza Ext": [4.513891525594909, -74.09041658986686],
  "PUR IED Atabanzha Ext": [4.507681261360938, -74.11797609088494],
  "PUR IED BrasiliaU Ext": [4.517611265083233, -74.11627178441178],
  "PUR IED Ochoa Ext": [4.502507000692587, -74.10750612781402],
  "PUR IED LosTejares Ext": [4.512984523486406, -74.10838674457717],
  "PUR IED CVillavicen Ext": [4.4871954112928725, -74.10256501972859]
};


let capaCalor; // variable global para la capa de calor

// Función para actualizar el mapa de calor
function actualizarMapaCalor() {
  const contaminante = document.getElementById("selectorContaminante").value;
  if (contaminante === "none") return;

  const tabla = document.querySelector("#tablaTiempoReal tbody");

  // Índice de la columna del contaminante
  const keys = Object.values(contaminantesTiempoReal);
  const idx = keys.indexOf(contaminante);
  if (idx === -1) return;

  const puntos = [];

  for (const fila of tabla.rows) {
    const nombre = fila.cells[0].textContent;
    const valTexto = fila.cells[idx + 1].textContent;
    const valNum = parseFloat(valTexto.replace(",", "."));
    if (isNaN(valNum)) continue;

    const coords = coordenadasEstaciones[nombre];
    if (!coords) continue;

    // Leaflet.heat usa lat, lng, intensidad (opcional)
    // Normalizamos intensidad para que esté entre 0 y 1
    const intensidad = valNum / 300; // Ajusta según tu rango máximo esperado
    puntos.push([coords[0], coords[1], intensidad]);
  }

  // Eliminar capa anterior si existe
  if (window.capaCalor) {
    mapa.removeLayer(window.capaCalor);
  }

  // Crear nuevo heatmap con interpolación
  const capa = L.heatLayer(puntos, {
    radius: 80,       // tamaño del área de influencia por punto
    blur: 15,         // suavizado
    max: 0.8,      // zoom máximo con efecto
    gradient: {
      0.0: 'green',
      0.25: 'yellow',
      0.5: 'orange',
      0.75: 'red',
      1.0: 'purple'
    }
  });

  capa.addTo(mapa);
  window.capaCalor = capa;
}

// Evento al cambiar el selector
document.getElementById("selectorContaminante").addEventListener("change", actualizarMapaCalor);





document.addEventListener("DOMContentLoaded", () => {
  // Llama a la función para que se dibuje el heatmap al cargar la página
  actualizarMapaCalor();
});
// --- Variables globales ---
let datosUsme = [];
let charts = {};
const contaminantes = ["CO", "O3", "NO2", "PM10", "PM2.5", "SO2"];

// Colores para series
const colores = {
  "CO": "blue",
  "O3": "green",
  "NO2": "orange",
  "PM10": "red",
  "PM2.5": "purple",
  "SO2": "brown"
};

// Nombres completos para mostrar en análisis
const nombresLargos = {
  "CO": "CO - Monóxido de Carbono",
  "O3": "O3 - Ozono",
  "NO2": "NO2 - Dióxido de Nitrógeno",
  "PM10": "PM10 - Material Particulado PM10",
  "PM2.5": "PM2.5 - Material Particulado PM2.5",
  "SO2": "SO2 - Dióxido de Azufre"
};

// ==========================
// Utilidades de estadística
// ==========================
function calcularEstadisticas(arr) {
  const limpio = arr.filter(v => v !== null && !Number.isNaN(v));
  if (limpio.length === 0) return { max: 0, min: 0, promedio: 0, desviacion: 0 };
  const max = Math.max(...limpio);
  const min = Math.min(...limpio);
  const promedio = limpio.reduce((a, b) => a + b, 0) / limpio.length;
  const desviacion = Math.sqrt(limpio.map(x => (x - promedio) ** 2).reduce((a, b) => a + b, 0) / limpio.length);
  return { max, min, promedio, desviacion };
}

// ==========================
// Intervalos IBOCA (tabla)
// ==========================
const rangosIBOCA = {
  "PM2.5": [
    { cMin: 0,     cMax: 12,     iMin: 0,   iMax: 50  },
    { cMin: 12.1,  cMax: 35.4,   iMin: 51,  iMax: 100 },
    { cMin: 35.5,  cMax: 55.4,   iMin: 101, iMax: 150 },
    { cMin: 55.5,  cMax: 150.4,  iMin: 151, iMax: 200 },
    { cMin: 150.5, cMax: 250.4,  iMin: 201, iMax: 300 },
    { cMin: 250.5, cMax: 500.4,  iMin: 301, iMax: 500 }
  ],
  "PM10": [
    { cMin: 0,     cMax: 27.2,   iMin: 0,   iMax: 50  },
    { cMin: 27.3,  cMax: 63.8,   iMin: 51,  iMax: 100 },
    { cMin: 63.9,  cMax: 95.5,   iMin: 101, iMax: 150 },
    { cMin: 95.6,  cMax: 246.7,  iMin: 151, iMax: 200 },
    { cMin: 246.8, cMax: 405.0,  iMin: 201, iMax: 300 },
    { cMin: 405.1, cMax: 800.4,  iMin: 301, iMax: 500 }
  ],
  "O3": [
    { cMin: 0,     cMax: 72,     iMin: 0,   iMax: 50  },
    { cMin: 73,    cMax: 107,    iMin: 51,  iMax: 100 },
    { cMin: 108,   cMax: 137,    iMin: 101, iMax: 150 },
    { cMin: 138,   cMax: 281,    iMin: 151, iMax: 200 },
    { cMin: 282,   cMax: 432,    iMin: 201, iMax: 300 },
    { cMin: 433,   cMax: 809,    iMin: 301, iMax: 500 }
  ],
  "NO2": [
    { cMin: 0,     cMax: 28.5,   iMin: 0,   iMax: 50  },
    { cMin: 28.6,  cMax: 84.1,   iMin: 51,  iMax: 100 },
    { cMin: 84.2,  cMax: 132.2,  iMin: 101, iMax: 150 },
    { cMin: 132.3, cMax: 361.9,  iMin: 151, iMax: 200 },
    { cMin: 362.0, cMax: 602.6,  iMin: 201, iMax: 300 },
    { cMin: 602.7, cMax: 1202.6, iMin: 301, iMax: 500 }
  ],
  "SO2": [
    { cMin: 0,     cMax: 9.6,    iMin: 0,   iMax: 50  },
    { cMin: 9.7,   cMax: 38.5,   iMin: 51,  iMax: 100 },
    { cMin: 38.6,  cMax: 63.7,   iMin: 101, iMax: 150 },
    { cMin: 63.8,  cMax: 182.7,  iMin: 151, iMax: 200 },
    { cMin: 182.8, cMax: 307.8,  iMin: 201, iMax: 300 },
    { cMin: 307.9, cMax: 618.9,  iMin: 301, iMax: 500 }
  ],
  "CO": [
    { cMin: 0,     cMax: 2549,   iMin: 0,   iMax: 50  },
    { cMin: 2550,  cMax: 5022,   iMin: 51,  iMax: 100 },
    { cMin: 5023,  cMax: 7165,   iMin: 101, iMax: 150 },
    { cMin: 7166,  cMax: 17384,  iMin: 151, iMax: 200 },
    { cMin: 17385, cMax: 28099,  iMin: 201, iMax: 300 },
    { cMin: 28100, cMax: 54802,  iMin: 301, iMax: 500 }
  ]
};

function interpolarIBOCA(contaminante, c) {
  const rangos = rangosIBOCA[contaminante];
  if (!rangos || c == null || Number.isNaN(c)) return null;
  for (const r of rangos) {
    if (c >= r.cMin && c <= r.cMax) {
      return ((r.iMax - r.iMin) / (r.cMax - r.cMin)) * (c - r.cMin) + r.iMin;
    }
  }
  const r = rangos[rangos.length - 1];
  if (c > r.cMax) return r.iMax;
  return null;
}

// ==========================
// Cálculos de ventanas
// ==========================
function mediaMovil(valuesOrdenados, N) {
  const res = new Map();
  const times = Array.from(valuesOrdenados.keys()).sort();
  const window = [];
  let sum = 0;

  for (const t of times) {
    const v = valuesOrdenados.get(t);
    window.push({ t, v });
    sum += v;

    while (window.length > N) {
      const x = window.shift();
      sum -= x.v;
    }
    if (window.length === N) {
      const endTime = t;
      res.set(endTime, sum / N);
    } else {
      res.set(t, null);
    }
  }
  return res;
}

function nowCast12(valuesOrdenados) {
  const res = new Map();
  const times = Array.from(valuesOrdenados.keys()).sort();

  function calcAlpha(slice) {
    const max = Math.max(...slice);
    const min = Math.min(...slice);
    let w = 1 - (max - min) / Math.max(max, 1e-9);
    if (w < 0.5) w = 0.5;
    if (w > 1) w = 1;
    return w;
  }

  const queue = [];
  for (const t of times) {
    const v = valuesOrdenados.get(t);
    queue.push({ t, v });

    while (queue.length > 12) queue.shift();

    if (queue.length < 3) {
      res.set(t, null);
      continue;
    }

    const slice = queue.map(x => x.v);
    const alpha = calcAlpha(slice);
    let num = 0, den = 0;
    for (let k = 0; k < slice.length; k++) {
      const w = Math.pow(alpha, k);
      num += slice[slice.length - 1 - k] * w;
      den += w;
    }
    res.set(t, num / den);
  }
  return res;
}

// ==========================
// Construcción de series
// ==========================
function construirSeriesPorMes(datosMes) {
  const porCont = {};
  contaminantes.forEach(c => porCont[c] = new Map());

  datosMes.forEach(d => {
    porCont[d.contaminante].set(d.fecha_hora, d.valor);
  });

  const todasLasHoras = Array.from(
    new Set(datosMes.map(d => d.fecha_hora))
  ).sort();

  const original = {};
  contaminantes.forEach(c => {
    original[c] = todasLasHoras.map(ts => porCont[c].has(ts) ? porCont[c].get(ts) : null);
  });

  const serieIBOCA = {};
  contaminantes.forEach(c => serieIBOCA[c] = new Array(todasLasHoras.length).fill(null));

  const O3_8 = mediaMovil(porCont["O3"], 8);
  const CO_8 = mediaMovil(porCont["CO"], 8);
  const PM25_NC = nowCast12(porCont["PM2.5"]);
  const PM10_NC = nowCast12(porCont["PM10"]);

  todasLasHoras.forEach((ts, i) => {
    const vNO2 = porCont["NO2"].get(ts);
    const vSO2 = porCont["SO2"].get(ts);
    const vO3 = O3_8.get(ts);
    const vCO = CO_8.get(ts);
    const vPM25 = PM25_NC.get(ts);
    const vPM10 = PM10_NC.get(ts);

    serieIBOCA["NO2"][i]  = vNO2 != null ? interpolarIBOCA("NO2",  vNO2)  : null;
    serieIBOCA["SO2"][i]  = vSO2 != null ? interpolarIBOCA("SO2",  vSO2)  : null;
    serieIBOCA["O3"][i]   = vO3  != null ? interpolarIBOCA("O3",   vO3)   : null;
    serieIBOCA["CO"][i]   = vCO  != null ? interpolarIBOCA("CO",   vCO)   : null;
    serieIBOCA["PM2.5"][i]= vPM25!= null ? interpolarIBOCA("PM2.5",vPM25) : null;
    serieIBOCA["PM10"][i] = vPM10!= null ? interpolarIBOCA("PM10", vPM10) : null;
  });

  return {
    etiquetas: todasLasHoras,
    original,
    iboca: serieIBOCA
  };
}

// ==========================
// Generar etiquetas y líneas verticales
// ==========================
function generarEtiquetasYLineas(etiquetasHorarias, mesSeleccionado) {
  const [year, month] = mesSeleccionado.split('-').map(Number);
  const diasEnMes = new Date(year, month, 0).getDate(); // 28, 29, 30, 31

  const labels = Array(etiquetasHorarias.length).fill(''); // vacío por defecto
  const annotations = {};

  const fechaToIndex = new Map();
  etiquetasHorarias.forEach((ts, idx) => {
    const fecha = ts.split('T')[0]; // YYYY-MM-DD
    if (!fechaToIndex.has(fecha)) {
      fechaToIndex.set(fecha, idx);
    }
  });

  // Etiqueta una vez por día (formato DD-MM-AAAA)
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaStr = `${year}-${String(month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const idx = fechaToIndex.get(fechaStr);
    if (idx !== undefined) {
      const [y, m, d] = fechaStr.split('-');
      labels[idx] = `${d}-${m}-${y}`; // DD-MM-AAAA
    }
  }

  // Línea al final de cada día (última hora disponible o 23:59)
  for (let dia = 1; dia < diasEnMes; dia++) {
    const fechaDia = `${year}-${String(month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const fechaSiguiente = `${year}-${String(month).padStart(2, '0')}-${String(dia + 1).padStart(2, '0')}`;

    // Buscar el último índice del día actual
    const indicesDia = etiquetasHorarias
      .map((ts, i) => ({ ts, i }))
      .filter(item => item.ts.startsWith(fechaDia))
      .map(item => item.i);

    if (indicesDia.length > 0) {
      const ultimoIdxDia = Math.max(...indicesDia);
      annotations[`linea_${dia}`] = {
        type: 'line',
        xMin: ultimoIdxDia,
        xMax: ultimoIdxDia,
        borderColor: 'rgba(100, 100, 100, 0.4)',
        borderWidth: 1.2
        // Sin etiqueta
      };
    }
  }

  return { labels, annotations };
}

// ==========================
// Gráficas
// ==========================
function graficarIBOCA(idCanvas, etiquetas, datos, mesSeleccionado) {
  if (charts[idCanvas]) charts[idCanvas].destroy();

  const { labels, annotations } = generarEtiquetasYLineas(etiquetas, mesSeleccionado);

  const chart = new Chart(document.getElementById(idCanvas), {
    type: 'line',
    data: {
      labels: labels,
      datasets: contaminantes.map(c => ({
        label: c,
        data: datos[c],
        borderColor: colores[c],
        borderWidth: 2,
        pointRadius: 1.8,
        fill: false,
        tension: 0.3,
        spanGaps: true
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: function(context) {
              const dataIndex = context.dataIndex;
              const dataset = context.dataset;
              const valor = context.formattedValue;
              const timestamp = chart.data.originalLabels[dataIndex]; // ← Accede al timestamp real

              if (!timestamp) return `${dataset.label}: ${valor}`;

              const [fecha, horaFull] = timestamp.split('T');
              const hora = horaFull ? horaFull.slice(0, 5) : '00:00'; // HH:MM

              return [
                `${dataset.label}: ${valor}`,
                `Fecha: ${fecha}`,
                `Hora: ${hora}`
              ];
            }
          }
        },
        annotation: {
          annotations: {
            ...annotations,
            verde: {
              type: "box",
              yMin: 0, yMax: 50,
              backgroundColor: "rgba(0, 128, 0, 0.1)",
              borderColor: "green", borderWidth: 1,
              label: { content: "Bajo", enabled: true, position: "end" }
            },
            amarillo: {
              type: "box",
              yMin: 51, yMax: 100,
              backgroundColor: "rgba(255, 255, 0, 0.1)",
              borderColor: "gold", borderWidth: 1,
              label: { content: "Moderado", enabled: true, position: "end" }
            },
            naranja: {
              type: "box",
              yMin: 101, yMax: 150,
              backgroundColor: "rgba(255, 165, 0, 0.1)",
              borderColor: "orange", borderWidth: 1,
              label: { content: "Regular", enabled: true, position: "end" }
            },
            rojo: {
              type: "box",
              yMin: 151, yMax: 200,
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              borderColor: "red", borderWidth: 1,
              label: { content: "Alto", enabled: true, position: "end" }
            },
            morado: {
              type: "box",
              yMin: 201, yMax: 230,
              backgroundColor: "rgba(128, 0, 128, 0.1)",
              borderColor: "purple", borderWidth: 1,
              label: { content: "Peligroso", enabled: true, position: "end" }
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 230,
          title: { display: true, text: "Concentración normalizada al índice IBOCA" }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: false
          }
        }
      }
    },
    plugins: [Chart.registry.getPlugin("annotation")]
  });

  // ✅ Guardar los timestamps originales para el tooltip
  chart.data.originalLabels = etiquetas;
  charts[idCanvas] = chart;
}

function graficarOriginal(idCanvas, etiquetas, datos, mesSeleccionado) {
  if (charts[idCanvas]) charts[idCanvas].destroy();

  const { labels, annotations } = generarEtiquetasYLineas(etiquetas, mesSeleccionado);

  const chart = new Chart(document.getElementById(idCanvas), {
    type: 'line',
    data: {
      labels: labels,
      datasets: contaminantes.map(c => ({
        label: c,
        data: datos[c],
        borderColor: colores[c],
        borderWidth: 2,
        pointRadius: 1.8,
        fill: false,
        tension: 0.3,
        spanGaps: true
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: function(context) {
              const dataIndex = context.dataIndex;
              const dataset = context.dataset;
              const valor = context.formattedValue;
              const timestamp = chart.data.originalLabels[dataIndex]; // ← Timestamp real

              if (!timestamp) return `${dataset.label}: ${valor} µg/m³`;

              const [fecha, horaFull] = timestamp.split('T');
              const hora = horaFull ? horaFull.slice(0, 5) : '00:00'; // HH:MM

              return [
                `${dataset.label}: ${valor} µg/m³`,
                `Fecha: ${fecha}`,
                `Hora: ${hora}`
              ];
            }
          }
        },
        annotation: {
          annotations: annotations
        }
      },
      scales: {
        y: { title: { display: true, text: "Concentración (µg/m³)" } },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: false
          }
        }
      }
    },
    plugins: [Chart.registry.getPlugin("annotation")]
  });

  // ✅ Guardar timestamps originales
  chart.data.originalLabels = etiquetas;
  charts[idCanvas] = chart;
}

// ==========================
// Actualizar por selección
// ==========================
function actualizarGraficas(mesSeleccionado) {
  const datosMes = datosUsme.filter(d => d.fecha === mesSeleccionado);
  const { etiquetas, original, iboca } = construirSeriesPorMes(datosMes);

  graficarIBOCA("graficoIBOCA", etiquetas, iboca, mesSeleccionado);
  graficarOriginal("graficoOriginal", etiquetas, original, mesSeleccionado);

  let analIBOCA = `Mes: ${mesSeleccionado}\n\n`;
  let analOrig  = `Mes: ${mesSeleccionado}\n\n`;

    contaminantes.forEach(c => {
  const nombreLargo = nombresLargos[c] || c;

  const statsI = calcularEstadisticas(iboca[c]);
  analIBOCA += `${nombreLargo}\n  - Máximo: ${statsI.max.toFixed(2)}\n  - Mínimo: ${statsI.min.toFixed(2)}\n  - Promedio: ${statsI.promedio.toFixed(2)}\n  - Desviación: ${statsI.desviacion.toFixed(2)}\n\n`;

  const statsO = calcularEstadisticas(original[c]);
  analOrig += `${nombreLargo}\n  - Máximo: ${statsO.max.toFixed(2)} µg/m³\n  - Mínimo: ${statsO.min.toFixed(2)} µg/m³\n  - Promedio: ${statsO.promedio.toFixed(2)} µg/m³\n  - Desviación: ${statsO.desviacion.toFixed(2)}\n\n`;
});

  document.getElementById("analisisIBOCA").value = analIBOCA.trim();
  document.getElementById("analisisOriginal").value = analOrig.trim();
}

// ==========================
// Cargar datos históricos
// ==========================
fetch("./historico_estaciones.geojson")
  .then(res => res.json())
  .then(data => {
    datosUsme = data.features
      .filter(f => f.properties.estacion === "Usme")
      .map(f => ({
        fecha_hora: f.properties.fecha_hora,
        fecha: f.properties.fecha_hora.substring(0, 7),
        contaminante: f.properties.contaminante,
        valor: parseFloat(f.properties.valor)
      }));

    datosUsme.sort((a, b) => (a.fecha_hora < b.fecha_hora ? -1 : 1));

    const mesesDisponibles = [...new Set(datosUsme.map(d => d.fecha))].sort();
    const selector = document.getElementById("selectorFecha");
    mesesDisponibles.forEach(m => {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = m;
      selector.appendChild(option);
    });

    selector.addEventListener("change", () => actualizarGraficas(selector.value));

    if (mesesDisponibles.length > 0) {
      actualizarGraficas(mesesDisponibles[0]);
    }
  });
  
  // --- Sección colapsable IBOCA ---
const tituloIbo = document.getElementById("titulo-iboca");
const contenidoIbo = document.getElementById("contenido-iboca");

tituloIbo.addEventListener("click", () => {
  contenidoIbo.classList.toggle("activo");

  if (contenidoIbo.classList.contains("activo")) {
    tituloIbo.innerHTML = "¿Cómo interpreto el IBOCA? ⬆️";
  } else {
    tituloIbo.innerHTML = "¿Cómo interpreto el IBOCA? ⬇️";
  }
});
