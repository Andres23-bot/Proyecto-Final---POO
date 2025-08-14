// Crear el mapa
var map = L.map('map');

// Capa base (OSM)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// ===== 1. Cargar polígono de Marichuela =====
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

// ===== 2. Cargar vías =====
fetch('./vias_bogota_marichuela.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: 'orange',
                weight: 2
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el GeoJSON de vías:', error));

// ===== 3. Cargar paraderos SITP como marcadores =====
fetch('./paraderos_marichuela.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
               pointToLayer: function (feature, latlng) {
                let nombre = feature.properties.cenefa_par || 'Paradero SITP';
                let foto = feature.properties.foto 
                           ? `<br><img src="${feature.properties.foto}" alt="${nombre}" width="200px">`
                           : '';
                return L.marker(latlng)
                    .bindPopup(`<b>${nombre}</b>${foto}`);
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el GeoJSON de paraderos:', error));
