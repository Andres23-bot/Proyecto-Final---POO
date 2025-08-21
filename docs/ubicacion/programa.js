// =====================
// Inicializar mapa en Bogotá
// =====================
var map = L.map('map').setView([4.65, -74.1], 11); // Bogotá inicial (zoom lejano)

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Coordenadas de referencia
var bogota = [4.65, -74.1];   // Centro Bogotá
var usme = [4.54, -74.1];     // Aproximado Usme

// Estilo del polígono
var estiloBarrio = {
    color: "#0056b3",
    weight: 3,
    opacity: 0.8,
    fillColor: "#3399ff",
    fillOpacity: 0.3
};

// =====================
// Cargar el GeoJSON local
// =====================
fetch("./Marichuela_utf8.geojson")
  .then(response => response.json())
  .then(data => {
      var barrioLayer = L.geoJSON(data, {style: estiloBarrio}).addTo(map);

      // Calcular centro del polígono
      var centroBarrio = barrioLayer.getBounds().getCenter();

      // Animación de vuelos
      setTimeout(() => {
          map.flyTo(usme, 13, {duration: 4}); // Bogotá → Usme
      }, 3000);

      setTimeout(() => {
          map.flyTo(centroBarrio, 16, {duration: 4}); // Usme → Marichuela
      }, 7000);

      setTimeout(() => {
          map.fitBounds(barrioLayer.getBounds(), {padding: [20, 20]}); // Ajustar al polígono
      }, 11000);
  })
  .catch(error => console.error("Error cargando el GeoJSON:", error));


// =====================
// Lógica del carrusel
// =====================
let indice = 0;
const imagenes = document.querySelectorAll(".carrusel-imagen");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

function mostrarImagen(i) {
    imagenes.forEach(img => img.classList.remove("activa"));
    imagenes[i].classList.add("activa");
}

prev.addEventListener("click", () => {
    indice = (indice - 1 + imagenes.length) % imagenes.length;
    mostrarImagen(indice);
});

next.addEventListener("click", () => {
    indice = (indice + 1) % imagenes.length;
    mostrarImagen(indice);
});

// Mostrar la primera al inicio
mostrarImagen(indice);
