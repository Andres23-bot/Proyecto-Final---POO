// Buscador funcional: filtra entre las páginas disponibles
document.getElementById('buscador').addEventListener('keyup', function(e) {
  const query = e.target.value.toLowerCase();

  // Mapeo de palabras clave a URLs
  const paginas = [
    { nombre: "ubicación", url: "ubicacion/ubicacion.html" },
    { nombre: "equipamientos", url: "equipamientos/equipamientos.html" },
    { nombre: "vías", url: "vias/vias.html" },
    { nombre: "movilidad", url: "movilidad/movilidad.html" },
    { nombre: "parques", url: "parques/parques.html" },
    { nombre: "catastro 3d", url: "catastro3d/catastro3d.html" },
    { nombre: "recorrido virtual", url: "recorrido_virtual/recorrido_virtual.html" },
    { nombre: "calidad del aire", url: "calidad_aire/calidad_aire.html" },
    { nombre: "sobre nosotros", url: "sobre_nosotros/sobre_nosotros.html" },
    { nombre: "nuestro proyecto", url: "nuestro_proyecto/nuestro_proyecto.html" }
  ];

  if (e.key === 'Enter' && query) {
    const match = paginas.find(p => p.nombre.includes(query));
    if (match) {
      window.location.href = match.url;
    } else {
      alert("No se encontró una página relacionada con: " + query);
    }
  }
});