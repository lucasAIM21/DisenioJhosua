const API_URL = "https://laimserver.duckdns.org";
    /*id: 1,
    nombre: "Lomo Saltado",
    descripcion: "Tiras de carne salteadas con cebolla, tomate y papas fritas.",
    precio: 25.0,
    cantidad: 10,
    imagen: "https://i.ytimg.com/vi/sWXRJbGi6yQ/maxresdefault.jpg"*/

let editandoId = null;

// Función principal para mostrar el menú
async function mostrarMenu(vista) {
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

      if (vista === "admin") {
        const botonAcciones = document.createElement("button");
        botonAcciones.textContent = "⋮";
        botonAcciones.classList.add("btn-acciones");

        // Menú de opciones oculto
        const menuOpciones = document.createElement("div");
        menuOpciones.classList.add("opciones");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "✏️ Editar";
        btnEditar.addEventListener("click", () => {
          menuOpciones.style.display = "none";
          editarComida(comida.id);
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "🗑️ Eliminar";
        btnEliminar.addEventListener("click", () => {
          eliminarComida(comida.id);
        });

        menuOpciones.appendChild(btnEditar);
        menuOpciones.appendChild(btnEliminar);

        tarjeta.appendChild(botonAcciones);
        tarjeta.appendChild(menuOpciones);

        botonAcciones.addEventListener("click", () => {
          menuOpciones.style.display =
            menuOpciones.style.display === "flex" ? "none" : "flex";
        });

        // Cerrar menú si se hace clic fuera
        document.addEventListener("click", (e) => {
          if (!tarjeta.contains(e.target)) {
            menuOpciones.style.display = "none";
          }
        });
      }

      contenedor.appendChild(tarjeta);
    });

  }catch(error){
    console.error("Error al cargar datos: ",error);
  }
}

// Eliminar
async function eliminarComida(id) {
  try{
    const res = await fetch(`${API_URL}/api/Productos/${id}`,{credentials: 'include', method: 'DELETE'});

    const data = await res.json();
    
  }catch(error){
    console.error("Error al eliminar: ",error);
  }
  mostrarMenu("admin");
}

// Editar
function editarComida(id) {
  const comida = comidas.find((c) => c.id === id);
  if (!comida) return;

  document.getElementById("modal").classList.remove("oculto");
  document.getElementById("titulo-modal").textContent = "Editar Plato";

  document.getElementById("nombre").value = comida.nombre;
  document.getElementById("descripcion").value = comida.descripcion;
  document.getElementById("precio").value = comida.precio;
  document.getElementById("cantidad").value = comida.cantidad;
  document.getElementById("imagen").value = comida.imagen;

  editandoId = id;
}

// Abrir modal para agregar
function abrirModal() {
  document.getElementById("modal").classList.remove("oculto");
  document.getElementById("titulo-modal").textContent = "Agregar Plato";

  document.getElementById("nombre").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("imagen").value = "";

  editandoId = null;
}

// Guardar cambios o agregar nuevo
document.getElementById("guardar")?.addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const imagen = document.getElementById("imagen").value;

  if (!nombre || !descripcion || !precio || !cantidad || !imagen) {
    alert("Por favor llena todos los campos.");
    return;
  }

  if (editandoId) {
    // Editar
    const comida = comidas.find((c) => c.id === editandoId);
    comida.nombre = nombre;
    comida.descripcion = descripcion;
    comida.precio = precio;
    comida.cantidad = cantidad;
    comida.imagen = imagen;
  } else {
    // Agregar
    const nuevaComida = {
      id: Date.now(),
      nombre,
      descripcion,
      precio,
      cantidad,
      imagen
    };
    comidas.push(nuevaComida);
  }

  document.getElementById("modal").classList.add("oculto");
  mostrarMenu("admin");
});

// Cancelar modal
document.getElementById("cancelar")?.addEventListener("click", () => {
  document.getElementById("modal").classList.add("oculto");
});

function CambiarVista(){
  window.location.href = "views/admin.html";
}