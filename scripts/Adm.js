import Platillo from "../Clases/Platillo.js";
import Categoria from "../Clases/Categoria.js";

const API_URL = "https://laimserver.duckdns.org";
let platillos = [];
let Categorias =[];
let editandoId = null;

async function ValidarSesion() {
  fetch('https://laimserver.duckdns.org/api/ValidarPIN', { credentials: 'include', method: 'GET' })
  .then(res => res.json())
  .then(data => {
    alert(data);
    if (!data.autenticado) {
      window.location.href = "login.html";
    }
  });
}

async function CargarCategorias() {

  try{
    Categorias.length=0;//vaciamos las categorias

    const response = await fetch(`${API_URL}/api/Categorias`);
    const CategoriasJson = await response.json();

    CategoriasJson.forEach(c => {
      Categorias.push(new Categoria(
        c.id,
        c.nombre,
        c.rutaImagen
      ));
    });

  }catch(error){
    console.error("Error al cargar datos: ",error);
  }
}

async function CargarPlatos() {
  
  try{
    platillos.length=0;//vaciamos los platillos

    const response = await fetch(`${API_URL}/api/Productos`);
    const platos = await response.json();

    platos.forEach(p => {
      platillos.push(new Platillo(
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.cantidad,
        p.rutaImagen,
        p.categoria
      ));
    });

  }catch(error){
    console.error("Error al cargar datos: ",error);
  }
}
  

// Función principal para mostrar el menú
async function mostrarMenu() {
  await CargarPlatos();
  await CargarCategorias();
  const contenedor = document.getElementById("contenedor-menu");
  contenedor.innerHTML = "";

  platillos.forEach((comida) => {
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

    contenedor.appendChild(tarjeta);
  });
}

// Eliminar
async function eliminarComida(id) {
  try{
    const res = await fetch(`${API_URL}/api/Productos/${id}`,{credentials: 'include', method: 'DELETE'});

    const data = await res.json();
    
  }catch(error){
    console.error("Error al eliminar: ",error);
  }
  mostrarMenu();
}

// Editar
function editarComida(id) {
  const comida = platillos.find((c) => c.id === id);
  if (!comida) return;

  document.getElementById("modal").classList.remove("oculto");
  document.getElementById("titulo-modal").textContent = "Editar Plato";

  document.getElementById("nombre").value = comida.nombre;
  document.getElementById("descripcion").value = comida.descripcion;
  document.getElementById("precio").value = comida.precio;
  document.getElementById("cantidad").value = comida.cantidad;
  document.getElementById("imagenPrevia").src=`${API_URL}${comida.imagen}`;
  document.getElementById("imagen").value=null;
  document.getElementById("Categorias").value=comida.categoria.id;

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
  document.getElementById("imagenPrevia").src="";
  document.getElementById("imagen").value = "";


  editandoId = null;
}

// Guardar cambios o agregar nuevo
document.getElementById("guardar")?.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const imagen = document.getElementById("imagen").value;
  const categoriaid = document.getElementById("Categorias").value;

  const datos= new FormData();
  datos.append("nombre",nombre);
  datos.append("precio",nombre);
  datos.append("descripcion",nombre);
  datos.append("cantidad",nombre);
  datos.append("imagen",nombre);
  datos.append("CategoriaId",nombre);


  if (!nombre || !descripcion || !precio || !cantidad || !imagen || !categoriaid) {
    alert("Por favor llena todos los campos.");
    return;
  }

  let res;

  if (editandoId) {
    // Editar
    res = await fetch(`${API_URL}/productos/${editandoId}`, {
                credentials: 'include',
                method: "PUT",
                body: datos
            });

  } else {
    // Agregar
    res = await fetch(`${API_URL}/productos`, {
                credentials: 'include',
                method: "POST",
                body: datos
            });
    };

    if(res.status === 401){
            alert("Sesión expirada. Por favor, ingresa nuevamente.");
            window.location.href = "../index.html";
        }

  document.getElementById("modal").classList.add("oculto");
  mostrarMenu();
});

// Cancelar modal
document.getElementById("cancelar")?.addEventListener("click", () => {
  document.getElementById("modal").classList.add("oculto");
});

function Recortar(){
  let cropper;

  const input=document.getElementById('imagen');
  const img=document.getElementById('imagenPrevia');
  
}

function cargarSelect(){
  const select=document.getElementById('Categorias');
  Categorias.forEach(c=>{
    const option=document.createElement('option');
    option.value=c.id;
    option.textContent=c.nombre;
    select.appendChild(option);
  });
}

function init(){
  ValidarSesion();
  mostrarMenu();
  cargarSelect();
}

init();