// Crear mapa
var map = L.map('map').setView([4.52, -74.11], 15);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Cargar GeoJSON
fetch('./parques-marichuela-4326.geojson')
  .then(res => res.json())
  .then(data => {
    var parques = L.geoJSON(data, {
      style: {
        color: "green",
        weight: 2,
        fillColor: "lightgreen",
        fillOpacity: 0.5
      },
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          mostrarInfo(feature.properties);
        });
      }
    }).addTo(map);

    map.fitBounds(parques.getBounds());
  });

// Función para mostrar info en el panel
function mostrarInfo(props) {
  let panel = document.getElementById("info");

  // Diccionario de fotos
  let fotos = {
    "VALLES DE CAFÉ": "img/valles.jpg",
    "URBANIZACION MARICHUELA": "img/marichuela.jpg",
    "DESARROLLO EL BOSQUE": "img/bosque.jpg"
  };

  // Diccionario de descripciones
  let descripciones = {
    "VALLES DE CAFÉ": "Un parque vecinal con espacios para recreación y zonas verdes.",
    "URBANIZACION MARICHUELA": "Espacio público de encuentro para la comunidad.",
    "DESARROLLO EL BOSQUE": "Parque zonal rodeado de zonas residenciales."
  };

  panel.innerHTML = `
    <h2>${props.NOMBRE_PAR || "Parque sin nombre"}</h2>
    <img src="${fotos[props.NOMBRE_PAR] || 'img/default.jpg'}" alt="Foto del parque">
    <p>${descripciones[props.NOMBRE_PAR] || "Descripción no disponible."}</p>
  `;
}
