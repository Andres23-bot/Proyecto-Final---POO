// Crear el mapa
var map = L.map('map').setView([4.55, -74.1], 15);

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
                color: 'black',     // Borde azul
                weight: 2,
                fillOpacity: 0     // Relleno transparente
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
        var capaVias = L.geoJSON(data, {
            style: function (feature) {
                var tipo = feature.properties.highway || "otros";
                var grosor = 2;
                var color = "gray"; // color por defecto

                switch (tipo) {
                    case "Principal": 
                        grosor = 6; color = "red"; break;
                    case "Primaria": 
                        grosor = 5; color = "orange"; break;
                    case "Secundaria": 
                        grosor = 4; color = "yellow"; break;
                    case "Terciaria": 
                        grosor = 3; color = "green"; break;
                    case "Residencial": 
                        grosor = 2; color = "blue"; break;
                    case "footway": 
                        grosor = 1; color = "brown"; break;
                    default: 
                        grosor = 2; color = "gray";
                }

                return {
                    color: color,
                    weight: grosor
                };
            },
            onEachFeature: function (feature, layer) {
                var nombre = feature.properties.name || "Vía sin nombre";
                var tipo = feature.properties.highway || "desconocido";

                // Popup en cian
                layer.bindPopup(
                    `<div style="color: black;">
                        <b>${nombre}</b><br>
                        Tipo: ${tipo}
                    </div>`
                );
            }
        }).addTo(map);

        // === Calcular intersecciones entre vías ===
        var features = data.features;
        for (var i = 0; i < features.length; i++) {
            for (var j = i + 1; j < features.length; j++) {
                var linea1 = turf.lineString(features[i].geometry.coordinates);
                var linea2 = turf.lineString(features[j].geometry.coordinates);
                var inter = turf.lineIntersect(linea1, linea2);

                if (inter.features.length > 0) {
                    inter.features.forEach(function (punto) {
                        var coords = punto.geometry.coordinates;
                        var nombre1 = features[i].properties.name || "Vía " + (i + 1);
                        var nombre2 = features[j].properties.name || "Vía " + (j + 1);

                        // Dibujar puntico en la intersección
                        L.circleMarker([coords[1], coords[0]], {
                            radius: 1,
                            color: "black",
                            fillColor: "yellow",
                            fillOpacity: 0.8
                        }).addTo(map)
                          .bindPopup(`<b style="color:black;">Intersección:</b><br>${nombre1} y ${nombre2}`);
                    });
                }
            }
        }
    })
    .catch(error => console.error('Error al cargar el GeoJSON de vías:', error));
    
    // 📌 Agregar leyenda manual
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
    <h3>Leyenda</h3>
    <div class="legend-item"><div class="legend-color" style="background:red"></div>Troncal</div>
    <div class="legend-item"><div class="legend-color" style="background:orange"></div>Principal</div>
    <div class="legend-item"><div class="legend-color" style="background:blue"></div>Secundaria</div>
    <div class="legend-item"><div class="legend-color" style="background:green"></div>Terciaria</div>
    <div class="legend-item"><div class="legend-color" style="background:purple"></div>Peatonal</div>
    <div class="legend-item"><div class="legend-color" style="background:gray"></div>Otros</div>
  `;
  return div;
};

legend.addTo(map);
