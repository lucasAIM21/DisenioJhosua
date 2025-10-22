

async function mostrarMenu() {
  try{
    const response = await fetch(`${API_URL}/api/Productos`);
    const comidas = await response.json();

    const contenedor = document.getElementById("contenedor-menu");
    contenedor.innerHTML = "";

    comidas.forEach((comida) => {
      const tarjeta = document.createElement("div");
      tarjeta.classList.add("tarjeta");
      tarjeta.style.position = "relative";

      tarjeta.innerHTML = `
        <img src="${API_URL}${comida.imagen}" alt="${comida.nombre}">
        <h2>${comida.nombre}</h2>
        <p>${comida.descripcion}</p>
        <p><strong>S/ ${comida.precio}</strong></p>
        <p>Disponibles: ${comida.cantidad}</p>
      `;

      contenedor.appendChild(tarjeta);
    });

  }catch(error){
    console.error("Error al cargar datos: ",error);
  }
}