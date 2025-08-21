// Crear mapa
var map = L.map('map').setView([4.52, -74.11], 15);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);



// Diccionario de descripciones con formato HTML
let descripciones = {
  "VALLES DE CAFÉ": `
    <strong>Tipo de parque:</strong> Vecinal<br>
    <strong>Ubicación:</strong> Calle 92 Sur con Carrera 14<br>
    <strong>Administración:</strong> IDRD<br>
    <strong>Estado de certificación:</strong> Certificado<br>
    <strong>Área aproximada:</strong> 1,800 m²<br><br>
    Un parque vecinal con espacios para recreación y zonas verdes. Ideal para familias, niños y actividades al aire libre. Muy frecuentado por residentes de Valles de Cafam.
  `,
  "URBANIZACION MARICHUELA": `
    <strong>Tipo de parque:</strong> Vecinal<br>
    <strong>Ubicación:</strong> Calle 81B Sur con Carrera 14F<br>
    <strong>Administración:</strong> Sin dato<br>
    <strong>Estado de certificación:</strong> Certificado<br>
    <strong>Área aproximada:</strong> 2,900 m²<br><br>
    Espacio público de encuentro para la comunidad, cercano a instituciones educativas y viviendas. Cuenta con áreas verdes y juegos para niños.
  `,
  "DESARROLLO EL BOSQUE": `
    <strong>Tipo de parque:</strong> Zonal<br>
    <strong>Ubicación:</strong> Calle 80 Sur con Carrera 14Q<br>
    <strong>Administración:</strong> Sin dato<br>
    <strong>Estado de certificación:</strong> Certificado<br>
    <strong>Área aproximada:</strong> 3,500 m²<br><br>
    Parque zonal rodeado de zonas residenciales. Brinda espacios para deporte, caminata y eventos comunitarios.
  `
};

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

// Función para mostrar información con botón de cierre
function mostrarInfo(props) {
  let panel = document.getElementById("info-panel");
  let nombre = props.NOMBRE_PAR || "Parque sin nombre";
  let foto = fotos[nombre] || "img/default.jpg";
  let descripcion = descripciones[nombre] || "Descripción no disponible.";

  panel.classList.add("active");
  panel.innerHTML = `
    <button class="close-btn" onclick="cerrarPanel()">×</button>
    <h2>${nombre}</h2>
    <img src="${foto}" alt="Foto del parque">
    <p>${descripcion}</p>
  `;

  // Ajuste del mapa después de mostrar panel
  setTimeout(() => {
    map.invalidateSize();
  }, 310);
}

// Función para cerrar el panel lateral
function cerrarPanel() {
  let panel = document.getElementById("info-panel");
  panel.classList.remove("active");
  panel.innerHTML = '';
}


