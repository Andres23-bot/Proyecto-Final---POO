// Inicializar mapa centrado en Bogotá
var map = L.map('map').setView([4.55, -74.1], 15);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Estilo del polígono
var estiloBarrio = {
    color: "#0056b3",
    weight: 3,
    opacity: 0.8,
    fillColor: "#3399ff",
    fillOpacity: 0.3
};

// Cargar el GeoJSON local
fetch("./Marichuela_utf8.geojson")
  .then(response => response.json())
  .then(data => {
      var barrioLayer = L.geoJSON(data, {style: estiloBarrio}).addTo(map);
      map.fitBounds(barrioLayer.getBounds());
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