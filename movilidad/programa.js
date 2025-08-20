// Crear el mapa
let map = L.map('map').setView([4.5387, -74.1272], 15);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Cargar polígono del barrio
fetch('./Marichuela_utf8.geojson')
    .then(response => response.json())
    .then(data => {
        var capaPoligono = L.geoJSON(data, {
            style: {
                color: 'blue',
                weight: 2,
                fillColor: 'cyan',
                fillOpacity: 0.3
            }
        }).addTo(map);

        // Ajustar vista al polígono
        map.fitBounds(capaPoligono.getBounds());
    })
    .catch(error => console.error('Error al cargar el GeoJSON de Marichuela:', error));
// Cargar rutas SITP
fetch('rutasSITP_marichuela.geojson')
.then(res => res.json())
.then(data => {
    L.geoJSON(data, {
        style: {
            color: 'red',
            weight: 2
        }
    }).addTo(map);
});

// Cargar paraderos SITP
   document.addEventListener('DOMContentLoaded', function () {
       // Tu código aquí
       fetch('./paraderos_marichuela.geojson')
       .then(res => res.json())
       .then(data => {
           L.geoJSON(data, {
               pointToLayer: function (feature, latlng) {
                   return L.marker(latlng);
               },
               onEachFeature: function (feature, layer) {
                   layer.on('click', function () {
    let panel = document.getElementById('infoPanel'); // Cambiado a 'infoPanel'
    if (panel) { // Verifica que el panel exista
        panel.innerHTML = `
            <h3>Detalles del paradero</h3>
            <p><b>Nombre:</b> ${feature.properties.nombre_par}</p>
            <p><b>Código:</b> ${feature.properties.cenefa_par}</p>
            <p><b>Dirección:</b> ${feature.properties.direccion_}</p>
            <p><b>Rutas:</b> ${feature.properties.rutas}</p>
            <img src="${feature.properties.foto}" alt="Imagen del paradero" style="max-width: 100%; height: auto;" />
        `;
    } else {
        console.error('El panel de información no se encontró.');
    }
});
               }
           }).addTo(map);
       });
   });