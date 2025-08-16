// --- Inicialización del mapa ---
const mapa = L.map('mapa').setView([4.5182789301826265, -74.11642401003672], 15); // Bogotá

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(mapa);

// --- Icono personalizado ---
const iconoEstacion = L.icon({
  iconUrl: './Imagenes-andres/air-station.png',
  iconSize: [60, 60],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Marcador estación Usme
L.marker([4.531206, -74.111714], { icon: iconoEstacion }).addTo(mapa)
  .bindPopup(`
    <div style="text-align:center;">
      <h4>📡 Estación de Monitoreo de la calidad del aire</h4>
      <img src='./Imagenes-andres/estaciones-monitoreo.jpg'
           alt="Estación Usme"
           width="300" height="150" />
      <p>Estación de Usme</p>
    </div>
  `);

// --- Cargar polígono de barrio ---
fetch("./Limite_barrio_Marichuela.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, { style: { color: "red", weight: 2, fillOpacity: 0.1 } }).addTo(mapa);
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
  // fuera de última banda: extrapolación simple hacia el tope
  const r = rangos[rangos.length - 1];
  if (c > r.cMax) return r.iMax;
  return null;
}

// ==========================
// Cálculos de ventanas
// ==========================

// Media móvil simple de N horas (para O3 y CO, 8h)
function mediaMovil(valuesOrdenados, N) {
  const res = new Map(); // time -> avg
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
      const endTime = t; // etiqueta al final de la ventana
      res.set(endTime, sum / N);
    } else {
      res.set(t, null);
    }
  }
  return res; // Map con null hasta completar N
}

// NowCast 12 h (EPA): ponderación por variabilidad (PM2.5/PM10)
function nowCast12(valuesOrdenados) {
  const res = new Map();
  const times = Array.from(valuesOrdenados.keys()).sort();

  // helper para alpha y pesos
  function calcAlpha(slice) {
    const max = Math.max(...slice);
    const min = Math.min(...slice);
    let w = 1 - (max - min) / Math.max(max, 1e-9);
    if (w < 0.5) w = 0.5;
    if (w > 1) w = 1;
    return w;
  }

  const queue = []; // últimas 12 horas: [{t, v}]
  for (const t of times) {
    const v = valuesOrdenados.get(t);
    queue.push({ t, v });

    while (queue.length > 12) queue.shift();

    if (queue.length < 3) { // hasta que haya datos razonables
      res.set(t, null);
      continue;
    }

    const slice = queue.map(x => x.v);
    const alpha = calcAlpha(slice);
    // pesos decrecientes desde más reciente (k=0) a más antiguo (k=n-1)
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
  // Mapa por contaminante: time->valor horario (µg/m³)
  const porCont = {};
  contaminantes.forEach(c => porCont[c] = new Map());

  // llenar
  datosMes.forEach(d => {
    porCont[d.contaminante].set(d.fecha_hora, d.valor);
  });

  // etiquetas (todas las horas presentes en el mes)
  const todasLasHoras = Array.from(
    new Set(datosMes.map(d => d.fecha_hora))
  ).sort();

  // Series originales (µg/m³) alineadas a todasLasHoras
  const original = {};
  contaminantes.forEach(c => {
    original[c] = todasLasHoras.map(ts => porCont[c].has(ts) ? porCont[c].get(ts) : null);
  });

  // Series para índice (aplicando ventanas)
  const serieIBOCA = {};
  contaminantes.forEach(c => serieIBOCA[c] = new Array(todasLasHoras.length).fill(null));

  // Construir mapas de ventanas
  const O3_8 = mediaMovil(porCont["O3"], 8);
  const CO_8 = mediaMovil(porCont["CO"], 8);
  const PM25_NC = nowCast12(porCont["PM2.5"]);
  const PM10_NC = nowCast12(porCont["PM10"]);
  // NO2 y SO2: 1 h (valor directo)

  // Llenar serie IBOCA por etiqueta temporal
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
// Gráficas (dos charts)
// ==========================
function graficarIBOCA(idCanvas, etiquetas, datos) {
  if (charts[idCanvas]) charts[idCanvas].destroy();

  charts[idCanvas] = new Chart(document.getElementById(idCanvas), {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: contaminantes.map(c => ({
        label: c,
        data: datos[c],
        borderColor: colores[c],
        fill: false,
        tension: 0.3,
        spanGaps: true
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        annotation: {
          annotations: {
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
              yMin: 201, yMax: 220,
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
          max: 220,
          title: { display: true, text: "Índice IBOCA - Riesgo en Salud" }
        },
        x: { ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 10 } }
      }
    },
    plugins: [Chart.registry.getPlugin("annotation")]
  });
}

function graficarOriginal(idCanvas, etiquetas, datos) {
  if (charts[idCanvas]) charts[idCanvas].destroy();

  charts[idCanvas] = new Chart(document.getElementById(idCanvas), {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: contaminantes.map(c => ({
        label: c,
        data: datos[c],
        borderColor: colores[c],
        fill: false,
        tension: 0.3,
        spanGaps: true
      }))
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        y: { title: { display: true, text: "Concentración (µg/m³)" } },
        x: { ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 10 } }
      }
    }
  });
}

