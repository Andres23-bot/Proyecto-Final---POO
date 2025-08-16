// --- Inicialización del mapa ---
const mapa = L.map('mapa').setView([4.5182789301826265, -74.11642401003672], 15); // Bogotá

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(mapa);

// --- Icono personalizado desde URL ---
const iconoEstacion = L.icon({
  iconUrl: './Imagenes-andres/air-station.png',
  iconSize: [60, 60], // tamaño del ícono
  iconAnchor: [20, 40], // punto del icono que corresponde a la coordenada
  popupAnchor: [0, -40] // posición del popup respecto al icono
});

// Marcador de subestación fijo con ícono
const marcador = L.marker([4.531206, -74.111714], { icon: iconoEstacion }).addTo(mapa)
  .bindPopup(`
    <div style="text-align:center;">
      <h4>📡 Estación de Monitoreo de la calidad del aire</h4>
      <img src='./Imagenes-andres/estaciones-monitoreo.jpg' 
           alt="Estación Usme" 
           width="300" height="150" />
      <p>Estación de Usme</p>
    </div>
  `);


// Cargar polígono de barrio
fetch("./Limite_barrio_Marichuela.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "red", weight: 2, fillOpacity: 0.1 }
    }).addTo(mapa);
  });

// --- Cargar datos históricos ---
fetch("./historico_estaciones.geojson")
  .then(res => res.json())
  .then(data => {
    const fechas = [];
    const co = [];
    const o3 = [];

    data.features.forEach(f => {
      const { fecha_hora, contaminante, valor } = f.properties;

      // Guardar fechas de forma ordenada
      if (!fechas.includes(fecha_hora)) {
        fechas.push(fecha_hora);
      }

      // Guardar valores según contaminante
      if (contaminante === "CO") {
        co.push(parseFloat(valor));
      } else if (contaminante === "O3") {
        o3.push(parseFloat(valor));
      }
    });

    // --- Graficar CO ---
    new Chart(document.getElementById("graficoCO"), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Monóxido de carbono CO (ppm)',
          data: co,
          borderColor: 'blue',
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });

    // --- Graficar O3 ---
    new Chart(document.getElementById("graficoO3"), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Ozono O3 (µg/m³)',
          data: o3,
          borderColor: 'green',
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });

    // --- Análisis Estadístico ---
    function calcularEstadisticas(arr) {
      if (arr.length === 0) return { max: 0, min: 0, promedio: 0, desviacion: 0 };
      const max = Math.max(...arr);
      const min = Math.min(...arr);
      const promedio = arr.reduce((a, b) => a + b, 0) / arr.length;
      const desviacion = Math.sqrt(arr.map(x => Math.pow(x - promedio, 2)).reduce((a, b) => a + b, 0) / arr.length);
      return { max, min, promedio, desviacion };
    }

    const coStats = calcularEstadisticas(co);
    const o3Stats = calcularEstadisticas(o3);

    document.getElementById("analisis").value =
      "📊 Tendencias y Estadísticas\n\n" +
      "CO:\n" +
      `  - Máximo: ${coStats.max}\n` +
      `  - Mínimo: ${coStats.min}\n` +
      `  - Promedio: ${coStats.promedio.toFixed(2)}\n` +
      `  - Desviación: ${coStats.desviacion.toFixed(2)}\n\n` +
      "O3:\n" +
      `  - Máximo: ${o3Stats.max}\n` +
      `  - Mínimo: ${o3Stats.min}\n` +
      `  - Promedio: ${o3Stats.promedio.toFixed(2)}\n` +
      `  - Desviación: ${o3Stats.desviacion.toFixed(2)}\n`;
  });

