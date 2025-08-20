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
    // Definir iconos personalizados
const iconos = {
    "EDUC": L.icon({
        iconUrl: './imagenes/edu.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28]
    }),
    "DEP-REC": L.icon({
        iconUrl: './imagenes/dec-rec.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28]
    }),
    "BIBL": L.icon({
        iconUrl: './imagenes/BIBL.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28]
    }),
    "IGLE": L.icon({
        iconUrl: './imagenes/IGLE.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28]
    }),
    "SEG-JUS": L.icon({
        iconUrl: './imagenes/BOMB.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28]
    }),
    "default": L.icon({
        iconUrl: 'icons/default.png',
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -20]
    })
};

// Cargar sitios de interés
document.addEventListener('DOMContentLoaded', function () {
    fetch('./Sitios-Interes.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    let clasificacion = feature.properties.NGeClasifi;
                    let icono = iconos[clasificacion] || iconos["default"];
                    return L.marker(latlng, { icon: icono });
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function () {
                        let panel = document.getElementById('infoPanel');
                        if (panel) {
                            let fotos = feature.properties.fotos || []; // array de fotos
                            let fotosHtml = "";

                            if (fotos.length > 0) {
                                fotosHtml = `
                                    <div class="carousel">
                                        <img id="carousel-img" src="${fotos[0]}" style="max-width:100%; height:auto;" />
                                        <div class="carousel-controls">
                                            <button class="prev">◀</button>
                                            <button class="next">▶</button>
                                        </div>
                                    </div>
    `;

    // script inline para mover carrusel
                            setTimeout(() => {
                                let currentIndex = 0;
                                const img = document.getElementById('carousel-img');
                                const prev = document.querySelector('.carousel .prev');
                                const next = document.querySelector('.carousel .next');

                                prev.addEventListener('click', () => {
                                    currentIndex = (currentIndex - 1 + fotos.length) % fotos.length;
                                    img.src = fotos[currentIndex];
                                });

                                next.addEventListener('click', () => {
                                    currentIndex = (currentIndex + 1) % fotos.length;
                                    img.src = fotos[currentIndex];
                                });
                            }, 100);
                        }

                            panel.innerHTML = `
                                <h3>Detalles del lugar</h3>
                                <p><b>Nombre:</b> ${feature.properties.NGeNombre}</p>
                                <p><b>Clasificación:</b> ${feature.properties.NGeClasifi}</p>
                                <p><b>Fuente:</b> ${feature.properties.NGeFuente}</p>
                                ${fotosHtml}
                            `;
                        }
                    });
                }
            }).addTo(map);
        });
});