// ==========================
// Actualizar por selección
// ==========================
function actualizarGraficas(mesSeleccionado) {
  // Filtrar por mes (sin promediar)
  const datosMes = datosUsme.filter(d => d.fecha === mesSeleccionado);

  // Construir series por hora (y ventanas)
  const { etiquetas, original, iboca } = construirSeriesPorMes(datosMes);

  // Graficar
  graficarIBOCA("graficoIBOCA", etiquetas, iboca);
  graficarOriginal("graficoOriginal", etiquetas, original);

  // Análisis descriptivo por gráfica
  let analIBOCA = `Mes: ${mesSeleccionado}\n\n`;
  let analOrig  = `Mes: ${mesSeleccionado}\n\n`;

  contaminantes.forEach(c => {
    const statsI = calcularEstadisticas(iboca[c]);
    analIBOCA += `${c}\n  - Máximo: ${statsI.max.toFixed(2)}\n  - Mínimo: ${statsI.min.toFixed(2)}\n  - Promedio: ${statsI.promedio.toFixed(2)}\n  - Desviación: ${statsI.desviacion.toFixed(2)}\n\n`;

    const statsO = calcularEstadisticas(original[c]);
    analOrig += `${c}\n  - Máximo: ${statsO.max.toFixed(2)} µg/m³\n  - Mínimo: ${statsO.min.toFixed(2)} µg/m³\n  - Promedio: ${statsO.promedio.toFixed(2)} µg/m³\n  - Desviación: ${statsO.desviacion.toFixed(2)}\n\n`;
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
        fecha_hora: f.properties.fecha_hora,              // "YYYY-MM-DDTHH:mm:ss" o "YYYY-MM-DD HH:mm"
        fecha: f.properties.fecha_hora.substring(0, 7),   // "YYYY-MM"
        contaminante: f.properties.contaminante,
        valor: parseFloat(f.properties.valor)
      }));

    // Ordenar por tiempo por si acaso
    datosUsme.sort((a, b) => (a.fecha_hora < b.fecha_hora ? -1 : 1));

    // Poblar selector de meses
    const mesesDisponibles = [...new Set(datosUsme.map(d => d.fecha))].sort();
    const selector = document.getElementById("selectorFecha");
    mesesDisponibles.forEach(m => {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = m;
      selector.appendChild(option);
    });

    selector.addEventListener("change", () => actualizarGraficas(selector.value));

    // Inicializar con el primer mes
    if (mesesDisponibles.length > 0) {
      actualizarGraficas(mesesDisponibles[0]);
    }
  });
