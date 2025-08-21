// Inicializar mapa
var map = L.map("map").setView([4.509172124007914, -74.11865314878686], 17);

// Capa base
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

// Diccionario de fotos y descripciones
var parqueInfo = {
  "VALLES DE CAFAM": {
    foto: "imagenes/valles_cafam.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Zonal<br>
      <strong>Ubicación:</strong> Diagonal 92A Sur con Carrera 14I, localidad de Usme<br>
      <strong>Administración:</strong> IDRD<br>
      <strong>Estado de certificación:</strong> Certificado<br>
      <strong>Área aproximada:</strong> 12,288 m²<br><br>
      Este parque zonal se encuentra en medio del conjunto residencial Valles de Cafam, en el límite occidental del barrio Marichuela. Es un espacio amplio que ofrece zonas verdes, senderos peatonales, mobiliario urbano y áreas recreativas.
    `,
  },
  "LA MARICHUELA III SECTOR (CAFAM II SECTOR)": {
    foto: "imagenes/cafam 2.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Vecinal<br>
      <strong>Ubicación:</strong> Cerca de la Diagonal 92A Sur con Carrera 14M<br>
      <strong>Administración:</strong> Sin dato<br>
      <strong>Estado de certificación:</strong> Certificado<br>
      <strong>Área aproximada:</strong> 1,407 m²<br><br>
      Ubicado dentro del sector residencial CAFAM II, este parque vecinal brinda espacios recreativos a los habitantes.
    `,
  },
  "SAN MARCOS": {
    foto: "imagenes/san_marcos.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Vecinal<br>
      <strong>Ubicación:</strong> Sector suroriental de Marichuela, cerca de la Avenida Caracas<br>
      <strong>Administración:</strong> Sin dato<br>
      <strong>Estado de certificación:</strong> Sin certificar<br>
      <strong>Área aproximada:</strong> 2,791 m²<br><br>
      Este parque aún no se encuentra certificado, lo cual puede influir en la provisión de servicios por parte del distrito.
    `,
  },
  "MARICHUELA I ETAPA": {
    foto: "imagenes/urbanizacion.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Vecinal<br>
      <strong>Ubicación:</strong> Entre la Calle 75A Sur y la Carrera 14C, barrio Marichuela<br>
      <strong>Administración:</strong> Sin dato<br>
      <strong>Estado de certificación:</strong> Certificado<br>
      <strong>Área aproximada:</strong> 2,918 m²<br><br>
      Este parque está inmerso en el corazón del barrio Marichuela I Etapa.
    `,
  },
  "MARICHUELA - COLEGIO MIGUEL DE CERVANTES SAAVEDRA": {
    foto: "imagenes/marichuela_cancha.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Vecinal<br>
      <strong>Ubicación:</strong> Aledaño al IED Miguel de Cervantes Saavedra, Calle 76B Sur con Carrera 14B<br>
      <strong>Administración:</strong> Sin dato<br>
      <strong>Estado de certificación:</strong> Certificado<br>
      <strong>Área aproximada:</strong> 4,002 m²<br><br>
      Este parque vecinal se encuentra junto a la institución educativa.
    `,
  },
  "LA MARICHUELA - LAS PARABOLICAS": {
    foto: "imagenes/marichuela2.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Vecinal<br>
      <strong>Ubicación:</strong> Carrera 14Q con Calle 91 Sur (aproximadamente)<br>
      <strong>Administración:</strong> Sin dato<br>
      <strong>Estado de certificación:</strong> Certificado<br>
      <strong>Área aproximada:</strong> 2,951 m²<br><br>
      Este parque recibe su nombre por estar ubicado en la zona conocida como “Las Parabólicas”.
    `,
  },
  "MARICHUELA - PARROQUIA MANSIÓN DE PAZ": {
    foto: "imagenes/marichuela_parque.jpg",
    desc: `
      <strong>Tipo de parque:</strong> Vecinal<br>
      <strong>Ubicación:</strong> Calle 81B Sur con Carrera 14F, junto a la Parroquia Mansión de Paz<br>
      <strong>Administración:</strong> Sin dato<br>
      <strong>Estado de certificación:</strong> Certificado<br>
      <strong>Área aproximada:</strong> 1,795 m²<br><br>
      Parque vecinal ubicado junto a la parroquia Mansión de Paz.
    `,
  },
};

// Función para cerrar panel
function cerrarPanel() {
  var panel = document.getElementById("info-panel");
  panel.classList.remove("active");
  panel.innerHTML = "";
  map.invalidateSize();
}

// Cargar GeoJSON y agregar interactividad
fetch("parques1.geojson")
  .then((res) => res.json())
  .then((data) => {
    L.geoJSON(data, {
      style: { color: "green", weight: 2 },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          var nombre = feature.properties.NOMBRE_PAR;
          var info =
            parqueInfo[nombre] || {
              foto: "default.jpg",
              desc: "Sin descripción disponible.",
            };

          // Mostrar info en panel
          var panel = document.getElementById("info-panel");
          panel.classList.add("active");
          panel.innerHTML = `
            <button class="close-btn" onclick="cerrarPanel()">×</button>
            <h2>${nombre}</h2>
            <img src="${info.foto}" alt="${nombre}" />
            <p>${info.desc}</p>
          `;

          // Centrar mapa en el polígono
          map.fitBounds(layer.getBounds(), { padding: [50, 50] });

          // Ajustar mapa tras abrir panel
          setTimeout(() => {
            map.invalidateSize();
          }, 310);
        });
      },
    }).addTo(map);
  });
